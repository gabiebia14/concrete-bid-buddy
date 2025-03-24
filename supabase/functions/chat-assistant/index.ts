
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import OpenAI from "https://esm.sh/openai@4.28.4";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurar cliente OpenAI
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});

// Configurar cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Iniciando função chat-assistant com URL: " + supabaseUrl);

// Função para criar o assistente caso não exista
async function getOrCreateAssistant() {
  try {
    // Verificar se o ID do assistente está armazenado no Supabase
    const { data: assistantConfig, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'openai_assistant_id')
      .single();
    
    if (error) {
      console.error("Erro ao buscar configuração do assistente:", error);
      // Se a tabela não existir, vamos criá-la
      try {
        await supabase.rpc('create_config_if_not_exists');
        console.log("Tabela config criada com sucesso");
      } catch (createError) {
        console.error("Erro ao criar tabela config:", createError);
      }
    }
    
    if (assistantConfig?.value) {
      console.log(`Assistente encontrado com ID: ${assistantConfig.value}`);
      return assistantConfig.value;
    }
    
    // Se não existir, criar um novo assistente
    console.log("Criando novo assistente com GPT-4o...");
    const assistant = await openai.beta.assistants.create({
      name: "Assistente de Vendas IPT Teixeira",
      description: "Assistente especializado em vendas de produtos de concreto da IPT Teixeira usando GPT-4o",
      instructions: `Você é um ASSISTENTE DE Vendas com especialização e 20 anos de experiência em conduzir negociações para a IPT Teixeira, líder na produção de artefatos de concreto há mais de 30 anos.

REGRAS DE ATENDIMENTO IMPORTANTES (SIGA ESTRITAMENTE):
1. Após a primeira mensagem do cliente, cumprimente com: "Olá, sou o assistente de vendas da IPT Teixeira, uma empresa líder na fabricação de artefatos de concreto há mais de 35 anos. Como posso ajudá-lo hoje?"

2. TIPOS DE PRODUTOS QUE REQUEREM PERGUNTAS ESPECÍFICAS:
- Para TUBOS: SEMPRE pergunte qual classe (PA1, PA2, PA3, etc.) quando o cliente mencionar tubos
- Para POSTES: SEMPRE pergunte primeiro se é circular ou duplo T
- NUNCA prossiga com um orçamento sem confirmar estas especificações!

3. IDENTIFICAÇÃO DE NECESSIDADES (SEMPRE COLETE ESTAS INFORMAÇÕES):
- Produto exato necessário
- Especificações técnicas (classe, tipo, formato)
- Quantidades de cada item
- Localização de entrega
- Prazo necessário
- Forma de pagamento desejada

4. RESTRIÇÕES:
- Não especule sobre valores
- Não faça suposições sobre finalidades
- Não force fechamento de negócio

5. APÓS COLETAR INFORMAÇÕES:
- Ofereça produtos complementares relacionados
- Confirme satisfação do cliente
- Prepare informações para equipe de vendas

6. FINALIZAÇÃO DO ORÇAMENTO:
- Sempre que perceber que o cliente finalizou seu pedido, resuma todas as informações coletadas
- Confirme os dados e avise que o orçamento será encaminhado para análise
- Agradeça o cliente pelo contato`,
      model: "gpt-4o",
      tools: [
        {
          type: "function",
          function: {
            name: "extract_quote_data",
            description: "Extrair dados estruturados de orçamento da conversa atual",
            parameters: {
              type: "object",
              properties: {
                produtos: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nome: { type: "string", description: "Nome do produto" },
                      quantidade: { type: "number", description: "Quantidade solicitada" },
                      especificacoes: { type: "string", description: "Especificações (classe, dimensões, tipo)" }
                    },
                    required: ["nome", "quantidade"]
                  }
                },
                cliente: {
                  type: "object",
                  properties: {
                    nome: { type: "string", description: "Nome do cliente" },
                    email: { type: "string", description: "Email do cliente" },
                    telefone: { type: "string", description: "Telefone do cliente" }
                  }
                },
                entrega: {
                  type: "object",
                  properties: {
                    local: { type: "string", description: "Local de entrega" },
                    prazo: { type: "string", description: "Prazo de entrega solicitado" }
                  }
                },
                pagamento: {
                  type: "object",
                  properties: {
                    forma: { type: "string", description: "Forma de pagamento mencionada" }
                  }
                },
                status: {
                  type: "object",
                  properties: {
                    completo: { type: "boolean", description: "O orçamento contém todas as informações necessárias?" },
                    faltando: { type: "array", items: { type: "string" }, description: "Informações que ainda precisam ser coletadas" }
                  }
                }
              },
              required: ["produtos"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "fetch_products_by_category",
            description: "Buscar produtos por categoria",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string", description: "Categoria de produtos (ex: tubos, blocos, postes)" }
              },
              required: ["category"]
            }
          }
        }
      ]
    });
    
    // Armazenar ID do assistente no Supabase
    const { error: upsertError } = await supabase
      .from('config')
      .upsert({ 
        key: 'openai_assistant_id', 
        value: assistant.id, 
        updated_at: new Date().toISOString() 
      });
    
    if (upsertError) {
      console.error("Erro ao salvar ID do assistente:", upsertError);
      throw upsertError;
    }
    
    console.log(`Novo assistente GPT-4o criado com ID: ${assistant.id}`);
    return assistant.id;
  } catch (error) {
    console.error("Erro ao criar/obter assistente:", error);
    throw error;
  }
}

// Função para buscar produtos por categoria
async function fetchProductsByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('category', `%${category}%`);
    
    if (error) throw error;
    console.log(`Buscados ${data.length} produtos na categoria ${category}`);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar produtos da categoria ${category}:`, error);
    return [];
  }
}

// Função para buscar cliente por telefone
async function fetchClientByPhone(phone) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Erro ao buscar cliente pelo telefone ${phone}:`, error);
    return null;
  }
}

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

// Função principal que processa as requisições
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, clientId, source = 'web' } = await req.json();
    console.log(`Processando requisição de chat para sessão ${sessionId} com a mensagem: "${message.substring(0, 50)}..."`);
    console.log(`Fonte: ${source}, ClientID: ${clientId || 'não fornecido'}`);
    
    // Verificar se temos as variáveis de ambiente necessárias
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY não configurada na função edge");
    }
    
    // Obter ou criar o assistente
    const assistantId = await getOrCreateAssistant();
    
    // Verificar se já existe um thread para esta sessão
    let threadId;
    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('thread_id')
      .eq('id', sessionId)
      .single();
    
    if (sessionError) {
      console.error("Erro ao buscar sessão:", sessionError);
    }
    
    if (sessionData?.thread_id) {
      threadId = sessionData.thread_id;
      console.log(`Thread existente encontrado: ${threadId}`);
    } else {
      // Criar um novo thread
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      
      // Salvar o thread_id na sessão
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ thread_id: threadId })
        .eq('id', sessionId);
      
      if (updateError) {
        console.error("Erro ao atualizar thread_id na sessão:", updateError);
      }
      
      console.log(`Novo thread criado: ${threadId}`);
    }
    
    // Adicionar a mensagem ao thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message
    });
    
    // Executar o assistente
    console.log(`Executando assistente ${assistantId} no thread ${threadId}`);
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    
    // Aguardar a conclusão do run
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    while (runStatus.status !== 'completed' && 
           runStatus.status !== 'failed' && 
           runStatus.status !== 'cancelled' && 
           runStatus.status !== 'expired') {
      
      // Se precisar de ação
      if (runStatus.status === 'requires_action') {
        // Processar ferramentas solicitadas
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];
        
        for (const toolCall of toolCalls) {
          if (toolCall.function.name === 'extract_quote_data') {
            // Extrair dados da conversa
            const args = JSON.parse(toolCall.function.arguments);
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify(args)
            });
          } else if (toolCall.function.name === 'fetch_products_by_category') {
            // Buscar produtos
            const args = JSON.parse(toolCall.function.arguments);
            const products = await fetchProductsByCategory(args.category);
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify(products)
            });
          }
        }
        
        // Submeter as respostas das ferramentas
        await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
          tool_outputs: toolOutputs
        });
      }
      
      // Aguardar um pouco antes de verificar novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }
    
    if (runStatus.status !== 'completed') {
      throw new Error(`Execução falhou com status: ${runStatus.status}`);
    }
    
    // Buscar as mensagens geradas pelo assistente
    const messagesResponse = await openai.beta.threads.messages.list(threadId);
    const assistantMessages = messagesResponse.data.filter(msg => 
      msg.role === 'assistant' && 
      msg.run_id === run.id
    );
    
    if (assistantMessages.length === 0) {
      throw new Error("Nenhuma resposta gerada pelo assistente");
    }
    
    // Formatar a resposta
    const latestAssistantMessage = assistantMessages[0];
    let responseText = "";
    
    for (const content of latestAssistantMessage.content) {
      if (content.type === 'text') {
        responseText += content.text.value;
      }
    }
    
    // Salvar a mensagem no banco de dados
    const { error: messageSaveError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        content: responseText,
        role: 'assistant',
        created_at: new Date().toISOString()
      });
    
    if (messageSaveError) {
      console.error("Erro ao salvar mensagem:", messageSaveError);
    }
    
    // Verificar se foram extraídos dados de orçamento
    let quoteData = null;
    let quote = null;
    
    if (runStatus.tool_calls) {
      for (const toolCall of runStatus.tool_calls) {
        if (toolCall.function.name === 'extract_quote_data') {
          try {
            quoteData = JSON.parse(toolCall.function.arguments);
            
            if (quoteData.produtos && quoteData.produtos.length > 0) {
              console.log("Dados do orçamento detectados:", quoteData);
              quote = await saveQuoteData(quoteData, sessionId, clientId);
            }
          } catch (error) {
            console.error("Erro ao processar dados do orçamento:", error);
          }
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: responseText,
        session_id: sessionId,
        quote_data: quoteData,
        quote_id: quote?.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro ao processar requisição:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
