
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Configurações do Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GEMINI API KEY
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

// Cabeçalhos CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Verificar se cliente existe por telefone
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

// Criar novo cliente
async function criarNovoCliente(clienteData: any) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .insert(clienteData)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar cliente:", error);
      return null;
    }
    
    console.log("Cliente criado com sucesso:", data);
    return data;
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return null;
  }
}

// Salvar mensagem no chat
async function salvarMensagem(sessionId: string, remetente: 'cliente' | 'vendedor', conteudo: string, orcamentoData?: any) {
  try {
    const mensagemData: any = {
      session_id: sessionId,
      remetente,
      conteudo
    };
    
    if (orcamentoData) {
      mensagemData.orcamento = orcamentoData;
    }
    
    const { data, error } = await supabase
      .from("vendedor_chat_messages")
      .insert(mensagemData)
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
      model: "gemini-2.5-pro-exp-03-25",
      systemInstruction,
      temperature: 0.75,
      maxOutputTokens: 5536,
    };
    
    // Fazer a chamada para a API Gemini
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=" + geminiApiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
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
    
    return "Desculpe, não consegui processar sua mensagem. Como posso ajudar?";
    
  } catch (error) {
    console.error("Erro ao processar mensagem com Gemini:", error);
    return "Estou com dificuldades técnicas no momento. Por favor, tente novamente em instantes.";
  }
}

// Extrair informações do cliente da mensagem
async function extrairDadosCliente(mensagens: any[]) {
  try {
    // Concatenar todas as mensagens do chat para análise
    const textoCompleto = mensagens.map(m => m.conteudo).join("\n");
    
    // Construir o prompt para extrair dados do cliente
    const promptExtracaoDados = `
    Analise a seguinte conversa com um cliente e extraia as informações de contato:
    ---
    ${textoCompleto}
    ---
    
    Extraia apenas os seguintes campos em formato JSON:
    {
      "tipo_pessoa": "fisica" ou "juridica" (se identificado),
      "nome": "Nome completo ou razão social",
      "cpf_cnpj": "CPF ou CNPJ (apenas números)",
      "email": "Email se mencionado",
      "telefone": "Telefone com DDD (apenas números)",
      "endereco": "Endereço se mencionado"
    }
    
    Use null para campos não mencionados. Retorne APENAS o JSON, sem texto adicional.
    `;
    
    // Fazer a chamada para a API Gemini
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: promptExtracaoDados }]
        }
      ],
      model: "gemini-2.5-pro-exp-03-25",
      temperature: 0.1,
    };
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=" + geminiApiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    let dadosExtraidos = {};
    
    if (responseData.candidates && 
        responseData.candidates[0] && 
        responseData.candidates[0].content && 
        responseData.candidates[0].content.parts && 
        responseData.candidates[0].content.parts[0]) {
      
      const respostaTexto = responseData.candidates[0].content.parts[0].text;
      
      try {
        // Tentar fazer o parse do JSON da resposta
        dadosExtraidos = JSON.parse(respostaTexto);
      } catch (e) {
        console.error("Erro ao fazer parse do JSON:", e);
      }
    }
    
    return dadosExtraidos;
  } catch (error) {
    console.error("Erro ao extrair dados do cliente:", error);
    return {};
  }
}

// Extrair detalhes do orçamento
async function extrairDadosOrcamento(mensagens: any[]) {
  try {
    // Concatenar todas as mensagens do chat para análise
    const textoCompleto = mensagens.map(m => m.conteudo).join("\n");
    
    // Construir o prompt para extrair dados do orçamento
    const promptExtracaoOrcamento = `
    Analise a seguinte conversa com um cliente e extraia as informações de orçamento:
    ---
    ${textoCompleto}
    ---
    
    Extraia apenas os seguintes campos em formato JSON:
    {
      "produtos": [
        {
          "tipo": "tipo do produto (postes, tubos, blocos, etc)",
          "subtipo": "subtipo ou modelo do produto (circular, duplo t, pa1, etc)",
          "dimensoes": "dimensões mencionadas",
          "quantidade": número extraído ou null,
          "especificacoes": "especificações adicionais mencionadas"
        }
      ],
      "entrega": {
        "local": "local de entrega mencionado",
        "prazo": "prazo mencionado"
      },
      "pagamento": "forma de pagamento mencionada"
    }
    
    Use arrays vazios ou null para campos não identificados. Retorne APENAS o JSON, sem texto adicional.
    `;
    
    // Fazer a chamada para a API Gemini
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: promptExtracaoOrcamento }]
        }
      ],
      model: "gemini-2.5-pro-exp-03-25",
      temperature: 0.1,
    };
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=" + geminiApiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    let dadosExtraidos = { produtos: [], entrega: {}, pagamento: null };
    
    if (responseData.candidates && 
        responseData.candidates[0] && 
        responseData.candidates[0].content && 
        responseData.candidates[0].content.parts && 
        responseData.candidates[0].content.parts[0]) {
      
      const respostaTexto = responseData.candidates[0].content.parts[0].text;
      
      try {
        // Tentar fazer o parse do JSON da resposta
        dadosExtraidos = JSON.parse(respostaTexto);
      } catch (e) {
        console.error("Erro ao fazer parse do JSON de orçamento:", e);
      }
    }
    
    return dadosExtraidos;
  } catch (error) {
    console.error("Erro ao extrair dados do orçamento:", error);
    return { produtos: [], entrega: {}, pagamento: null };
  }
}

// Função principal para processar mensagens
async function processarMensagem(mensagemUsuario: string, telefone: string, sessionId: string | null = null) {
  try {
    console.log(`Processando mensagem: "${mensagemUsuario}" para telefone: ${telefone}, sessão: ${sessionId}`);
    
    // Verificar se cliente existe
    let cliente = await buscarClientePorTelefone(telefone);
    let clienteId = cliente?.id;
    console.log("Cliente encontrado:", cliente ? "Sim" : "Não");
    
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
        // Criar nova sessão
        const { data: novaData, error: novoErro } = await supabase
          .from("vendedor_chat_sessions")
          .insert({
            cliente_id: clienteId,
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
      // Criar nova sessão
      const { data, error } = await supabase
        .from("vendedor_chat_sessions")
        .insert({
          cliente_id: clienteId,
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
    
    // Salvar mensagem do usuário
    await salvarMensagem(sessao.id, 'cliente', mensagemUsuario);
    
    // Processar mensagem com Gemini
    const respostaAgente = await processarMensagemComGemini(
      mensagemUsuario, 
      [...historico, { remetente: 'cliente', conteudo: mensagemUsuario }]
    );
    
    // Salvar resposta do agente
    await salvarMensagem(sessao.id, 'vendedor', respostaAgente);
    
    // Se não temos um cliente ainda, tentar extrair informações das mensagens
    if (!cliente) {
      const todasMensagens = [
        ...historico, 
        { remetente: 'cliente', conteudo: mensagemUsuario },
        { remetente: 'vendedor', conteudo: respostaAgente }
      ];
      
      const dadosExtraidos = await extrairDadosCliente(todasMensagens);
      console.log("Dados extraídos:", dadosExtraidos);
      
      // Se temos dados suficientes, criar cliente
      if (dadosExtraidos.nome && dadosExtraidos.tipo_pessoa) {
        const novoCliente = {
          name: dadosExtraidos.nome,
          tipo_pessoa: dadosExtraidos.tipo_pessoa || 'fisica',
          cpf_cnpj: dadosExtraidos.cpf_cnpj || null,
          email: dadosExtraidos.email || `${telefone.replace(/\D/g, '')}@placeholder.com`,
          phone: telefone,
          address: dadosExtraidos.endereco || null
        };
        
        cliente = await criarNovoCliente(novoCliente);
        
        if (cliente) {
          // Atualizar sessão com ID do cliente
          await supabase
            .from("vendedor_chat_sessions")
            .update({ cliente_id: cliente.id })
            .eq("id", sessao.id);
        }
      }
    }
    
    // Verificar se tem informações de orçamento para salvar
    const dadosOrcamento = await extrairDadosOrcamento([
      ...historico, 
      { remetente: 'cliente', conteudo: mensagemUsuario },
      { remetente: 'vendedor', conteudo: respostaAgente }
    ]);
    
    console.log("Dados orçamento extraídos:", dadosOrcamento);
    
    // Se temos produtos no orçamento, atualizar a última mensagem do vendedor
    if (dadosOrcamento.produtos && dadosOrcamento.produtos.length > 0) {
      // Buscar a última mensagem do vendedor
      const { data: ultimaMensagem } = await supabase
        .from("vendedor_chat_messages")
        .select("*")
        .eq("session_id", sessao.id)
        .eq("remetente", "vendedor")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (ultimaMensagem) {
        // Atualizar a mensagem com os dados do orçamento
        await supabase
          .from("vendedor_chat_messages")
          .update({ orcamento: dadosOrcamento })
          .eq("id", ultimaMensagem.id);
      }
    }
    
    return {
      sessionId: sessao.id,
      message: respostaAgente,
      cliente: cliente,
      orcamento: dadosOrcamento.produtos && dadosOrcamento.produtos.length > 0 ? dadosOrcamento : null
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
    
    if (!message || !phone) {
      return new Response(
        JSON.stringify({ 
          error: "Parâmetros inválidos. Mensagem e telefone são obrigatórios." 
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
