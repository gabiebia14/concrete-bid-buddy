
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Configuração de cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Chave da API OpenAI
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Carregando a configuração do agente
async function loadAgentConfig() {
  try {
    // Consultar diretamente a tabela que contém a configuração do agente
    const { data, error } = await supabase
      .from('agent_configs')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Erro ao carregar configuração do agente:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao carregar configuração do agente:', error);
    return null;
  }
}

// Função para processar o prompt do sistema com os dados do agente
function processSystemPrompt(agentConfig) {
  // Se não temos configuração, use um prompt padrão
  if (!agentConfig) {
    return `Você é um assistente da IPT Teixeira, especializado em produtos de concreto. 
    Sua missão é atender clientes, coletar informações e auxiliar na criação de orçamentos. 
    Seja sempre cordial, objetivo e certifique-se de obter as informações necessárias dos clientes.`;
  }
  
  // Se temos a configuração, use-a para formar o prompt
  return `${agentConfig.sistema_principal || ''}
  
  Você representa a empresa IPT Teixeira e deve:
  - Ser cordial e profissional
  - Responder em português do Brasil
  - Ajudar os clientes com informações sobre produtos de concreto
  - Auxiliar na criação de orçamentos
  - Coletar informações necessárias como nome, email, telefone e endereço quando necessário`;
}

// Função para gerar resposta usando OpenAI
async function generateOpenAIResponse(messages, sessionId) {
  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não está definida');
    }
    
    // Carregar configuração do agente
    const agentConfig = await loadAgentConfig();
    
    // Processar o prompt do sistema
    const systemPrompt = processSystemPrompt(agentConfig);
    
    // Preparar os mensagens para enviar à OpenAI
    const completeMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    
    // Fazer a chamada para a API da OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // Usando o modelo GPT-4o Mini para custo-benefício
        messages: completeMessages,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na API da OpenAI:', errorData);
      throw new Error(`Erro na API da OpenAI: ${response.status}`);
    }
    
    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    
    // Salvar a mensagem de resposta no banco de dados
    if (sessionId) {
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          content: aiMessage,
          role: 'assistant',
          created_at: new Date().toISOString()
        });
    }
    
    return aiMessage;
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    throw error;
  }
}

// Função para extrair dados de orçamento do chat
function extractQuoteData(messages) {
  try {
    // Simplificação: verificamos apenas as últimas mensagens para informações básicas
    // Em um caso real, pode-se usar uma função mais sofisticada da OpenAI para extrair entidades
    const messageText = messages.map(m => m.content).join(' ');
    
    const extractedData = {
      name: null,
      email: null,
      phone: null,
      address: null,
      products: []
    };
    
    // Tentativa simples de extrair um email
    const emailMatch = messageText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) extractedData.email = emailMatch[0];
    
    // Tentativa simples de extrair um telefone brasileiro
    const phoneMatch = messageText.match(/\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/);
    if (phoneMatch) extractedData.phone = phoneMatch[0];
    
    // Se encontramos produtos mencionados...
    if (messageText.includes('bloco') || messageText.includes('poste') || messageText.includes('laje')) {
      // Simplificação: detectamos a menção a produtos e adicionamos um genérico
      if (messageText.includes('bloco')) {
        extractedData.products.push({
          product_name: 'Bloco de Concreto',
          quantity: 1
        });
      }
      
      if (messageText.includes('poste')) {
        extractedData.products.push({
          product_name: 'Poste de Concreto',
          quantity: 1
        });
      }
      
      if (messageText.includes('laje')) {
        extractedData.products.push({
          product_name: 'Laje de Concreto',
          quantity: 1
        });
      }
    }
    
    return extractedData;
  } catch (error) {
    console.error('Erro ao extrair dados de orçamento:', error);
    return null;
  }
}

serve(async (req) => {
  // Lidar com requisições CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { messages, sessionId } = await req.json();
    
    // Verificar se temos mensagens válidas
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Formato de mensagens inválido');
    }
    
    // Processar a sessão
    let currentSessionId = sessionId;
    
    // Se não temos um ID de sessão, criar uma nova sessão
    if (!currentSessionId) {
      // Tentar extrair informações básicas para identificar o cliente
      const extractedData = extractQuoteData(messages);
      
      // Verificar se já temos um cliente com este email ou telefone
      let clientId = null;
      
      if (extractedData.email || extractedData.phone) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .or(`email.eq.${extractedData.email},phone.eq.${extractedData.phone}`)
          .maybeSingle();
          
        if (existingClient) {
          clientId = existingClient.id;
        }
      }
      
      // Se não encontramos um cliente, criar um novo "cliente potencial"
      if (!clientId) {
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert({
            name: extractedData.name || 'Cliente Potencial',
            email: extractedData.email || `potencial_${Date.now()}@temp.com`,
            phone: extractedData.phone || '',
            address: extractedData.address || '',
            created_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) {
          console.error('Erro ao criar cliente:', error);
        } else {
          clientId = newClient.id;
        }
      }
      
      // Criar nova sessão de chat
      if (clientId) {
        const { data: newSession, error } = await supabase
          .from('chat_sessions')
          .insert({
            client_id: clientId,
            status: 'active',
            created_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) {
          console.error('Erro ao criar sessão:', error);
        } else {
          currentSessionId = newSession.id;
          
          // Salvar a mensagem inicial do usuário
          await supabase
            .from('chat_messages')
            .insert({
              session_id: currentSessionId,
              content: messages[0].content,
              role: 'user',
              created_at: new Date().toISOString()
            });
        }
      }
    } else {
      // Se já temos um ID de sessão, salvar a última mensagem do usuário
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        await supabase
          .from('chat_messages')
          .insert({
            session_id: currentSessionId,
            content: lastUserMessage.content,
            role: 'user',
            created_at: new Date().toISOString()
          });
      }
    }
    
    // Gerar resposta da OpenAI
    const aiMessage = await generateOpenAIResponse(messages, currentSessionId);
    
    // Verificar se a conversa parece indicar um potencial orçamento
    const extractedData = extractQuoteData([...messages, { role: 'assistant', content: aiMessage }]);
    let quoteData = null;
    let quoteId = null;
    
    // Se temos produtos e dados suficientes, criar um orçamento
    if (extractedData.products.length > 0 && (extractedData.email || extractedData.phone)) {
      // Buscar o cliente associado à sessão
      const { data: sessionData } = await supabase
        .from('chat_sessions')
        .select('client_id')
        .eq('id', currentSessionId)
        .single();
        
      if (sessionData) {
        // Verificar se já existe um orçamento para esta sessão
        const { data: existingQuote } = await supabase
          .from('chat_sessions')
          .select('quote_id')
          .eq('id', currentSessionId)
          .not('quote_id', 'is', null)
          .single();
          
        if (!existingQuote) {
          // Transformar os produtos extraídos no formato esperado para orçamentos
          const quoteItems = extractedData.products.map(product => ({
            product_id: 'chat_extracted',  // Um identificador genérico
            product_name: product.product_name,
            dimensions: 'A definir',
            quantity: product.quantity,
            unit_price: 0, // Será definido posteriormente
            total_price: 0  // Será definido posteriormente
          }));
          
          // Criar orçamento
          quoteData = {
            client_id: sessionData.client_id,
            status: 'draft',
            items: quoteItems,
            total_value: 0, // Será calculado posteriormente
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: newQuote, error } = await supabase
            .from('quotes')
            .insert(quoteData)
            .select()
            .single();
            
          if (error) {
            console.error('Erro ao criar orçamento:', error);
          } else {
            quoteId = newQuote.id;
            
            // Atualizar a sessão com o ID do orçamento
            await supabase
              .from('chat_sessions')
              .update({ quote_id: quoteId })
              .eq('id', currentSessionId);
          }
        } else {
          quoteId = existingQuote.quote_id;
        }
      }
    }
    
    // Retornar a resposta
    return new Response(
      JSON.stringify({ 
        message: aiMessage, 
        sessionId: currentSessionId,
        quote_data: quoteData,
        quote_id: quoteId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro no processamento:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro no processamento da solicitação',
        message: 'Desculpe, estamos enfrentando problemas técnicos no momento. Por favor, tente novamente em alguns instantes.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
