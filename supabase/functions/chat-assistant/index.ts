
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurar cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// URL do webhook do n8n corrigida
const n8nWebhookUrl = "https://gbservin8n.sevirenostrinta.com.br/webhook-test/chat-assistant";
// URL alternativa se a principal falhar
const backupWebhookUrl = 'https://webhook.site/3fe88e76-a025-48ba-85fc-3a03b8be9d75'; // Substitua por um webhook real de backup

console.log("Iniciando função chat-assistant com URL: " + supabaseUrl);
console.log("URL do webhook n8n: " + n8nWebhookUrl);
console.log("URL do webhook de backup: " + backupWebhookUrl);

// Função para salvar os dados de orçamento extraídos no Supabase
async function saveQuoteData(quoteData, sessionId, clientId = null) {
  try {
    if (!quoteData || !quoteData.produtos || quoteData.produtos.length === 0) return null;
    
    // Primeiro, verificar se já existe um cliente com o email fornecido
    let finalClientId = clientId;
    
    if (quoteData.cliente && quoteData.cliente.email) {
      const { data: existingClients, error } = await supabase
        .from('clients')
        .select('id')
        .eq('email', quoteData.cliente.email)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao buscar cliente:", error);
        throw error;
      }
      
      if (existingClients) {
        finalClientId = existingClients.id;
        
        // Atualizar os dados do cliente se necessário
        await supabase
          .from('clients')
          .update({
            name: quoteData.cliente.nome || existingClients.name,
            phone: quoteData.cliente.telefone || existingClients.phone,
            address: quoteData.entrega?.local || existingClients.address
          })
          .eq('id', finalClientId);
      } else if (quoteData.cliente.nome) {
        // Criar novo cliente
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: quoteData.cliente.nome,
            email: quoteData.cliente.email,
            phone: quoteData.cliente.telefone || '',
            address: quoteData.entrega?.local || ''
          })
          .select()
          .single();
        
        if (clientError) {
          console.error("Erro ao criar cliente:", clientError);
          throw clientError;
        }
        
        finalClientId = newClient.id;
      }
    }

    // Preparar os itens do orçamento
    const quoteItems = quoteData.produtos.map(produto => ({
      product_id: '', // Idealmente, deveríamos buscar o ID do produto pelo nome
      product_name: produto.nome,
      dimensions: produto.especificacoes || '',
      quantity: produto.quantidade || 0,
      unit_price: null, // Preço será definido pela equipe de vendas
      total_price: null
    }));

    // Criar o orçamento
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        client_id: finalClientId || '00000000-0000-0000-0000-000000000000', // Valor padrão se não houver cliente
        status: 'pending',
        items: quoteItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (quoteError) {
      console.error("Erro ao criar orçamento:", quoteError);
      throw quoteError;
    }
    
    // Atualizar a sessão de chat com o ID do orçamento criado
    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .update({ 
        status: 'completed',
        quote_id: quote.id 
      })
      .eq('id', sessionId);

    if (sessionError) {
      console.error("Erro ao atualizar sessão de chat:", sessionError);
    }

    console.log(`Orçamento criado com ID: ${quote.id}`);
    return quote;
  } catch (error) {
    console.error('Erro ao salvar dados do orçamento:', error);
    return null;
  }
}

// Função para usar o webhook do n8n
async function callN8nWebhook(payload) {
  try {
    console.log(`Chamando webhook n8n em: ${n8nWebhookUrl}`);
    console.log(`Payload: ${JSON.stringify(payload)}`);
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na resposta do webhook principal: ${response.status}`, errorText);
      
      // Tentar webhook de backup
      console.log(`Tentando webhook de backup em: ${backupWebhookUrl}`);
      const backupResponse = await fetch(backupWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!backupResponse.ok) {
        throw new Error(`Erro na resposta do webhook de backup: ${backupResponse.status}`);
      }
      
      console.log("Webhook de backup respondeu com sucesso");
      const backupData = await backupResponse.json();
      return backupData;
    }
    
    const data = await response.json();
    console.log(`Resposta do webhook: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    console.error("Erro ao chamar webhooks:", error);
    throw error;
  }
}

// Função principal que processa as requisições
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, clientId, source = 'web', name, email, phone } = await req.json();
    console.log(`Processando requisição de chat para sessão ${sessionId} com a mensagem: "${message.substring(0, 50)}..."`);
    console.log(`Fonte: ${source}, ClientID: ${clientId || 'não fornecido'}`);
    
    try {
      console.log("Chamando webhook do n8n...");
      const n8nResponse = await callN8nWebhook({
        message, 
        sessionId, 
        clientId, 
        source,
        name,
        email,
        phone
      });
      
      console.log("Resposta do webhook obtida com sucesso:", n8nResponse);
      
      // Salvar a mensagem no banco de dados se necessário
      if (n8nResponse.message) {
        const { error: messageSaveError } = await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            content: n8nResponse.message,
            role: 'assistant',
            created_at: new Date().toISOString()
          });
        
        if (messageSaveError) {
          console.error("Erro ao salvar mensagem:", messageSaveError);
        }
      }
      
      // Processar dados de orçamento se presentes
      let quote = null;
      if (n8nResponse.quote_data) {
        console.log("Dados do orçamento detectados na resposta do webhook:", n8nResponse.quote_data);
        quote = await saveQuoteData(n8nResponse.quote_data, sessionId, clientId);
      }
      
      return new Response(
        JSON.stringify({
          message: n8nResponse.message || "Desculpe, não consegui processar sua mensagem.",
          session_id: sessionId,
          quote_data: n8nResponse.quote_data,
          quote_id: quote?.id || n8nResponse.quote_id
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (n8nError) {
      console.error("Falha ao usar webhooks:", n8nError);
      
      // Salvar mensagem de erro no banco de dados
      const errorMessageContent = "Desculpe, estou enfrentando problemas técnicos no momento. Nossa equipe foi notificada. Por favor, tente novamente em alguns instantes.";
      
      try {
        await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            content: errorMessageContent,
            role: 'assistant',
            created_at: new Date().toISOString()
          });
      } catch (dbError) {
        console.error("Erro ao salvar mensagem de erro:", dbError);
      }
      
      // Retornar resposta de erro ao usuário
      return new Response(
        JSON.stringify({ 
          message: errorMessageContent,
          error: n8nError.message 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "Houve um erro ao processar sua solicitação. Por favor, tente novamente."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
