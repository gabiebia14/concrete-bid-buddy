
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Criando o cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Token de verificação para o webhook do WhatsApp Cloud API
const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || '';
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
                    
                    // Enviar resposta para o WhatsApp usando a Cloud API
                    await enviarMensagemWhatsApp(phoneNumber, aiResponse.message);
                    
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
