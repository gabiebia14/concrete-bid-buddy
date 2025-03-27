
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Criando o cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Token de verificação para o webhook do WhatsApp Cloud API
const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'ipt-teixeira-webhook-token';
// Token de acesso permanente do Facebook/WhatsApp
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN') || '';
// ID do número de telefone do WhatsApp
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Verificação do webhook - WhatsApp Cloud API
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const verifyToken = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Verifica se este é um request de verificação do webhook
    if (mode === 'subscribe' && verifyToken === VERIFY_TOKEN) {
      console.log('Webhook verificado com sucesso');
      return new Response(challenge, { 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 200
      });
    } else {
      console.error('Verificação falhou - token inválido');
      return new Response('Token de verificação inválido', { 
        headers: corsHeaders,
        status: 403 
      });
    }
  }

  try {
    // Processar eventos do webhook
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Webhook recebido:', JSON.stringify(body));

      // Processar mensagens recebidas do WhatsApp Cloud API
      if (body.object === 'whatsapp_business_account') {
        // Iterar por cada entrada (pode haver múltiplas)
        for (const entry of body.entry || []) {
          // Iterar por cada mudança dentro da entrada
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              const value = change.value;
              
              // Processar apenas mensagens recebidas
              if (value && value.messages && value.messages.length > 0) {
                for (const message of value.messages) {
                  if (message.type === 'text') {
                    const phoneNumber = message.from;
                    const messageContent = message.text.body;
                    const messageId = message.id;
                    
                    // Identificar cliente pelo número de telefone
                    const { data: clientData, error: clientError } = await supabase
                      .from('clients')
                      .select('*')
                      .eq('phone', phoneNumber)
                      .maybeSingle();
                      
                    let clientId = null;
                    let isNewClient = false;
                      
                    if (clientError) {
                      console.error('Erro ao buscar cliente:', clientError);
                    } else if (clientData) {
                      // Cliente encontrado
                      clientId = clientData.id;
                      console.log(`Cliente identificado: ${clientData.name} (ID: ${clientId})`);
                    } else {
                      // Cliente não encontrado, registrar como cliente potencial
                      console.log(`Cliente não encontrado para o número ${phoneNumber}, registrando como potencial.`);
                      isNewClient = true;
                      
                      try {
                        // Criar cliente potencial com o número de telefone
                        const { data: newClient, error: createError } = await supabase
                          .from('clients')
                          .insert({
                            name: `Cliente WhatsApp (${phoneNumber})`,
                            email: `whatsapp_${phoneNumber.replace(/\D/g, '')}@potencial.com`,
                            phone: phoneNumber,
                            address: null,
                            created_at: new Date().toISOString()
                          })
                          .select()
                          .single();
                          
                        if (createError) {
                          throw new Error(`Erro ao criar cliente potencial: ${createError.message}`);
                        }
                        
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
                      throw new Error(`Erro ao buscar sessão: ${sessionError.message}`);
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
                        throw new Error(`Erro ao criar sessão: ${createError.message}`);
                      }
                      
                      chatSession = newSession;
                    }
                    
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
                      throw new Error(`Erro ao salvar mensagem: ${saveError.message}`);
                    }
                    
                    // Chamar o endpoint do assistente de chat para processar a mensagem
                    try {
                      const response = await supabase.functions.invoke('chat-assistant', {
                        body: {
                          message: messageContent,
                          sessionId: chatSession.id,
                          clientId: clientId,
                          source: 'whatsapp',
                          name: clientData?.name || null,
                          email: clientData?.email || null,
                          phone: phoneNumber
                        }
                      });
                      
                      if (response.error) {
                        throw new Error(`Erro na resposta do assistente: ${response.error.message}`);
                      }
                      
                      // Enviar resposta para o WhatsApp usando a Cloud API
                      if (response.data && response.data.message) {
                        await enviarMensagemWhatsApp(phoneNumber, response.data.message);
                      }
                    } catch (error) {
                      console.error('Erro ao processar mensagem com o assistente:', error);
                      // Em caso de erro, enviar resposta padrão
                      await enviarMensagemWhatsApp(phoneNumber, 
                        "Desculpe, estamos enfrentando problemas técnicos no momento. Por favor, tente novamente em instantes.");
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    // Qualquer outro tipo de requisição
    return new Response('Método não suportado', { 
      headers: corsHeaders,
      status: 405 
    });
    
  } catch (error) {
    console.error('Erro no processamento do webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// Função para enviar mensagem via WhatsApp Cloud API
async function enviarMensagemWhatsApp(to: string, message: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('Configuração do WhatsApp API incompleta');
    return;
  }

  try {
    // Remover o "+" do número se existir
    const formattedNumber = to.startsWith('+') ? to.substring(1) : to;
    
    const url = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedNumber,
        type: "text",
        text: { 
          body: message 
        }
      })
    });
    
    const data = await response.json();
    console.log('Resposta enviada via WhatsApp Cloud API:', data);
    return data;
  } catch (error) {
    console.error('Erro ao enviar mensagem via WhatsApp Cloud API:', error);
    throw error;
  }
}
