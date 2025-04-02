import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://deno.land/std@0.168.0/uuid/mod.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ASSISTANT_ID = "asst_UhwRm9FJYXmI51oE5zwm7R8P";
const OPENAI_API_URL = "https://api.openai.com/v1";

// Configuração Supabase
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase URL ou Service Role Key não definidas nas variáveis de ambiente.");
}

// Configuração de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Estrutura para dados de orçamento extraídos
interface ProdutoExtraido {
  nome: string;
  quantidade: number;
  dimensoes: string;
  tipo: string | null;
  padrao: string | null;
}

interface DadosOrcamento {
  produtos: ProdutoExtraido[];
  localEntrega: string;
  prazo: string;
  formaPagamento: string;
}

// Interfaces para a API do OpenAI
interface Thread {
  id: string;
  object: string;
  created_at: number;
  metadata: Record<string, any>;
}

interface Message {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: "user" | "assistant";
  content: Array<{
    type: string;
    text?: {
      value: string;
      annotations: any[];
    }
  }>;
  file_ids: string[];
  assistant_id: string | null;
  run_id: string | null;
  metadata: Record<string, any>;
}

interface Run {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: "queued" | "in_progress" | "completed" | "requires_action" | "failed" | "cancelled" | "expired";
  required_action?: {
    type: string;
    submit_tool_outputs: {
      tool_calls: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        }
      }>
    }
  };
  last_error: null | {
    code: string;
    message: string;
  };
  model: string;
  metadata: Record<string, any>;
}

interface RunResponse {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: string;
  started_at: number | null;
  expires_at: number | null;
  cancelled_at: number | null;
  failed_at: number | null;
  completed_at: number | null;
  last_error: null | {
    code: string;
    message: string;
  };
  model: string;
  instructions: string | null;
  tools: any[];
  file_ids: string[];
  metadata: Record<string, any>;
}

// Função auxiliar para criar cliente Supabase
function getSupabaseAdminClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Função para buscar ou criar cliente
async function getOrCreateClient(supabase: SupabaseClient, userEmail: string | null, userName?: string): Promise<string | null> {
  if (!userEmail) return null;

  try {
    // Tentar buscar cliente existente
    const { data: existingClient, error: findError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error("Erro ao buscar cliente:", findError);
      return null;
    }

    if (existingClient) {
      console.log("Cliente encontrado:", existingClient.id);
      return existingClient.id;
    }

    // Criar novo cliente se não existir
    console.log("Cliente não encontrado, criando novo para:", userEmail);
    const { data: novoCliente, error: insertError } = await supabase
      .from('clients')
      .insert({
        name: userName || userEmail.split('@')[0],
        email: userEmail,
        phone: '',
        tipo_pessoa: 'juridica' // Valor padrão
      })
      .select('id')
      .single();

    if (insertError) {
      console.error("Erro ao criar novo cliente:", insertError);
      return null;
    }

    console.log("Novo cliente criado:", novoCliente.id);
    return novoCliente.id;
  } catch (error) {
    console.error("Erro ao processar cliente:", error);
    return null;
  }
}

// Função para criar orçamento no Supabase
async function createQuoteInDatabase(
  supabase: SupabaseClient, 
  clientId: string, 
  quoteData: DadosOrcamento,
  messages: any[]
): Promise<string | null> {
  if (!clientId || !quoteData.produtos || quoteData.produtos.length === 0) {
    console.error("Dados insuficientes para criar orçamento");
    return null;
  }

  try {
    // Preparar os itens no formato esperado pela tabela quotes
    const items = quoteData.produtos.map(produto => ({
      product_id: uuidv4(),
      product_name: produto.nome,
      dimensions: produto.dimensoes,
      quantity: produto.quantidade,
      tipo: produto.tipo,
      padrao: produto.padrao,
      unit_price: 0, // Será preenchido pelo setor de vendas
      total_price: 0  // Será preenchido pelo setor de vendas
    }));

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        client_id: clientId,
        status: 'pending',
        items: items,
        delivery_location: quoteData.localEntrega,
        delivery_deadline: quoteData.prazo,
        payment_method: quoteData.formaPagamento,
        created_from: 'openai_assistant',
        conversation_history: messages.map(m => ({
          content: m.content,
          role: m.role,
          timestamp: m.timestamp
        })),
        total_value: 0 // Será atualizado pelo setor de vendas
      })
      .select('id')
      .single();

    if (error) {
      console.error("Erro ao criar orçamento:", error);
      return null;
    }

    // Após criar o orçamento com sucesso, salvar resposta completa do agente
    if (quote && quote.id) {
      // Salvar resposta do agente
      const { error: agentResponseError } = await supabase
        .from('agent_responses')
        .insert({
          client_id: clientId,
          quote_id: quote.id,
          response_json: {
            extracted_data: quoteData,
            conversation: messages.map(m => ({
              content: m.content,
              role: m.role,
              timestamp: m.timestamp
            }))
          },
          processed: true
        });
      
      if (agentResponseError) {
        console.error("Erro ao salvar resposta do agente:", agentResponseError);
        // Não bloquear o fluxo principal se falhar o salvamento da resposta do agente
      } else {
        console.log("Resposta do agente salva com sucesso");
      }
    }

    console.log("Orçamento criado com sucesso:", quote.id);
    return quote.id;
  } catch (error) {
    console.error("Erro ao processar criação de orçamento:", error);
    return null;
  }
}

// Funções para interagir com a API do OpenAI
async function createThread(): Promise<Thread> {
  const response = await fetch(`${OPENAI_API_URL}/threads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro ao criar thread: ${errorData}`);
  }

  return await response.json();
}

async function addMessageToThread(threadId: string, content: string, role: "user" = "user"): Promise<Message> {
  const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      role,
      content
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro ao adicionar mensagem à thread: ${errorData}`);
  }

  return await response.json();
}

async function runThread(threadId: string): Promise<Run> {
  const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      assistant_id: ASSISTANT_ID
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro ao executar thread: ${errorData}`);
  }

  return await response.json();
}

async function checkRunStatus(threadId: string, runId: string): Promise<Run> {
  const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/runs/${runId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro ao verificar status da execução: ${errorData}`);
  }

  return await response.json();
}

async function getMessages(threadId: string): Promise<{ data: Message[] }> {
  const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro ao obter mensagens: ${errorData}`);
  }

  return await response.json();
}

// Função para processar execução até completar
async function processRunUntilComplete(threadId: string, runId: string): Promise<Run> {
  let run: Run;
  let attempts = 0;
  const maxAttempts = 60; // 60 tentativas com intervalo de 1s = 1 minuto no máximo

  while (attempts < maxAttempts) {
    run = await checkRunStatus(threadId, runId);
    
    if (run.status === 'completed') {
      return run;
    } else if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
      throw new Error(`Execução falhou com status: ${run.status}, erro: ${run.last_error?.message || 'Desconhecido'}`);
    } else if (run.status === 'requires_action') {
      // Se precisar de ação de ferramenta, poderia ser implementado aqui
      throw new Error('Ação de ferramenta necessária, mas não implementada');
    }
    
    // Aguarda 1 segundo antes de verificar novamente
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error('Tempo limite excedido ao aguardar conclusão da execução');
}

// Função para extrair dados de orçamento do texto
function extrairDadosOrcamento(mensagens: any[]): DadosOrcamento {
  const todasMensagens = Array.isArray(mensagens) 
    ? mensagens.map(msg => {
        if (typeof msg.content === 'string') return msg.content.toLowerCase();
        if (Array.isArray(msg.content)) {
          return msg.content
            .filter(content => content.type === 'text')
            .map(content => content.text?.value?.toLowerCase() || '')
            .join(' ');
        }
        return '';
      }).join(' ')
    : '';
  
  let produtos: ProdutoExtraido[] = [];
  
  if (todasMensagens.includes('tubo') || todasMensagens.includes('tubos')) {
    const tuboRegex = /(\d+)\s*(?:unidades de)?\s*tubos?\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(?:x|por)\s*(\d+(?:[.,]\d+)?)\s*(?:metros)?\s*(?:pa\s*(\d+)|pa(\d+))?/gi;
    const tuboMatches = [...todasMensagens.matchAll(new RegExp(tuboRegex))];
    
    tuboMatches.forEach(match => {
      const quantidade = parseInt(match[1] || '0');
      const dimensao1 = match[2] || '';
      const dimensao2 = match[3] || '';
      const tipo = match[4] || match[5] || '1';
      
      if (quantidade > 0) {
        produtos.push({
          nome: `Tubo de Concreto`,
          dimensoes: `${dimensao1}x${dimensao2}`,
          quantidade: quantidade,
          tipo: `PA${tipo}`,
          padrao: null
        });
      }
    });
  }
  
  if (todasMensagens.includes('poste') || todasMensagens.includes('postes')) {
    const posteRegex = /(\d+)\s*(?:unidades de)?\s*postes?\s*(circular|duplo t)?.*?(\d+(?:[.,]\d+)?)\s*[\/\\]?\s*(\d+(?:[.,]\d+)?)?.*?(cpfl|elektro|telefônica)?/gi;
    const posteMatches = [...todasMensagens.matchAll(new RegExp(posteRegex))];
    
    posteMatches.forEach(match => {
      const quantidade = parseInt(match[1] || '0');
      const tipo = match[2] || '';
      const altura = match[3] || '';
      const capacidade = match[4] || '';
      const padrao = match[5] || '';
      
      if (quantidade > 0) {
        const tipoPoste = tipo?.toLowerCase()?.includes("duplo") ? "Poste Duplo T" : "Poste Circular";
        produtos.push({
          nome: tipoPoste,
          dimensoes: altura && capacidade ? `${altura}/${capacidade}` : '',
          quantidade: quantidade,
          tipo: null,
          padrao: padrao ? padrao.toUpperCase() : null
        });
      }
    });
  }
  
  if (todasMensagens.includes('bloco') || todasMensagens.includes('blocos')) {
    const blocoRegex = /(\d+)\s*(?:unidades de)?\s*blocos?\s*(?:estrutural|vedação|vedacao)?\s*(?:de)?\s*(?:(\d+)x(\d+)x(\d+))?/gi;
    const blocoMatches = [...todasMensagens.matchAll(new RegExp(blocoRegex))];
    
    blocoMatches.forEach(match => {
      const quantidade = parseInt(match[1] || '0');
      const dim1 = match[2] || '';
      const dim2 = match[3] || '';
      const dim3 = match[4] || '';
      const tipoBloco = todasMensagens.includes('estrutural') ? 'Estrutural' : 
                        (todasMensagens.includes('vedação') || todasMensagens.includes('vedacao')) ? 'Vedação' : '';
      
      if (quantidade > 0) {
        produtos.push({
          nome: `Bloco de Concreto ${tipoBloco}`,
          dimensoes: (dim1 && dim2 && dim3) ? `${dim1}x${dim2}x${dim3}` : '',
          quantidade: quantidade,
          tipo: null,
          padrao: null
        });
      }
    });
  }
  
  let localEntrega = '';
  const localRegexPatterns = [
    /(?:(?:local|lugar|cidade|entrega|entregar|endereço|endereco)[:\s]+(?:em|para|no|de|na|ao)?\s+)([a-zà-ú\s,]+)/i,
    /(?:entregar em|entrega em|entregar para|entrega para|enviar para|envio para)[:\s]+([a-zà-ú\s,]+)/i,
    /(?:entrega|entregar|enviar)(?:\s+os\s+produtos)?(?:\s+para)?[:\s]+([a-zà-ú\s,]+)/i
  ];
  
  for (const pattern of localRegexPatterns) {
    const match = todasMensagens.match(pattern);
    if (match && match[1]) {
      localEntrega = match[1].trim().replace(/\s+/g, ' ');
      localEntrega = localEntrega.charAt(0).toUpperCase() + localEntrega.slice(1);
      break;
    }
  }
  
  if (!localEntrega) {
    const cidadesComuns = ['potirendaba', 'são paulo', 'sao paulo', 'rio preto', 'são josé do rio preto', 'ribeirao preto', 'campinas', 'araraquara'];
    for (const cidade of cidadesComuns) {
      if (todasMensagens.includes(cidade)) {
        localEntrega = cidade.charAt(0).toUpperCase() + cidade.slice(1);
        break;
      }
    }
  }
  
  let prazo = '';
  const prazoRegexPatterns = [
    /(?:prazo|entrega)[:\s]+(?:de)?\s*(\d+)\s*(?:dias|dia)/i,
    /(?:em|até)\s+(\d+)\s*(?:dias|dia)/i,
    /(?:prazo\s+(?:de|para)\s+entrega)[:\s]+(?:de)?\s*(\d+)\s*(?:dias|dia)/i
  ];
  
  for (const pattern of prazoRegexPatterns) {
    const match = todasMensagens.match(pattern);
    if (match && match[1]) {
      const dias = parseInt(match[1]);
      prazo = `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
      break;
    }
  }
  
  let formaPagamento = '';
  if (todasMensagens.includes('à vista') || todasMensagens.includes('a vista')) {
    formaPagamento = 'À vista';
  } else if (todasMensagens.includes('30 60 90') || todasMensagens.includes('30/60/90')) {
    formaPagamento = 'Parcelado 30/60/90';
  } else if (todasMensagens.includes('boleto')) {
    formaPagamento = 'Boleto';
  } else if (todasMensagens.includes('cartão') || todasMensagens.includes('cartao')) {
    formaPagamento = 'Cartão';
  } else if (todasMensagens.includes('pix')) {
    formaPagamento = 'PIX';
  }
  
  return {
    produtos,
    localEntrega,
    prazo,
    formaPagamento
  };
}

// Handler principal
serve(async (req) => {
  // Lidar com requisições preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Inicializa cliente Supabase
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return new Response(JSON.stringify({ 
      error: "Configuração do Supabase incompleta no servidor.",
      response: "Desculpe, ocorreu um erro interno. Por favor, tente novamente mais tarde."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }

  try {
    const { messages, userContext, threadId: existingThreadId } = await req.json();
    const userEmail = userContext?.email;
    const userName = userContext?.name;
    
    console.log("Recebendo mensagens:", JSON.stringify(messages.slice(-1)));
    console.log("Thread ID existente:", existingThreadId);
    
    // Criar thread se não existir ou usar a existente
    let threadId = existingThreadId;
    if (!threadId) {
      console.log("Criando nova thread...");
      const thread = await createThread();
      threadId = thread.id;
      console.log("Nova thread criada:", threadId);
      
      // Adicionar mensagens iniciais do histórico à thread
      for (const msg of messages.slice(0, -1)) {
        await addMessageToThread(threadId, msg.content, msg.role === 'assistant' ? 'assistant' : 'user');
      }
    }
    
    // Adicionar a última mensagem do usuário à thread
    const lastMessage = messages[messages.length - 1];
    await addMessageToThread(threadId, lastMessage.content);
    
    // Executar a thread com o assistente
    const run = await runThread(threadId);
    
    // Aguardar conclusão da execução
    await processRunUntilComplete(threadId, run.id);
    
    // Obter as mensagens atualizadas da thread
    const messagesResponse = await getMessages(threadId);
    
    // A resposta mais recente do assistente é a primeira da lista (ordem decrescente)
    const assistantResponse = messagesResponse.data.find(msg => msg.role === 'assistant');
    
    if (!assistantResponse) {
      throw new Error("Nenhuma resposta do assistente encontrada");
    }
    
    // Extrai o conteúdo da resposta do assistente
    const responseContent = assistantResponse.content
      .filter(content => content.type === 'text')
      .map(content => content.text?.value || '')
      .join(' ');
    
    // Verificar se a resposta indica que o orçamento está completo
    const isOrçamentoCompleto = 
      responseContent.toLowerCase().includes("orçamento registrado") || 
      responseContent.toLowerCase().includes("orçamento foi registrado") ||
      responseContent.toLowerCase().includes("pedido confirmado") ||
      (responseContent.toLowerCase().includes("confirmado") && 
       responseContent.toLowerCase().includes("encaminh"));
    
    // Verificar padrões específicos na conversa que indicam conclusão de orçamento
    const ultimasMensagens = messages.slice(-3).map(msg => msg.content.toLowerCase());
    const assistentePediuConfirmacao = ultimasMensagens.some(msg => 
      msg.includes("confirmar") && 
      msg.includes("orçamento") || 
      msg.includes("confirma") && 
      msg.includes("pedido")
    );
    
    const clienteConfirmou = lastMessage.role === 'user' && 
      (lastMessage.content.toLowerCase().includes("sim") || 
       lastMessage.content.toLowerCase().includes("confirmo") || 
       lastMessage.content.toLowerCase().includes("pode") && 
       lastMessage.content.toLowerCase().includes("confirmar"));
    
    console.log("Verificação de orçamento completo:", {
      isOrçamentoCompleto,
      assistentePediuConfirmacao,
      clienteConfirmou
    });
    
    // Tentar extrair dados do orçamento se parecer que está completo
    let quoteCreated = false;
    let quoteId = null;
    let extractedData = null;
    
    if ((isOrçamentoCompleto || (assistentePediuConfirmacao && clienteConfirmou)) && userEmail) {
      try {
        console.log("Tentando extrair dados e criar orçamento...");
        
        // Extrair dados do orçamento
        extractedData = extrairDadosOrcamento(messages);
        console.log("Dados extraídos:", JSON.stringify(extractedData));
        
        // Verificar se temos dados suficientes
        if (extractedData.produtos.length > 0 && extractedData.localEntrega) {
          // Buscar ou criar cliente
          const clientId = await getOrCreateClient(supabase, userEmail, userName);
          
          if (clientId) {
            // Criar orçamento no banco de dados
            quoteId = await createQuoteInDatabase(
              supabase, 
              clientId, 
              extractedData,
              messages
            );
            
            if (quoteId) {
              console.log("Orçamento criado com sucesso no banco de dados, ID:", quoteId);
              quoteCreated = true;
            }
          }
        } else {
          console.log("Dados insuficientes para criar orçamento automaticamente");
        }
      } catch (extractionError) {
        console.error("Erro ao extrair dados e criar orçamento:", extractionError);
      }
    }
    
    // Retorna resposta
    return new Response(JSON.stringify({ 
      response: responseContent,
      threadId,
      quoteCreated,
      quoteId,
      extractedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error("Erro na função Edge:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
