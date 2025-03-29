
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { OpenAI } from "https://esm.sh/openai@4.32.0";

// Configurações do Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuração da API OpenAI
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

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

// Criar nova sessão de chat
async function criarSessaoChat(clienteId?: string) {
  try {
    const { data, error } = await supabase
      .from("vendedor_chat_sessions")
      .insert({
        cliente_id: clienteId,
        status: "ativo",
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar sessão de chat:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar sessão:", error);
    throw error;
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

// Buscar produtos de postes
async function buscarProdutosPostes() {
  try {
    const { data, error } = await supabase
      .from("produtos_postes")
      .select("*");
    
    if (error) {
      console.error("Erro ao buscar produtos postes:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar produtos postes:", error);
    return [];
  }
}

// Processar mensagem com OpenAI
async function processarMensagemComAI(
  mensagem: string, 
  historico: any[], 
  dadosCliente: any, 
  produtosPostes: any[]
) {
  try {
    // Formatar histórico para contexto do OpenAI
    const mensagensFormatadas = historico.map(msg => ({
      role: msg.remetente === 'cliente' ? 'user' : 'assistant',
      content: msg.conteudo
    }));
    
    // Construir prompt de sistema com informações do cliente e produtos
    const promptSistema = `
Você é um assistente de vendas especialista na IPT Teixeira, empresa líder na produção de artefatos de concreto há mais de 30 anos.

${dadosCliente ? `INFORMAÇÕES DO CLIENTE:
Nome: ${dadosCliente.name || 'Não informado'}
Telefone: ${dadosCliente.phone || 'Não informado'}
Email: ${dadosCliente.email || 'Não informado'}
Tipo Pessoa: ${dadosCliente.tipo_pessoa || 'Não informado'}
CPF/CNPJ: ${dadosCliente.cpf_cnpj || 'Não informado'}
Endereço: ${dadosCliente.address || 'Não informado'}` : 'CLIENTE NÃO CADASTRADO - Você precisa coletar as informações básicas do cliente.'}

OBJETIVO:
Atender com excelência os clientes, tirar dúvidas sobre produtos, coletar informações para orçamentos e transferir para a equipe de vendas.

${!dadosCliente || !dadosCliente.name ? `
PRIORIDADE ATUAL: 
Você deve primeiro verificar se é pessoa física ou jurídica e coletar: 
- Nome ou Razão Social
- CPF ou CNPJ
- Email
- Confirmar o telefone: ${dadosCliente?.phone || 'não informado'}
- Endereço (opcional)
Só depois de coletar esses dados, continue com o atendimento para orçamento.
` : ''}

REGRAS ESPECÍFICAS:
1. Pergunta Inicial: Sempre comece perguntando apenas sobre o tipo de produto que o cliente precisa.
2. Não Antecipar Informações: Não mencione medidas ou tipos até que o cliente pergunte especificamente.
3. Ofereça Produtos Complementares: Após concluir o orçamento, sugira outros produtos relacionados.
4. Não Forneça Valores: Nunca informe preços. Diga que a equipe de vendas enviará o orçamento completo.
5. Colete Sempre: Produto, quantidade, local de entrega, prazo e forma de pagamento.

PRODUTOS POSTES (Base de dados atual):
${JSON.stringify(produtosPostes, null, 2)}

OUTROS PRODUTOS:
- TUBOS: Dimensões 0,30x1,00 até 1,50x1,50, tipos PA 1, PA 2, PA 3, PA 4, PS 1, PS 2
- BLOCOS: Estrutural ou vedação, dimensões 14x19x39cm, 19x19x39cm, 9x19x39cm
- CANALETAS: Dimensões 9x19x39cm, 14x19x39cm, 19x19x39cm
- GUIAS, PAVIMENTOS, ADUELAS, CRUZETAS e outros artefatos de concreto

Mantenha respostas claras, objetivas e profissionais. Identifique exatamente o que o cliente precisa antes de prosseguir.
`;
    
    // Fazer chamada para a OpenAI
    const resposta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: promptSistema },
        ...mensagensFormatadas,
        { role: "user", content: mensagem }
      ],
      temperature: 0.7,
    });
    
    return resposta.choices[0].message.content || "Desculpe, não consegui processar sua mensagem. Como posso ajudar?";
    
  } catch (error) {
    console.error("Erro ao processar mensagem com AI:", error);
    return "Estou com dificuldades técnicas no momento. Por favor, tente novamente em instantes.";
  }
}

// Extrair informações do cliente da mensagem
async function extrairDadosCliente(mensagens: any[]) {
  try {
    // Concatenar todas as mensagens do chat para análise
    const textoCompleto = mensagens.map(m => m.conteudo).join("\n");
    
    const promptExtracaoDados = `
Analise o seguinte texto de uma conversa com um cliente e extraia as informações abaixo no formato JSON:
---
${textoCompleto}
---

Retorne APENAS um objeto JSON com os seguintes campos (sem explicações adicionais):
{
  "tipo_pessoa": "fisica" ou "juridica" (se identificado),
  "nome": "Nome da pessoa ou razão social extraído da conversa",
  "cpf_cnpj": "CPF ou CNPJ extraído",
  "email": "Email extraído",
  "telefone": "Telefone extraído",
  "endereco": "Endereço extraído (se houver)"
}

Use null para campos não identificados. Não invente informações, extraia apenas o que estiver explícito no texto.
`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um assistente especializado em extrair informações estruturadas de textos." },
        { role: "user", content: promptExtracaoDados }
      ],
      temperature: 0.1,
    });
    
    const respostaTexto = response.choices[0].message.content || "{}";
    let dadosExtraidos;
    
    try {
      dadosExtraidos = JSON.parse(respostaTexto);
    } catch (e) {
      console.error("Erro ao fazer parse do JSON:", e);
      dadosExtraidos = {};
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
    
    const promptExtracaoOrcamento = `
Analise o seguinte texto de uma conversa com um cliente e extraia as informações de orçamento no formato JSON:
---
${textoCompleto}
---

Retorne APENAS um objeto JSON com os seguintes campos (sem explicações adicionais):
{
  "produtos": [
    {
      "tipo": "tipo do produto (postes, tubos, etc)",
      "subtipo": "subtipo do produto (circular, duplo t, pa1, etc)",
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

Use arrays vazios ou null para campos não identificados. Não invente informações.
`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um assistente especializado em extrair informações estruturadas de textos." },
        { role: "user", content: promptExtracaoOrcamento }
      ],
      temperature: 0.1,
    });
    
    const respostaTexto = response.choices[0].message.content || "{}";
    let dadosExtraidos;
    
    try {
      dadosExtraidos = JSON.parse(respostaTexto);
    } catch (e) {
      console.error("Erro ao fazer parse do JSON:", e);
      dadosExtraidos = { produtos: [], entrega: {}, pagamento: null };
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
        sessao = await criarSessaoChat(clienteId);
      } else {
        sessao = data;
      }
    } else {
      // Criar nova sessão
      sessao = await criarSessaoChat(clienteId);
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
    
    // Buscar dados de produtos para contexto
    const produtosPostes = await buscarProdutosPostes();
    
    // Processar mensagem com o modelo
    const respostaAgente = await processarMensagemComAI(
      mensagemUsuario, 
      [...historico, { remetente: 'cliente', conteudo: mensagemUsuario }], 
      cliente, 
      produtosPostes
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
