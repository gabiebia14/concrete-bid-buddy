
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Configurações do Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GEMINI API KEY
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

// Verificar se a chave Gemini está configurada
if (!geminiApiKey) {
  console.error("GEMINI_API_KEY não está configurada nas variáveis de ambiente!");
}

// Cabeçalhos CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Salvar mensagem no chat
async function salvarMensagem(sessionId: string, remetente: 'cliente' | 'vendedor', conteudo: string) {
  try {
    console.log(`Salvando mensagem como ${remetente}: "${conteudo}" para sessão ${sessionId}`);
    
    const { data, error } = await supabase
      .from("vendedor_chat_messages")
      .insert({
        session_id: sessionId,
        remetente,
        conteudo
      })
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao salvar mensagem:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao salvar mensagem:", error);
    return null;
  }
}

// Processar mensagem com Gemini API
async function processarMensagemComGemini(mensagem: string, historico: any[]) {
  try {
    console.log("Processando mensagem com Gemini:", mensagem);
    console.log("API Key está configurada:", !!geminiApiKey);
    
    // Formatando o histórico para o formato que o Gemini espera
    const formattedMessages = historico.map(msg => ({
      role: msg.remetente === 'cliente' ? 'user' : 'model',
      parts: [{ text: msg.conteudo }]
    }));
    
    // Adicionando a mensagem atual
    formattedMessages.push({
      role: 'user',
      parts: [{ text: mensagem }]
    });
    
    // Construindo o prompt do sistema
    const systemPrompt = `Você é um Assistente de Vendas especialista com 20 anos de experiência para a empresa IPT Teixeira, líder na produção de artefatos de concreto há mais de 30 anos.

Seu papel principal é:
1. Atender os clientes com excelência 
2. Coletar informações sobre o produto que o cliente necessita, quantidade, local de entrega e prazo
3. Transferir essas informações para a equipe de vendas
    
Você deve questionar o cliente de forma clara e objetiva para identificar:
- O produto exato que ele necessita (postes, tubos, blocos, aduelas, etc.)
- As quantidades de cada produto
- A localização de entrega e prazo que o cliente precisa
- A forma de pagamento pretendida

Principais produtos da IPT Teixeira:
- POSTES: Circular, Duplo T, DT, telecomunicações
- TUBOS: Dimensões 0,30x1,00 até 1,50x1,50, tipos PA 1, PA 2, PA 3, PA 4, PS 1, PS 2
- BLOCOS: Estrutural ou vedação, dimensões 14x19x39cm, 19x19x39cm, 9x19x39cm
- CANALETAS: Dimensões 9x19x39cm, 14x19x39cm, 19x19x39cm
- OUTROS: Guias, pavimentos, aduelas, cruzetas

Regras importantes:
1. Sempre comece perguntando sobre o tipo de produto que o cliente precisa
2. Não mencione medidas ou tipos até que o cliente pergunte especificamente
3. Depois de coletar informações para o orçamento, sugira produtos complementares
4. Nunca forneça preços - diga que a equipe de vendas enviará o orçamento completo

Seja empático, paciente e profissional em suas respostas.`;
    
    // URL da API Gemini
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    // Parâmetros da solicitação
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        ...formattedMessages
      ],
    };
    
    console.log("Enviando solicitação para Gemini com:", JSON.stringify(requestBody).substring(0, 200) + "...");
    
    // Fazendo a chamada para a API Gemini
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta da API Gemini:", response.status, errorText);
      return "Desculpe, estou com dificuldades para processar sua solicitação no momento. Por favor, tente novamente em instantes.";
    }
    
    const responseData = await response.json();
    console.log("Resposta bruta do Gemini:", JSON.stringify(responseData).substring(0, 500) + "...");
    
    // Extraindo o texto da resposta
    if (responseData.candidates && 
        responseData.candidates[0] && 
        responseData.candidates[0].content && 
        responseData.candidates[0].content.parts && 
        responseData.candidates[0].content.parts.length > 0) {
      return responseData.candidates[0].content.parts[0].text;
    }
    
    return "Olá! Sou o assistente de vendas da IPT Teixeira. Em que posso ajudar hoje? Qual tipo de produto você está precisando?";
  } catch (error) {
    console.error("Erro ao processar mensagem com Gemini:", error);
    return "Estou com dificuldades técnicas no momento. Por favor, tente novamente em instantes.";
  }
}

// Função principal para processar mensagens
async function processarMensagem(mensagemUsuario: string, telefone: string, sessionId: string | null = null) {
  try {
    console.log(`Processando mensagem: "${mensagemUsuario}" para telefone: ${telefone}, sessão: ${sessionId}`);
    
    // Buscar ou criar sessão
    let sessao;
    if (sessionId) {
      // Buscar sessão existente
      const { data, error } = await supabase
        .from("vendedor_chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      if (error) {
        console.error("Erro ao buscar sessão:", error);
        // Criar nova sessão sem cliente_id
        const { data: novaData, error: novoErro } = await supabase
          .from("vendedor_chat_sessions")
          .insert({
            status: 'ativo',
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (novoErro) {
          throw novoErro;
        }
        
        sessao = novaData;
      } else {
        sessao = data;
      }
    } else {
      // Criar nova sessão sem cliente_id
      const { data, error } = await supabase
        .from("vendedor_chat_sessions")
        .insert({
          status: 'ativo',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      sessao = data;
    }
    
    console.log("Sessão usada:", sessao.id);
    
    // Buscar histórico de mensagens
    const { data: historicoMensagens, error: errorHistorico } = await supabase
      .from("vendedor_chat_messages")
      .select("*")
      .eq("session_id", sessao.id)
      .order("created_at", { ascending: true });
    
    if (errorHistorico) {
      console.error("Erro ao buscar histórico:", errorHistorico);
    }
    
    const historico = historicoMensagens || [];
    console.log(`Encontradas ${historico.length} mensagens no histórico`);
    
    // Salvar mensagem do usuário
    await salvarMensagem(sessao.id, 'cliente', mensagemUsuario);
    
    // Processar mensagem com Gemini
    const respostaAgente = await processarMensagemComGemini(
      mensagemUsuario, 
      [...historico, { remetente: 'cliente', conteudo: mensagemUsuario }]
    );
    
    console.log("Resposta do agente:", respostaAgente);
    
    // Salvar resposta do agente
    await salvarMensagem(sessao.id, 'vendedor', respostaAgente);
    
    return {
      sessionId: sessao.id,
      message: respostaAgente
    };
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    throw error;
  }
}

// Função principal do servidor
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
    const { message, phone, sessionId, channel = "website" } = await req.json();
    
    console.log("Requisição recebida:", { message, phone, sessionId, channel });
    
    if (!message) {
      return new Response(
        JSON.stringify({ 
          error: "Mensagem é obrigatória." 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (!phone) {
      return new Response(
        JSON.stringify({ 
          error: "Telefone é obrigatório." 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Processar a mensagem
    const resultado = await processarMensagem(message, phone, sessionId);
    
    // Retornar resultado
    return new Response(
      JSON.stringify(resultado),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro no servidor:", error);
    
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
