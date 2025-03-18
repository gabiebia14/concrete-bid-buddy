
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Importações do Baileys (via ESM)
import { default as makeWASocket, DisconnectReason, useMultiFileAuthState } from 'https://esm.sh/@whiskeysockets/baileys@6.6.0';
import { Boom } from 'https://esm.sh/@hapi/boom@10.0.1';
import { writeFile, mkdir } from 'https://deno.land/std@0.170.0/fs/mod.ts';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Controle de estado e socket
let waSocket: any = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Caminho onde os dados de autenticação serão armazenados
const SESSION_PATH = Deno.env.get('BAILEYS_SESSION_PATH') || '/tmp/baileys_auth';

// Função para criar diretório se não existir
async function ensureDirectoryExists(path: string) {
  try {
    await Deno.stat(path);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await mkdir(path, { recursive: true });
    } else {
      throw error;
    }
  }
}

// Função para salvar o estado de autenticação
async function saveAuthState(state: any, path: string) {
  try {
    await ensureDirectoryExists(path);
    await writeFile(`${path}/auth_info_baileys.json`, JSON.stringify(state));
    console.log('Estado de autenticação salvo com sucesso');
  } catch (error) {
    console.error('Erro ao salvar estado de autenticação:', error);
  }
}

// Função para iniciar a conexão com o WhatsApp
async function startWhatsAppConnection() {
  try {
    // Criar diretório se não existir
    await ensureDirectoryExists(SESSION_PATH);
    
    // Inicializar o estado de autenticação
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
    
    // Inicializar a conexão
    const sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      browser: ['IPT Teixeira Assistant', 'Chrome', '10.0.0'],
      syncFullHistory: false
    });
    
    // Salvar credenciais quando houver alterações
    sock.ev.on('creds.update', saveCreds);
    
    // Gerenciar eventos de conexão
    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        // Registrar o QR code no console para ser escaneado
        console.log('QR CODE:', qr);
        
        // Opcionalmente, salvar o QR code no Supabase para acesso posterior
        await supabase
          .from('whatsapp_sessions')
          .upsert({ 
            id: 'latest_qr',
            qr_code: qr,
            updated_at: new Date().toISOString()
          });
      }
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        console.log('Conexão com WhatsApp fechada devido a:', lastDisconnect?.error?.message);
        
        if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`Tentativa de reconexão ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
          startWhatsAppConnection();
        } else if (!shouldReconnect) {
          console.log('Desconectado permanentemente, será necessário um novo login');
          // Limpar os dados da sessão para forçar novo QR code
          await saveAuthState({}, SESSION_PATH);
        } else {
          console.log('Número máximo de tentativas de reconexão atingido');
        }
      } else if (connection === 'open') {
        console.log('Conexão com WhatsApp estabelecida!');
        reconnectAttempts = 0;
        
        // Registrar o telefone conectado
        const phoneNumber = sock.user?.id?.split(':')[0];
        console.log('Número de telefone conectado:', phoneNumber);
        
        // Salvar informações da sessão
        await supabase
          .from('whatsapp_sessions')
          .upsert({ 
            id: 'active_session',
            phone_number: phoneNumber,
            status: 'connected',
            updated_at: new Date().toISOString()
          });
      }
    });
    
    // Gerenciar mensagens recebidas
    sock.ev.on('messages.upsert', async (m: any) => {
      const msg = m.messages[0];
      
      if (!msg.key.fromMe && m.type === 'notify') {
        console.log('Nova mensagem recebida:', JSON.stringify(msg, null, 2));
        
        if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
          // Extrair informações da mensagem
          const phoneNumber = msg.key.remoteJid.split('@')[0];
          const messageContent = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
          
          // Identificar cliente pelo número de telefone
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('phone', phoneNumber)
            .maybeSingle();
          
          let clientId = null;
          
          if (clientError) {
            console.error('Erro ao buscar cliente:', clientError);
          } else if (clientData) {
            clientId = clientData.id;
            console.log(`Cliente identificado: ${clientData.name} (ID: ${clientId})`);
          } else {
            // Cliente não encontrado, registrar como cliente potencial
            console.log(`Cliente não encontrado para o número ${phoneNumber}, registrando como potencial`);
            
            try {
              const { data: newClient, error: createError } = await supabase
                .from('clients')
                .insert({
                  name: `Cliente WhatsApp (${phoneNumber})`,
                  email: `whatsapp_${phoneNumber.replace(/\D/g, '')}@potencial.com`,
                  phone: phoneNumber,
                  created_at: new Date().toISOString()
                })
                .select()
                .single();
              
              if (createError) throw createError;
              clientId = newClient.id;
              console.log(`Cliente potencial criado com ID: ${clientId}`);
            } catch (e) {
              console.error('Erro ao criar cliente potencial:', e);
            }
          }
          
          // Buscar ou criar sessão para este usuário
          let chatSession;
          const { data: existingSessions, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('status', 'active')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (sessionError) {
            console.error('Erro ao buscar sessão:', sessionError);
          }
          
          if (existingSessions && existingSessions.length > 0) {
            chatSession = existingSessions[0];
          } else {
            // Criar nova sessão
            const { data: newSession, error: createError } = await supabase
              .from('chat_sessions')
              .insert({
                client_id: clientId,
                status: 'active',
                created_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Erro ao criar sessão:', createError);
            } else {
              chatSession = newSession;
            }
          }
          
          if (chatSession) {
            // Salvar mensagem do usuário
            const { error: saveError } = await supabase
              .from('chat_messages')
              .insert({
                session_id: chatSession.id,
                content: messageContent,
                role: 'user',
                created_at: new Date().toISOString()
              });
            
            if (saveError) {
              console.error('Erro ao salvar mensagem:', saveError);
            }
            
            // Chamar a função do chatbot para responder
            try {
              const { data: aiResponse, error: aiError } = await supabase.functions.invoke("chat-assistant", {
                body: {
                  messages: [{ role: 'user', content: messageContent }],
                  sessionId: chatSession.id
                }
              });
              
              if (aiError) throw aiError;
              
              // Salvar resposta do assistente
              const { error: saveAiError } = await supabase
                .from('chat_messages')
                .insert({
                  session_id: chatSession.id,
                  content: aiResponse.message,
                  role: 'assistant',
                  created_at: new Date().toISOString()
                });
              
              if (saveAiError) {
                console.error('Erro ao salvar resposta do assistente:', saveAiError);
              }
              
              // Enviar resposta para o WhatsApp
              await sock.sendMessage(msg.key.remoteJid, { text: aiResponse.message });
              
              // Registrar dados de orçamento, se houver
              if (aiResponse.quote_data && aiResponse.quote_id) {
                console.log("Orçamento gerado:", aiResponse.quote_id);
                
                await supabase
                  .from('chat_sessions')
                  .update({ quote_id: aiResponse.quote_id })
                  .eq('id', chatSession.id);
              }
              
            } catch (error) {
              console.error('Erro ao processar resposta do assistente:', error);
              // Enviar mensagem de fallback em caso de erro
              await sock.sendMessage(msg.key.remoteJid, { 
                text: "Desculpe, estamos enfrentando problemas técnicos. Nossa equipe já foi notificada e estamos trabalhando para resolver o mais rápido possível." 
              });
            }
          }
        }
      }
    });
    
    waSocket = sock;
    return sock;
    
  } catch (error) {
    console.error('Erro ao iniciar conexão WhatsApp:', error);
    throw error;
  }
}

// Endpoint para iniciar o serviço
serve(async (req) => {
  // Tratar requisições CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  const endpoint = url.pathname.split('/').pop();
  
  try {
    // Iniciar conexão com WhatsApp
    if (endpoint === 'start' && req.method === 'POST') {
      if (!waSocket || waSocket.user === undefined) {
        await startWhatsAppConnection();
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Serviço WhatsApp iniciado. Verifique os logs para obter o QR code.',
            status: 'starting'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Serviço WhatsApp já está em execução',
            status: 'running',
            connected: waSocket.user !== undefined
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Verificar status da conexão
    if (endpoint === 'status' && req.method === 'GET') {
      const status = waSocket ? (waSocket.user ? 'connected' : 'waiting_for_qr') : 'disconnected';
      const phoneNumber = waSocket?.user?.id?.split(':')[0] || null;
      
      return new Response(
        JSON.stringify({ 
          status,
          phoneNumber,
          connected: status === 'connected'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Obter QR code atual
    if (endpoint === 'qr' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('qr_code, updated_at')
        .eq('id', 'latest_qr')
        .single();
      
      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'QR code não disponível' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, qr: data.qr_code, updated_at: data.updated_at }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Enviar mensagem 
    if (endpoint === 'send' && req.method === 'POST') {
      const { phoneNumber, message } = await req.json();
      
      if (!waSocket || !waSocket.user) {
        return new Response(
          JSON.stringify({ success: false, error: 'WhatsApp não conectado' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Formatar número para o padrão WhatsApp
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber.substring(1) + '@s.whatsapp.net'
        : phoneNumber + '@s.whatsapp.net';
      
      // Enviar mensagem
      await waSocket.sendMessage(formattedNumber, { text: message });
      
      return new Response(
        JSON.stringify({ success: true, message: 'Mensagem enviada com sucesso' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Reiniciar conexão (útil para quando precisar gerar novo QR code)
    if (endpoint === 'restart' && req.method === 'POST') {
      // Fechar conexão atual se existir
      if (waSocket) {
        waSocket.end();
        waSocket = null;
      }
      
      // Limpar dados de sessão para gerar novo QR
      await saveAuthState({}, SESSION_PATH);
      
      // Iniciar nova conexão
      await startWhatsAppConnection();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conexão reiniciada. Verifique os logs para obter o novo QR code.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Qualquer outro endpoint não reconhecido
    return new Response(
      JSON.stringify({ error: 'Endpoint não encontrado' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Erro no processamento da requisição:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Iniciar conexão automaticamente quando a função é invocada pela primeira vez
startWhatsAppConnection().catch(console.error);
