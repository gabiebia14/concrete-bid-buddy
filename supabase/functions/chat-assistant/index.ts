
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

// Obter API key da OpenAI
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
      "openai": {
        "modelo_principal": "gpt-4o-mini",
        "sistema_principal": "Você é um assistente de atendimento ao cliente."
      },
      "respostas_padrao": {
        "error": {
          "sistema_indisponivel": "Desculpe, estamos enfrentando problemas técnicos no momento. Por favor, tente novamente em alguns instantes."
        }
      }
    }
  };
}

// Função para processar mensagem com a OpenAI
async function processarComOpenAI(mensagem, historico = [], sistema = "") {
  if (!OPENAI_API_KEY) {
    console.error("API key da OpenAI não configurada");
    return "Erro de configuração do sistema. Por favor, contate o suporte.";
  }

  try {
    const mensagens = [
      { role: "system", content: sistema || modeloAgente.configuracao_agente.openai.sistema_principal },
      ...historico.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: "user", content: mensagem }
    ];

    console.log("Enviando para OpenAI:", JSON.stringify(mensagens));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: modeloAgente.configuracao_agente.openai.modelo_principal,
        messages: mensagens,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API OpenAI: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Resposta da OpenAI:", data);
    
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("Erro ao chamar a API OpenAI:", error);
    return modeloAgente.configuracao_agente.respostas_padrao.error.sistema_indisponivel;
  }
}

// Função para identificar intenção e extrair dados de orçamento
async function identificarIntencao(mensagem, historico = []) {
  if (!OPENAI_API_KEY) {
    console.error("API key da OpenAI não configurada");
    return { intencao: "erro", dados: null };
  }

  try {
    const prompt = `
    Analise a mensagem do usuário e identifique a intenção principal. Responda apenas com um JSON no seguinte formato:
    {
      "intencao": "saudacao | informacao_produto | solicitar_orcamento | dados_cliente | confirmacao",
      "categoria_produto": "blocos | postes | lajes | outro | null",
      "dados": {
        "nome": "nome do cliente (se mencionado)",
        "email": "email do cliente (se mencionado)",
        "telefone": "telefone do cliente (se mencionado)",
        "endereco": "endereço de entrega (se mencionado)",
        "produtos": [
          {
            "tipo": "tipo do produto mencionado",
            "especificacoes": "especificações mencionadas",
            "quantidade": "quantidade mencionada"
          }
        ]
      }
    }
    `;

    const mensagens = [
      { role: "system", content: prompt },
      ...historico.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: "user", content: mensagem }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: mensagens,
        temperature: 0.2,
        max_tokens: 500
      })
    });
    
    const data = await response.json();
    console.log("Análise de intenção:", data.choices[0].message.content);
    
    try {
      // Tente fazer o parse do JSON retornado pela OpenAI
      return JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error("Erro ao fazer parse da análise:", parseError);
      return { intencao: "desconhecida", dados: null };
    }
    
  } catch (error) {
    console.error("Erro ao analisar intenção:", error);
    return { intencao: "erro", dados: null };
  }
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
    
    // Verificar se o cliente existe e lidar com cliente novo
    const isNewClient = !clientData;
    if (isNewClient && clientInfo && clientInfo.name) {
      try {
        // Criar novo cliente
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            name: clientInfo.name,
            email: clientInfo.email || `cliente_${Date.now()}@temporario.com`,
            phone: clientInfo.phone || null,
            address: null
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
      } catch (error) {
        console.error("Erro ao criar cliente:", error);
      }
    }
    
    // Analisar a mensagem para identificar intenção e extrair dados
    const analise = await identificarIntencao(message, messageHistory);
    console.log("Análise da mensagem:", analise);
    
    // Gerar resposta com base na intenção e no histórico
    let resposta = "";
    let quoteData = null;
    
    // Determinar o tipo de resposta com base na intenção identificada
    switch (analise.intencao) {
      case "saudacao":
        if (isNewClient) {
          resposta = modeloAgente.configuracao_agente.fluxo_de_conversacao.inicio.identificacao_cliente.cliente_novo;
        } else {
          resposta = modeloAgente.configuracao_agente.fluxo_de_conversacao.inicio.identificacao_cliente.cliente_existente
            .replace('{nome_cliente}', clientData.name);
        }
        break;
        
      case "informacao_produto":
        // Usar o agente especialista para fornecer informações técnicas sobre produtos
        const sistemaEspecialista = modeloAgente.configuracao_agente.openai.sistema_especialista;
        const categoriaPrompt = `O cliente está perguntando sobre produtos da categoria: ${analise.categoria_produto || 'geral'}. 
                                 Forneça informações detalhadas e técnicas sobre essa categoria.`;
        
        resposta = await processarComOpenAI(message, messageHistory, sistemaEspecialista + "\n\n" + categoriaPrompt);
        break;
        
      case "solicitar_orcamento":
        // Se estiver solicitando orçamento, verificar se temos todas as informações necessárias
        if (!clientData || !clientData.name || !clientData.email) {
          resposta = modeloAgente.configuracao_agente.fluxo_de_conversacao.inicio.coleta_dados[0].pergunta;
        } else if (analise.dados && analise.dados.produtos && analise.dados.produtos.length > 0) {
          // Temos informações suficientes para sugerir um orçamento
          quoteData = {
            cliente: {
              nome: clientData.name,
              email: clientData.email,
              telefone: clientData.phone
            },
            produtos: analise.dados.produtos.map(p => ({
              nome: p.tipo,
              especificacoes: p.especificacoes,
              quantidade: parseInt(p.quantidade) || 1
            })),
            entrega: {
              local: analise.dados.endereco || clientData.address || "A definir",
              prazo: "A definir com o cliente"
            },
            forma_pagamento: "A definir com o cliente"
          };
          
          // Resposta personalizada baseada nos produtos solicitados
          resposta = `Baseado nas informações que você forneceu, criarei um orçamento para ${analise.dados.produtos.length} item(ns). 
                      Nossa equipe entrará em contato em breve para confirmar detalhes e valores. 
                      Há mais algum item que gostaria de incluir?`;
        } else {
          // Perguntar sobre produtos específicos
          resposta = modeloAgente.configuracao_agente.fluxo_de_conversacao.levantamento_necessidades.produtos.pergunta_inicial;
        }
        break;
        
      case "dados_cliente":
        // Atualizar dados do cliente se necessário
        if (clientData && analise.dados) {
          const updateData: any = {};
          if (analise.dados.nome) updateData.name = analise.dados.nome;
          if (analise.dados.email) updateData.email = analise.dados.email;
          if (analise.dados.telefone) updateData.phone = analise.dados.telefone;
          if (analise.dados.endereco) updateData.address = analise.dados.endereco;
          
          if (Object.keys(updateData).length > 0) {
            try {
              await supabase
                .from('clients')
                .update(updateData)
                .eq('id', clientData.id);
              
              resposta = modeloAgente.configuracao_agente.respostas_padrao.agradecimento;
            } catch (error) {
              console.error("Erro ao atualizar cliente:", error);
              resposta = "Obrigado pelas informações. Agora me conte sobre os produtos que você precisa.";
            }
          }
        } else {
          resposta = "Obrigado pelas informações. Como posso ajudá-lo com nossos produtos de concreto?";
        }
        break;
        
      case "confirmacao":
        // Finalizar orçamento e preparar confirmação
        if (analise.dados && analise.dados.produtos && analise.dados.produtos.length > 0) {
          quoteData = {
            cliente: {
              nome: clientData ? clientData.name : analise.dados.nome,
              email: clientData ? clientData.email : analise.dados.email,
              telefone: clientData ? clientData.phone : analise.dados.telefone
            },
            produtos: analise.dados.produtos.map(p => ({
              nome: p.tipo,
              especificacoes: p.especificacoes,
              quantidade: parseInt(p.quantidade) || 1
            })),
            entrega: {
              local: analise.dados.endereco || (clientData ? clientData.address : "A definir"),
              prazo: "A definir com o cliente"
            },
            forma_pagamento: "A definir com o cliente"
          };
          
          resposta = modeloAgente.configuracao_agente.confirmacao.confirmacao_final;
        } else {
          resposta = "Ótimo! Preciso de mais alguns detalhes para finalizar seu orçamento. Quais produtos você deseja incluir?";
        }
        break;
        
      default:
        // Processar com o agente principal para mensagens gerais
        resposta = await processarComOpenAI(message, messageHistory);
    }
    
    return {
      message: resposta,
      quote_data: quoteData,
      intent: analise.intencao
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
      quantity: produto.quantidade || 1,
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
    if (sessionId) {
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
        quote_id: quote?.id,
        intent: processedResponse.intent
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
