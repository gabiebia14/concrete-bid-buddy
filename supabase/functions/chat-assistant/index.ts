
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

// Carregar modelo de agente
const modeloAgentePath = Deno.cwd() + '/src/data/modelo-agente.json';
let modeloAgente;
try {
  modeloAgente = JSON.parse(Deno.readTextFileSync(modeloAgentePath));
  console.log("Modelo de agente carregado com sucesso");
} catch (error) {
  console.error("Erro ao carregar modelo de agente:", error);
  modeloAgente = {
    "configuracao_agente": {
      "respostas_padrao": {
        "error": {
          "sistema_indisponivel": "Desculpe, estamos enfrentando problemas técnicos no momento. Por favor, tente novamente em alguns instantes."
        }
      }
    }
  };
}

// Função para processar mensagem e gerar resposta baseada no modelo de agente
async function processarMensagem(message, sessionId, clientInfo = null) {
  try {
    // Carregar histórico de mensagens para contexto
    const { data: messageHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (historyError) {
      console.error('Erro ao carregar histórico de mensagens:', historyError);
      return {
        message: modeloAgente.configuracao_agente.respostas_padrao.error.sistema_indisponivel
      };
    }
    
    // Carregar dados do cliente se tiver client_id
    let clientData = null;
    if (clientInfo && (clientInfo.clientId || clientInfo.email || clientInfo.phone)) {
      let query = supabase.from('clients').select('*');
      
      if (clientInfo.clientId) {
        query = query.eq('id', clientInfo.clientId);
      } else if (clientInfo.email) {
        query = query.eq('email', clientInfo.email);
      } else if (clientInfo.phone) {
        query = query.eq('phone', clientInfo.phone);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (!error && data) {
        clientData = data;
      }
    }
    
    // Determinar estado da conversa baseado no histórico
    const messageContent = message.toLowerCase();
    let resposta = "";
    let quoteData = null;
    
    // Verificar se cliente existe
    const isNewClient = !clientData;
    
    // Se for mensagem inicial ou cliente novo
    if (messageHistory.length <= 1 || isNewClient) {
      if (isNewClient && clientInfo && clientInfo.name) {
        // Criar novo cliente
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            name: clientInfo.name,
            email: clientInfo.email || `cliente_${Date.now()}@temporario.com`,
            phone: clientInfo.phone || null,
            address: null,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (!createError && newClient) {
          clientData = newClient;
          
          // Atualizar sessão com client_id
          await supabase
            .from('chat_sessions')
            .update({ client_id: newClient.id })
            .eq('id', sessionId);
        }
        
        resposta = modeloAgente.configuracao_agente.fluxo_de_conversacao.inicio.saudacao;
      } else {
        resposta = isNewClient ? 
          modeloAgente.configuracao_agente.fluxo_de_conversacao.inicio.identificacao_cliente.cliente_novo :
          modeloAgente.configuracao_agente.fluxo_de_conversacao.inicio.identificacao_cliente.cliente_existente.replace('{nome_cliente}', clientData.name);
      }
    } else {
      // Verificar se a mensagem inclui palavras-chave de produtos
      const categorias = modeloAgente.configuracao_agente.fluxo_de_conversacao.levantamento_necessidades.categorias;
      let categoriaEncontrada = null;
      
      for (const categoria of categorias) {
        if (messageContent.includes(categoria.nome.toLowerCase())) {
          categoriaEncontrada = categoria;
          break;
        }
      }
      
      if (categoriaEncontrada) {
        // Buscar produtos da categoria
        const { data: produtos, error: produtosError } = await supabase
          .from('products')
          .select('*')
          .eq('category', categoriaEncontrada.nome)
          .limit(5);
          
        if (produtosError) {
          console.error('Erro ao buscar produtos:', produtosError);
          resposta = modeloAgente.configuracao_agente.respostas_padrao.error.sistema_indisponivel;
        } else if (produtos && produtos.length > 0) {
          resposta = `Temos os seguintes produtos na categoria ${categoriaEncontrada.nome}:\n\n`;
          produtos.forEach((produto, index) => {
            resposta += `${index + 1}. ${produto.name}: ${produto.description}\n`;
          });
          
          // Adicionar perguntas específicas da categoria
          resposta += "\nPara ajudar no seu orçamento, preciso das seguintes informações:\n";
          categoriaEncontrada.perguntas_especificas.forEach((pergunta, index) => {
            resposta += `${index + 1}. ${pergunta}\n`;
          });
        } else {
          resposta = modeloAgente.configuracao_agente.respostas_padrao.error.produto_nao_encontrado;
        }
      } else if (messageContent.includes("orçamento") || 
                messageContent.includes("cotação") || 
                messageContent.includes("preço")) {
        // Resposta para pedido de orçamento genérico
        resposta = modeloAgente.configuracao_agente.fluxo_de_conversacao.levantamento_necessidades.produtos.pergunta_inicial;
      } else if (messageContent.includes("entrega") || messageContent.includes("enviar")) {
        // Perguntas sobre entrega
        resposta = modeloAgente.configuracao_agente.detalhes_entrega.perguntas[0].pergunta;
      } else if (messageContent.includes("pagamento") || messageContent.includes("pagar")) {
        // Perguntas sobre pagamento
        resposta = modeloAgente.configuracao_agente.forma_pagamento.pergunta + "\nOpções:\n";
        modeloAgente.configuracao_agente.forma_pagamento.opcoes.forEach((opcao, index) => {
          resposta += `${index + 1}. ${opcao}\n`;
        });
      } else if (messageContent.includes("confirmar") || messageContent.includes("finalizar")) {
        // Criar um orçamento de exemplo para demonstração
        if (clientData) {
          quoteData = {
            cliente: {
              nome: clientData.name,
              email: clientData.email,
              telefone: clientData.phone
            },
            produtos: [
              {
                nome: "Produto de exemplo",
                especificacoes: "Dimensões padrão",
                quantidade: 10
              }
            ],
            entrega: {
              local: clientData.address || "A definir",
              prazo: "A definir com o cliente"
            },
            forma_pagamento: "A definir com o cliente"
          };
          
          resposta = modeloAgente.configuracao_agente.confirmacao.confirmacao_final;
        } else {
          resposta = "Para finalizar seu orçamento, preciso de algumas informações adicionais. Poderia me informar seu nome completo e um email para contato?";
        }
      } else {
        // Resposta genérica
        resposta = modeloAgente.configuracao_agente.respostas_padrao.solicitar_complemento;
      }
    }
    
    return {
      message: resposta,
      quote_data: quoteData
    };
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return {
      message: modeloAgente.configuracao_agente.respostas_padrao.error.sistema_indisponivel,
      error: error.message
    };
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
    // Extrair o corpo da requisição
    const requestData = await req.json();
    
    // Extrair parâmetros da requisição
    const { message, sessionId, clientId, source = 'web', name, email, phone } = requestData;
    
    // Verificar se temos um sessionId válido
    if (!sessionId) {
      return new Response(
        JSON.stringify({ 
          error: "session_id_required",
          message: "É necessário fornecer um ID de sessão válido."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Montar informações do cliente
    const clientInfo = {
      clientId: clientId,
      name: name,
      email: email,
      phone: phone,
      source: source
    };
    
    // Processar a mensagem
    const processedResponse = await processarMensagem(message, sessionId, clientInfo);
    
    // Salvar a mensagem no banco de dados
    if (processedResponse.message) {
      const { error: messageSaveError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          content: processedResponse.message,
          role: 'assistant',
          created_at: new Date().toISOString()
        });
      
      if (messageSaveError) {
        console.error("Erro ao salvar mensagem:", messageSaveError);
      }
    }
    
    // Processar dados de orçamento se presentes
    let quote = null;
    if (processedResponse.quote_data) {
      console.log("Dados de orçamento detectados:", processedResponse.quote_data);
      quote = await saveQuoteData(processedResponse.quote_data, sessionId, clientId);
    }
    
    return new Response(
      JSON.stringify({
        message: processedResponse.message,
        session_id: sessionId,
        quote_data: processedResponse.quote_data,
        quote_id: quote?.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
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
