
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

// Função principal para processar mensagens
async function processarMensagem(mensagemUsuario: string, sessionId: string | null = null) {
  console.log(`Processando mensagem: "${mensagemUsuario}" para sessão: ${sessionId}`);
  
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
    
    // Criar ou recuperar sessão
    let idSessao = sessionId;
    
    if (!idSessao) {
      const { data: novaSessao, error: errorSessao } = await supabase
        .from("chat_sessions")
        .insert({
          status: "active",
        })
        .select()
        .single();
      
      if (errorSessao) {
        console.error("Erro ao criar sessão:", errorSessao);
        throw new Error("Falha ao criar sessão de chat");
      }
      
      idSessao = novaSessao.id;
      console.log(`Nova sessão criada: ${idSessao}`);
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
    // Extrair o caminho da URL para determinar a ação
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    // Rota para processar mensagens
    if (path === "chat-assistant" && req.method === "POST") {
      const { message, sessionId } = await req.json();
      
      if (!message) {
        return new Response(
          JSON.stringify({ error: "Mensagem não fornecida" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const resultado = await processarMensagem(message, sessionId);
      
      return new Response(JSON.stringify(resultado), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Rota para buscar histórico de chat
    if (path === "history" && req.method === "POST") {
      const { sessionId } = await req.json();
      
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
    }
    
    // Rota não encontrada
    return new Response(
      JSON.stringify({ error: "Rota não encontrada" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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
