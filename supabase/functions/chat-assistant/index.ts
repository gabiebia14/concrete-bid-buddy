
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { OpenAI } from "https://esm.sh/openai@4.32.0";

// Configurações do Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Inicializar cliente Supabase com SERVICE_ROLE_KEY (importante para ter permissão de escrita)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuração da API OpenAI
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Definir cabeçalhos CORS - em produção, restrinja ao domínio específico
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Restrinja para seu domínio em produção
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Interface para resposta estruturada do assistente
interface AnaliseMensagem {
  intencao: string;
  categoria_produto: string;
  dados: {
    nome: string | null;
    email: string | null;
    telefone: string | null;
    endereco: string | null;
    produtos: Array<{
      tipo: string;
      quantidade: number;
      detalhes?: string;
    }>;
  };
}

// Função para buscar cliente pelo número de telefone
async function buscarClientePorTelefone(telefone: string) {
  try {
    console.log(`Buscando cliente pelo telefone: ${telefone}`);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", telefone)
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao buscar cliente:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return null;
  }
}

// Função principal para processar mensagens
async function processarMensagem(mensagemUsuario: string, sessionId: string | null = null, phoneNumber: string | null = null) {
  console.log(`Processando mensagem: "${mensagemUsuario}" para sessão: ${sessionId}, telefone: ${phoneNumber}`);
  
  try {
    // Buscar configuração do agente na tabela agent_configs
    const { data: configAgente, error: errorConfig } = await supabase
      .from("agent_configs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (errorConfig) {
      console.error("Erro ao buscar configuração do agente:", errorConfig);
      throw new Error("Configuração do agente não encontrada");
    }
    
    // Verificar se temos um cliente existente pelo número de telefone
    let clientId = null;
    if (phoneNumber) {
      const cliente = await buscarClientePorTelefone(phoneNumber);
      if (cliente) {
        clientId = cliente.id;
        console.log(`Cliente encontrado pelo telefone: ${phoneNumber}, ID: ${clientId}`);
      } else {
        console.log(`Nenhum cliente encontrado para o telefone: ${phoneNumber}`);
      }
    }
    
    // Criar ou recuperar sessão
    let idSessao = sessionId;
    
    if (!idSessao) {
      const { data: novaSessao, error: errorSessao } = await supabase
        .from("chat_sessions")
        .insert({
          status: "active",
          client_id: clientId // Associar com o cliente se encontrado
        })
        .select()
        .single();
      
      if (errorSessao) {
        console.error("Erro ao criar sessão:", errorSessao);
        throw new Error("Falha ao criar sessão de chat");
      }
      
      idSessao = novaSessao.id;
      console.log(`Nova sessão criada: ${idSessao}, clientId: ${clientId}`);
    } else if (clientId) {
      // Atualizar a sessão existente com o ID do cliente se não estiver definido
      const { data: sessaoExistente, error: errorBuscaSessao } = await supabase
        .from("chat_sessions")
        .select("client_id")
        .eq("id", idSessao)
        .single();
      
      if (!errorBuscaSessao && !sessaoExistente.client_id) {
        // Se a sessão não tem client_id, atualizar com o que encontramos
        const { error: errorAtualizaSessao } = await supabase
          .from("chat_sessions")
          .update({ client_id: clientId })
          .eq("id", idSessao);
        
        if (errorAtualizaSessao) {
          console.error("Erro ao atualizar sessão com clientId:", errorAtualizaSessao);
        }
      }
    }
    
    // Buscar histórico da sessão, se existir
    const { data: historicoMensagens, error: errorHistorico } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", idSessao)
      .order("created_at", { ascending: true });
    
    if (errorHistorico) {
      console.error("Erro ao buscar histórico:", errorHistorico);
      // Continuamos mesmo com erro no histórico
    }
    
    // Salvar mensagem do usuário
    const { error: errorSalvarMsg } = await supabase
      .from("chat_messages")
      .insert({
        session_id: idSessao,
        role: "user",
        content: mensagemUsuario,
      });
    
    if (errorSalvarMsg) {
      console.error("Erro ao salvar mensagem:", errorSalvarMsg);
      // Continuamos mesmo com erro ao salvar
    }
    
    // Construir contexto para o modelo
    const messages = [
      { role: "system", content: configAgente.sistema_principal },
    ];
    
    // Adicionar histórico ao contexto
    if (historicoMensagens && historicoMensagens.length > 0) {
      historicoMensagens.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }
    
    // Adicionar mensagem atual
    messages.push({ role: "user", content: mensagemUsuario });
    
    // Analisar intenção do usuário com OpenAI
    const analiseResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...messages,
        {
          role: "system",
          content: `Analise a mensagem do usuário e categorize conforme o formato JSON abaixo:
{
  "intencao": "<saudacao|duvida_produto|interesse_compra|orcamento|reclamacao|outra>",
  "categoria_produto": "<blocos|postes|lajes|tubos|canaletas|outro|null>",
  "dados": {
    "nome": "<nome_extraido_ou_null>",
    "email": "<email_extraido_ou_null>",
    "telefone": "<telefone_extraido_ou_null>",
    "endereco": "<endereco_extraido_ou_null>",
    "produtos": [
      {
        "tipo": "<tipo_produto>",
        "quantidade": <numero_ou_0>,
        "detalhes": "<especificacoes_adicionais>"
      }
    ]
  }
}
Retorne APENAS o objeto JSON, sem nenhum texto adicional.`,
        },
      ],
      temperature: 0.2,
    });
    
    // Extrair e analisar a resposta JSON
    const analiseTexto = analiseResponse.choices[0].message.content?.trim() || "{}";
    console.log("Análise de intenção:", analiseTexto);
    
    let analise: AnaliseMensagem;
    try {
      analise = JSON.parse(analiseTexto) as AnaliseMensagem;
      console.log("Análise da mensagem:", analise);
    } catch (error) {
      console.error("Erro ao parsear análise JSON:", error);
      analise = {
        intencao: "outra",
        categoria_produto: "null",
        dados: {
          nome: null,
          email: null,
          telefone: null,
          endereco: null,
          produtos: [],
        },
      };
    }
    
    // Atualizar ou criar cliente com base em dados extraídos
    if (phoneNumber && (analise.dados.nome || analise.dados.email)) {
      // Tentar buscar o cliente pelo telefone
      const clienteExistente = await buscarClientePorTelefone(phoneNumber);
      
      if (clienteExistente) {
        // Atualizar cliente existente se temos novos dados
        const atualizacoes: {[key: string]: any} = {};
        
        if (analise.dados.nome && !clienteExistente.name) {
          atualizacoes.name = analise.dados.nome;
        }
        
        if (analise.dados.email && !clienteExistente.email) {
          atualizacoes.email = analise.dados.email;
        }
        
        if (analise.dados.endereco && !clienteExistente.address) {
          atualizacoes.address = analise.dados.endereco;
        }
        
        // Se temos dados para atualizar
        if (Object.keys(atualizacoes).length > 0) {
          const { error: errorAtualizarCliente } = await supabase
            .from("clients")
            .update(atualizacoes)
            .eq("id", clienteExistente.id);
          
          if (errorAtualizarCliente) {
            console.error("Erro ao atualizar cliente:", errorAtualizarCliente);
          } else {
            console.log(`Cliente atualizado com sucesso: ${clienteExistente.id}`);
          }
        }
      } else if (analise.dados.nome) {
        // Criar novo cliente se temos pelo menos um nome
        const novoCliente = {
          phone: phoneNumber,
          name: analise.dados.nome || "Cliente Sem Nome",
          email: analise.dados.email || `${phoneNumber.replace(/\D/g, '')}@placeholder.com`,
          address: analise.dados.endereco
        };
        
        const { data: clienteCriado, error: errorCriarCliente } = await supabase
          .from("clients")
          .insert(novoCliente)
          .select()
          .single();
        
        if (errorCriarCliente) {
          console.error("Erro ao criar cliente:", errorCriarCliente);
        } else {
          clientId = clienteCriado.id;
          console.log(`Novo cliente criado: ${clientId}`);
          
          // Atualizar sessão com o novo cliente
          const { error: errorAtualizarSessao } = await supabase
            .from("chat_sessions")
            .update({ client_id: clientId })
            .eq("id", idSessao);
          
          if (errorAtualizarSessao) {
            console.error("Erro ao atualizar sessão com novo cliente:", errorAtualizarSessao);
          }
        }
      }
    }
    
    // Verificar se é uma solicitação de orçamento
    let quoteId: string | null = null;
    if (analise.intencao === "orcamento" && analise.dados.produtos.length > 0) {
      // Implementação para criar orçamento quando necessário
      // (Desabilitado por enquanto para simplificar)
    }
    
    // Responder ao usuário
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });
    
    const respostaAssistente = chatResponse.choices[0].message.content || 
                               "Desculpe, não consegui processar sua mensagem. Como posso ajudar?";
    
    // Salvar resposta do assistente
    const { error: errorSalvarResposta } = await supabase
      .from("chat_messages")
      .insert({
        session_id: idSessao,
        role: "assistant",
        content: respostaAssistente,
      });
    
    if (errorSalvarResposta) {
      console.error("Erro ao salvar resposta:", errorSalvarResposta);
      // Continuamos mesmo com erro ao salvar
    }
    
    return {
      sessionId: idSessao,
      message: respostaAssistente,
      quote_id: quoteId,
    };
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    throw error;
  }
}

// Função para buscar histórico de chat
async function buscarHistoricoChat(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Erro ao buscar histórico:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw error;
  }
}

// Servidor HTTP
serve(async (req) => {
  // Tratamento de CORS para requisições OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    // Extrair dados da requisição
    const requestData = await req.json();
    
    // Verificar qual ação realizar com base nos parâmetros da requisição
    if (requestData.action === "history") {
      // Rota para buscar histórico
      const { sessionId } = requestData;
      
      if (!sessionId) {
        return new Response(
          JSON.stringify({ error: "ID da sessão não fornecido" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const historico = await buscarHistoricoChat(sessionId);
      
      return new Response(JSON.stringify(historico), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (requestData.message) {
      // Rota para processar mensagens
      const { message, sessionId, phoneNumber } = requestData;
      
      const resultado = await processarMensagem(message, sessionId, phoneNumber);
      
      return new Response(JSON.stringify(resultado), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Requisição inválida
      return new Response(
        JSON.stringify({ error: "Parâmetros inválidos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Erro no handler principal:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor", 
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
