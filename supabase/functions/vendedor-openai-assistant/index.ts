
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

// Função para salvar resposta do agente de forma isolada e mais robusta
async function salvarRespostaDoAgente(
  supabase: SupabaseClient,
  clientId: string,
  quoteId: string,
  extractedData: DadosOrcamento,
  messages: any[]
): Promise<boolean> {
  console.log("Iniciando salvarRespostaDoAgente", { timestamp: new Date().toISOString() });

  if (!supabase) {
    console.error("Cliente Supabase não inicializado");
    return false;
  }

  // Validação dos IDs e campos obrigatórios
  if (!clientId) {
    console.error("ID do cliente não fornecido para salvar resposta do agente");
    return false;
  }

  if (!quoteId) {
    console.error("ID do orçamento não fornecido para salvar resposta do agente");
    return false;
  }

  console.log("Dados para salvar resposta do agente:", {
    clientId,
    quoteId,
    produtosCount: extractedData?.produtos?.length ?? 0,
    temLocalEntrega: !!extractedData?.localEntrega,
    temPrazo: !!extractedData?.prazo,
    temFormaPagamento: !!extractedData?.formaPagamento,
    mensagensCount: Array.isArray(messages) ? messages.length : 0
  });

  try {
    // Preparar os dados de conversa com tratamento para valores indefinidos
    const conversationData = Array.isArray(messages) ? messages.map(m => ({
      content: m.content || "",
      role: m.role || "user",
      timestamp: m.timestamp ?? new Date().toISOString()
    })) : [];

    const responseData = {
      client_id: clientId,
      quote_id: quoteId,
      response_json: {
        extracted_data: extractedData || {},
        conversation: conversationData
      },
      processed: true,
      created_at: new Date().toISOString()
    };

    // Tentativa inicial de salvamento
    const { error } = await supabase
      .from('agent_responses')
      .insert(responseData);

    if (error) {
      console.error("Erro na primeira tentativa de salvar resposta do agente:", error, {
        dadosInseridos: {
          clientId,
          quoteId,
          produtosCount: extractedData?.produtos?.length ?? 0,
          mensagensCount: conversationData.length
        }
      });
      
      // Segunda tentativa após pequeno delay
      console.log("Tentando segunda vez após delay...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error: retryError } = await supabase
        .from('agent_responses')
        .insert(responseData);
        
      if (retryError) {
        console.error("Erro persistente ao salvar resposta do agente após retry:", retryError);
        return false;
      }
      
      console.log("Resposta do agente salva com sucesso na segunda tentativa para o orçamento:", quoteId);
      return true;
    }

    console.log("Resposta do agente salva com sucesso para o orçamento:", quoteId);
    return true;
  } catch (error) {
    console.error("Exceção ao salvar resposta do agente:", error, {
      timestamp: new Date().toISOString(),
      clientId,
      quoteId
    });
    return false;
  }
}

// Função para buscar ou criar cliente
async function getOrCreateClient(supabase: SupabaseClient, userEmail: string | null, userName?: string): Promise<string | null> {
  if (!userEmail) {
    console.error("Email do usuário não fornecido");
    return null;
  }

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
  console.log("Iniciando createQuoteInDatabase", { timestamp: new Date().toISOString() });
  
  if (!clientId) {
    console.error("ID do cliente não fornecido para criar orçamento");
    return null;
  }
  
  if (!quoteData.produtos || quoteData.produtos.length === 0) {
    console.error("Dados insuficientes para criar orçamento: sem produtos");
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

    const quoteInsertData = {
      client_id: clientId,
      status: 'pending',
      items: items,
      delivery_location: quoteData.localEntrega || '',
      delivery_deadline: quoteData.prazo || '',
      payment_method: quoteData.formaPagamento || '',
      created_from: 'openai_assistant',
      conversation_history: Array.isArray(messages) ? messages.map(m => ({
        content: m.content || '',
        role: m.role || 'user',
        timestamp: m.timestamp ?? new Date().toISOString()
      })) : [],
      total_value: 0 // Será atualizado pelo setor de vendas
    };

    console.log("Tentando criar orçamento com dados:", {
      clientId,
      itensCount: items.length,
      localEntrega: quoteData.localEntrega,
      temPrazo: !!quoteData.prazo,
      temFormaPagamento: !!quoteData.formaPagamento
    });

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert(quoteInsertData)
      .select('id')
      .single();

    if (error) {
      console.error("Erro ao criar orçamento:", error, {
        clientId,
        produtosCount: items.length
      });
      return null;
    }

    if (!quote || !quote.id) {
      console.error("Orçamento criado, mas ID não retornado");
      return null;
    }

    console.log("Orçamento criado com sucesso, ID:", quote.id);
    
    // Após criar o orçamento com sucesso, salvar resposta completa do agente
    let agentResponseSaved = await salvarRespostaDoAgente(
      supabase,
      clientId,
      quote.id,
      quoteData,
      messages
    );
    
    if (!agentResponseSaved) {
      console.error("Falha na primeira tentativa de salvar resposta do agente, tentando novamente...");
      
      // Segunda tentativa com um pequeno delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      agentResponseSaved = await salvarRespostaDoAgente(
        supabase,
        clientId,
        quote.id,
        quoteData,
        messages
      );
      
      if (!agentResponseSaved) {
        console.error("Falha persistente ao salvar resposta do agente, mas o orçamento foi criado");
      } else {
        console.log("Resposta do agente salva com sucesso na segunda tentativa");
      }
    }

    return quote.id;
  } catch (error) {
    console.error("Erro ao processar criação de orçamento:", error, {
      timestamp: new Date().toISOString(),
      clientId
    });
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

// Função para extrair dados de orçamento do texto com melhorias
function extrairDadosOrcamento(mensagens: any[]): DadosOrcamento {
  console.log("Iniciando extrairDadosOrcamento", {
    timestamp: new Date().toISOString(),
    mensagensCount: Array.isArray(mensagens) ? mensagens.length : 0
  });
  
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
  
  console.log("Texto completo para extração:", todasMensagens.substring(0, 100) + "...");
  
  let produtos: ProdutoExtraido[] = [];
  
  // Extração de tubos
  if (todasMensagens.includes('tubo') || todasMensagens.includes('tubos')) {
    console.log("Detectou menção a tubos, iniciando extração");
    const tuboRegex = /(\d+)\s*(?:unidades de)?\s*tubos?\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(?:x|por)\s*(\d+(?:[.,]\d+)?)\s*(?:metros)?\s*(?:pa\s*(\d+)|pa(\d+))?/gi;
    const tuboMatches = [...todasMensagens.matchAll(new RegExp(tuboRegex))];
    
    console.log(`Encontrados ${tuboMatches.length} padrões de tubos via regex principal`);
    
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
    
    // Extração secundária com regex alternativo
    if (tuboMatches.length === 0) {
      console.log("Tentando extração secundária para tubos");
      const tuboRegexAlt = /tubos?\s*(?:de)?\s*(?:concreto)?\s*(\d+(?:[.,]\d+)?)\s*(?:metros|m)?\s*(?:pa\s*(\d+)|pa(\d+))?/gi;
      const tuboMatchesAlt = [...todasMensagens.matchAll(new RegExp(tuboRegexAlt))];
      
      console.log(`Encontrados ${tuboMatchesAlt.length} padrões de tubos via regex secundário`);
      
      if (tuboMatchesAlt.length > 0) {
        // Procurar por quantidade antes
        const qtdRegex = /(\d+)\s*(?:unidades|peças|pçs|unid)/i;
        const qtdMatch = todasMensagens.match(qtdRegex);
        const quantidade = qtdMatch ? parseInt(qtdMatch[1]) : 1; // Default para 1 se não encontrar
        
        tuboMatchesAlt.forEach(match => {
          const dimensao = match[1] || '';
          const tipo = match[2] || match[3] || '1';
          
          produtos.push({
            nome: `Tubo de Concreto`,
            dimensoes: `${dimensao}m`,
            quantidade: quantidade,
            tipo: `PA${tipo}`,
            padrao: null
          });
        });
      }
    }
  }
  
  // Extração de postes
  if (todasMensagens.includes('poste') || todasMensagens.includes('postes')) {
    console.log("Detectou menção a postes, iniciando extração");
    const posteRegex = /(\d+)\s*(?:unidades de)?\s*postes?\s*(circular|duplo t)?.*?(\d+(?:[.,]\d+)?)\s*[\/\\]?\s*(\d+(?:[.,]\d+)?)?.*?(cpfl|elektro|telefônica)?/gi;
    const posteMatches = [...todasMensagens.matchAll(new RegExp(posteRegex))];
    
    console.log(`Encontrados ${posteMatches.length} padrões de postes via regex principal`);
    
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
    
    // Extração secundária com regex alternativo
    if (posteMatches.length === 0) {
      console.log("Tentando extração secundária para postes");
      const posteRegexAlt = /postes?\s*(circular|duplo t)?.*?(\d+(?:[.,]\d+)?)\s*(?:metros|m)/gi;
      const posteMatchesAlt = [...todasMensagens.matchAll(new RegExp(posteRegexAlt))];
      
      console.log(`Encontrados ${posteMatchesAlt.length} padrões de postes via regex secundário`);
      
      if (posteMatchesAlt.length > 0) {
        // Procurar por quantidade antes
        const qtdRegex = /(\d+)\s*(?:unidades|peças|pçs|unid)/i;
        const qtdMatch = todasMensagens.match(qtdRegex);
        const quantidade = qtdMatch ? parseInt(qtdMatch[1]) : 1; // Default para 1 se não encontrar
        
        // Procurar por padrão
        const padraoRegex = /(cpfl|elektro|telefônica)/i;
        const padraoMatch = todasMensagens.match(padraoRegex);
        const padrao = padraoMatch ? padraoMatch[1] : null;
        
        posteMatchesAlt.forEach(match => {
          const tipo = match[1] || '';
          const altura = match[2] || '';
          
          const tipoPoste = tipo?.toLowerCase()?.includes("duplo") ? "Poste Duplo T" : "Poste Circular";
          produtos.push({
            nome: tipoPoste,
            dimensoes: `${altura}m`,
            quantidade: quantidade,
            tipo: null,
            padrao: padrao ? padrao.toUpperCase() : null
          });
        });
      }
    }
  }
  
  // Extração de blocos
  if (todasMensagens.includes('bloco') || todasMensagens.includes('blocos')) {
    console.log("Detectou menção a blocos, iniciando extração");
    const blocoRegex = /(\d+)\s*(?:unidades de)?\s*blocos?\s*(?:estrutural|vedação|vedacao)?\s*(?:de)?\s*(?:(\d+)x(\d+)x(\d+))?/gi;
    const blocoMatches = [...todasMensagens.matchAll(new RegExp(blocoRegex))];
    
    console.log(`Encontrados ${blocoMatches.length} padrões de blocos via regex principal`);
    
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
    
    // Extração secundária com regex alternativo
    if (blocoMatches.length === 0) {
      console.log("Tentando extração secundária para blocos");
      const blocoRegexAlt = /blocos?\s*(?:estrutural|vedação|vedacao)?/gi;
      const blocoMatchesAlt = [...todasMensagens.matchAll(new RegExp(blocoRegexAlt))];
      
      console.log(`Encontrados ${blocoMatchesAlt.length} padrões de blocos via regex secundário`);
      
      if (blocoMatchesAlt.length > 0) {
        // Procurar por quantidade antes
        const qtdRegex = /(\d+)\s*(?:unidades|peças|pçs|unid)/i;
        const qtdMatch = todasMensagens.match(qtdRegex);
        const quantidade = qtdMatch ? parseInt(qtdMatch[1]) : 1; // Default para 1 se não encontrar
        
        // Procurar por dimensões
        const dimRegex = /(\d+)\s*(?:x|por)\s*(\d+)\s*(?:x|por)\s*(\d+)/i;
        const dimMatch = todasMensagens.match(dimRegex);
        
        const tipoBloco = todasMensagens.includes('estrutural') ? 'Estrutural' : 
                         (todasMensagens.includes('vedação') || todasMensagens.includes('vedacao')) ? 'Vedação' : '';
                         
        produtos.push({
          nome: `Bloco de Concreto ${tipoBloco}`,
          dimensoes: dimMatch ? `${dimMatch[1]}x${dimMatch[2]}x${dimMatch[3]}` : '',
          quantidade: quantidade,
          tipo: null,
          padrao: null
        });
      }
    }
  }
  
  console.log(`Total de produtos extraídos: ${produtos.length}`);
  
  // Extração de local de entrega
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
      console.log(`Local de entrega encontrado via regex principal: ${localEntrega}`);
      break;
    }
  }
  
  if (!localEntrega) {
    console.log("Local de entrega não encontrado via regex principal, tentando cidades comuns");
    const cidadesComuns = ['potirendaba', 'são paulo', 'sao paulo', 'rio preto', 'são josé do rio preto', 'ribeirao preto', 'campinas', 'araraquara'];
    for (const cidade of cidadesComuns) {
      if (todasMensagens.includes(cidade)) {
        localEntrega = cidade.charAt(0).toUpperCase() + cidade.slice(1);
        console.log(`Local de entrega encontrado em menções diretas: ${localEntrega}`);
        break;
      }
    }
  }
  
  // Extração de prazo
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
      console.log(`Prazo encontrado: ${prazo}`);
      break;
    }
  }
  
  // Extração de forma de pagamento
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
  
  console.log(`Forma de pagamento encontrada: ${formaPagamento || "Não especificada"}`);
  
  const dadosExtraidos = {
    produtos,
    localEntrega,
    prazo,
    formaPagamento
  };
  
  console.log("Dados extraídos completos:", {
    produtosCount: dadosExtraidos.produtos.length,
    localEntrega: dadosExtraidos.localEntrega,
    prazo: dadosExtraidos.prazo,
    formaPagamento: dadosExtraidos.formaPagamento
  });
  
  return dadosExtraidos;
}

// Handler principal
serve(async (req) => {
  console.log("Nova requisição recebida", { 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
  
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
    
    console.log("Contexto da requisição:", {
      threadExistente: !!existingThreadId, 
      userEmail: userEmail || "não fornecido",
      userName: userName || "não fornecido",
      mensagensCount: Array.isArray(messages) ? messages.length : 0,
      ultimaMensagem: Array.isArray(messages) && messages.length > 0 
        ? messages[messages.length - 1]?.content?.substring(0, 50) + "..." 
        : "nenhuma"
    });
    
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
      clienteConfirmou,
      ultimasMensagemTexto: ultimasMensagens.join(" | ").substring(0, 100) + "..."
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
        console.log("Dados extraídos:", {
          produtosCount: extractedData?.produtos?.length || 0,
          localEntrega: extractedData?.localEntrega || "não especificada",
          prazo: extractedData?.prazo || "não especificado",
          formaPagamento: extractedData?.formaPagamento || "não especificada"
        });
        
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
              
              // Verificação redundante - garantir que temos a resposta do agente salva
              const agentResponseVerificacao = await salvarRespostaDoAgente(
                supabase,
                clientId,
                quoteId,
                extractedData,
                messages
              );
              
              if (!agentResponseVerificacao) {
                console.error("Verificação redundante: falha ao salvar resposta do agente");
              } else {
                console.log("Verificação redundante: resposta do agente salva com sucesso");
              }
            } else {
              console.error("Falha ao criar orçamento no banco de dados");
            }
          } else {
            console.error("Não foi possível obter ou criar ID do cliente");
          }
        } else {
          console.log("Dados insuficientes para criar orçamento automaticamente", {
            temProdutos: extractedData.produtos.length > 0,
            temLocalEntrega: !!extractedData.localEntrega,
            produtosCount: extractedData.produtos.length
          });
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
    console.error("Erro na função Edge:", error, {
      timestamp: new Date().toISOString(),
      mensagem: error.message || "Erro sem mensagem"
    });
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
