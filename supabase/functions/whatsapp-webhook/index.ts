
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Criando o cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ehrerbpblmensiodhgka.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Token de verificação para o webhook
const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'sua-token-de-verificacao';
// URL da Evolution API
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || '';
// API Key da Evolution API
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || '';
// Instance Name da Evolution API (nome da instância configurada)
const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE') || 'default';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Verificação do webhook - Evolution API também pode usar verificação de webhook
  if (url.searchParams.has('hub.mode') && url.searchParams.get('hub.mode') === 'subscribe') {
    const verifyToken = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (verifyToken === VERIFY_TOKEN) {
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

      // Processar mensagens recebidas da Evolution API
      // O formato pode variar dependendo da configuração da Evolution API
      
      // Exemplo de extração da mensagem do formato da Evolution API
      let phoneNumber = '';
      let messageContent = '';
      let messageId = '';
      
      // Adaptação baseada no formato da Evolution API
      if (body.messages && body.messages.length > 0) {
        const message = body.messages[0];
        phoneNumber = message.from || message.sender || '';
        messageId = message.id || '';
        
        // Extrair o conteúdo baseado no tipo da mensagem
        if (message.text) {
          messageContent = message.text.body || message.text;
        } else if (message.interactive) {
          if (message.interactive.button_reply) {
            messageContent = message.interactive.button_reply.title;
          } else if (message.interactive.list_reply) {
            messageContent = message.interactive.list_reply.title;
          }
        }
      }
      
      // Verificar se temos os dados necessários
      if (phoneNumber && messageContent) {
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
          // Cliente encontrado
          clientId = clientData.id;
          console.log(`Cliente identificado: ${clientData.name} (ID: ${clientId})`);
        } else {
          // Cliente não encontrado, registrar como cliente potencial
          console.log(`Cliente não encontrado para o número ${phoneNumber}, registrando como potencial.`);
          
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
          .eq('client_id', clientId || phoneNumber) // Usar ID do cliente se disponível
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
              client_id: clientId || phoneNumber,
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
        
        // Chamar a função do chatbot para responder
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke("chat-assistant", {
          body: {
            messages: [{ role: 'user', content: messageContent }],
            sessionId: chatSession.id
          }
        });
        
        if (aiError) {
          throw new Error(`Erro ao chamar chatbot: ${aiError.message}`);
        }
        
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
          throw new Error(`Erro ao salvar resposta do assistente: ${saveAiError.message}`);
        }
        
        // Enviar resposta para o WhatsApp usando a Evolution API
        await enviarMensagemEvolutionAPI(phoneNumber, aiResponse.message);
        
        // Se temos dados de orçamento, processar
        if (aiResponse.quote_data) {
          console.log("Orçamento gerado a partir do WhatsApp:", aiResponse.quote_id);
          
          // Atualizar a sessão com o ID do orçamento
          if (aiResponse.quote_id) {
            await supabase
              .from('chat_sessions')
              .update({ quote_id: aiResponse.quote_id })
              .eq('id', chatSession.id);
          }
        }
      } else {
        console.log("Formato de mensagem não reconhecido ou dados insuficientes");
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

// Função para enviar mensagem via Evolution API
async function enviarMensagemEvolutionAPI(to: string, message: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.error('Configuração da Evolution API incompleta');
    return;
  }

  try {
    // Formatar número de telefone (remover o "+" se existir)
    const formattedNumber = to.startsWith('+') ? to.substring(1) : to;
    
    const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        number: formattedNumber,
        options: {
          delay: 1200
        },
        textMessage: {
          text: message
        }
      })
    });
    
    const data = await response.json();
    console.log('Resposta enviada via Evolution API:', data);
    return data;
  } catch (error) {
    console.error('Erro ao enviar mensagem via Evolution API:', error);
    throw error;
  }
}
