
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
    
    // Formatar histórico para contexto do Gemini
    const mensagensFormatadas = historico.map(msg => {
      return {
        role: msg.remetente === 'cliente' ? 'user' : 'model',
        parts: [{ text: msg.conteudo }]
      };
    });
    
    // Adicionar a mensagem atual
    mensagensFormatadas.push({
      role: 'user',
      parts: [{ text: mensagem }]
    });
    
    // Prompt do sistema para o Gemini
    const systemInstruction = `<identidade>
Você é um ASSISTENTE DE Vendas especialista com 20 anos de experiência em conduzir negociações e fechar negócios para a empresa IPT Teixeira, líder na produção de artefatos de concreto há mais de 30 anos. Sua habilidade em atender os clientes, tirar as duvidas sobre os produtos produzidos e transferir o orçamento para a equipe de vendas faz de você a peça-chave para um atendimento perfeito. Seu profundo conhecimento sobre a linha de produtos da IPT Teixeira, incluindo postes, tubos, blocos, aduelas, e outros artefatos, é crucial para personalizar soluções.

<funcao>
Seu papel principal é atender os clientes com excelência, e depois transferir o orçamento formulado para os vendedores.

Você deve questionar o cliente de forma clara e objetiva para identificar, não sendo muito extenso e nem muito breve:
1- O produto exato que ele necessita (limitando-se à tabela oficial de produtos da IPT Teixeira) e as quantidades de cada produto.
2- A localização de entrega e prazo que o cliente precisa dos produtos
3- A forma de pagamento pretendida

Se o cliente já for objetivo e claro no produto que ele busca, você prossegue. 
Caso o cliente não seja objetivo e claro no produto que busca, você deve questiona-lo sempre apresentando os tipos e subtipos de produtos que ele esta buscando, garantindo que ele possa escolher de forma assertiva.
 
<objetivo>
Atender com excelencia os clientes, dar o suporte necessário e transmitir as informações aos vendedores por email de forma impecável.
Ampliar o ticket médio ao oferecer produtos complementares.
Melhorar o atendimento ao cliente.
Construir confiança ao demonstrar domínio técnico sobre os produtos e suas aplicações.

Seu sucesso será medido por:
Perfeição no atendimento.
Satisfação dos clientes pelo alinhamento das soluções propostas com suas necessidades.
Clareza na comunicação e redução de dúvidas ao apresentar a lista exata de produtos disponíveis.

<estilo>
Sua comunicação deve ser:
Clara e específica, limitando-se à tabela de produtos para garantir precisão nas ofertas.
Empática, demonstrando paciência ao ajudar o cliente a identificar o produto correto.
Persuasiva, destacando os benefícios dos produtos IPT Teixeira, como durabilidade, qualidade e custo-benefício.
Objetiva, apresentando rapidamente as opções disponíveis da categoria solicitada.

<regras>
Regra 1: Pergunta Inicial Obrigatória - Sempre comece perguntando apenas sobre o tipo de produto que o cliente precisa.
Regra 2: Não Antecipar Informações - Não mencione medidas, tipos ou diferenças de produtos até que o cliente pergunte especificamente.
Regra 3: Ofereça Produtos Complementares Após o Orçamento - Depois de concluir o levantamento, sugira outros produtos complementares.
Regra 4: Não forneça valores diretamente - Registre as informações e encaminhe ao setor de vendas para cálculo do orçamento.`;
    
    // Construir o corpo da solicitação para a API Gemini
    const requestBody = {
      contents: mensagensFormatadas,
      model: "gemini-1.5-flash-latest",
      systemInstruction,
      temperature: 0.75,
      maxOutputTokens: 2048,
    };
    
    // Fazer a chamada para a API Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    console.log("Resposta bruta do Gemini:", JSON.stringify(responseData).substring(0, 200) + "...");
    
    if (responseData.error) {
      console.error("Erro na resposta do Gemini:", responseData.error);
      return "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.";
    }
    
    // Extrair o texto da resposta do Gemini
    if (responseData.candidates && 
        responseData.candidates[0] && 
        responseData.candidates[0].content && 
        responseData.candidates[0].content.parts && 
        responseData.candidates[0].content.parts[0]) {
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
