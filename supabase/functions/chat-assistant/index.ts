
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { OpenAI } from "https://esm.sh/openai@4.28.0";

// Configuração CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente OpenAI
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const openai = new OpenAI({
  apiKey: openaiApiKey
});

// Função para criar uma nova sessão de chat
async function criarSessao(clientId = null) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ 
      client_id: clientId, 
      status: 'active' 
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar sessão:', error);
    throw error;
  }
  
  return data;
}

// Função para salvar mensagem no banco de dados
async function salvarMensagem(sessionId, role, content) {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sessionId,
        role,
        content
      }]);
    
    if (error) {
      console.error('Erro ao salvar mensagem:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
  }
}

// Função para buscar configuração do agente
async function buscarConfigAgente() {
  const { data, error } = await supabase
    .from('agent_configs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Erro ao buscar configuração do agente:', error);
    return null;
  }
  
  return data;
}

// Função para buscar o cliente pelo ID
async function buscarCliente(clientId) {
  if (!clientId) return null;
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();
  
  if (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
  
  return data;
}

// Função para processar mensagem com o OpenAI
async function processarMensagem(mensagem, historico = [], clientId = null, sessionId = null) {
  try {
    // Buscar configuração do agente
    const configAgente = await buscarConfigAgente();
    
    if (!configAgente) {
      throw new Error('Configuração do agente não encontrada');
    }
    
    // Buscar informações do cliente, se disponível
    const cliente = clientId ? await buscarCliente(clientId) : null;
    
    // Criar ou usar a sessão existente
    const sessao = sessionId ? 
      { id: sessionId } : 
      await criarSessao(clientId);
    
    // Salvar mensagem do usuário
    await salvarMensagem(sessao.id, 'user', mensagem);
    
    // Analisar a mensagem para entender a intenção
    const analiseIntencao = await analisarIntencao(mensagem);
    console.log('Análise de intenção:', JSON.stringify(analiseIntencao, null, 2));
    
    // Preparar as mensagens para o modelo
    const mensagens = [
      {
        role: 'system',
        content: configAgente.sistema_principal
      }
    ];
    
    // Adicionar contexto do cliente se disponível
    if (cliente) {
      mensagens.push({
        role: 'system',
        content: `Informações do cliente:\nNome: ${cliente.name}\nEmail: ${cliente.email}\nTelefone: ${cliente.phone || 'Não informado'}\nEndereço: ${cliente.address || 'Não informado'}`
      });
    }
    
    // Adicionar histórico de mensagens
    historico.forEach(msg => {
      if (msg.role !== 'system') {
        mensagens.push({
          role: msg.role,
          content: msg.content
        });
      }
    });
    
    // Adicionar a mensagem atual
    mensagens.push({
      role: 'user',
      content: mensagem
    });
    
    // Gerar resposta com o OpenAI
    const resposta = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: mensagens,
      temperature: 0.7,
      max_tokens: 500
    });
    
    const mensagemResposta = resposta.choices[0].message.content;
    
    // Salvar resposta no banco de dados
    await salvarMensagem(sessao.id, 'assistant', mensagemResposta);
    
    // Verificar se a conversa indica um potencial orçamento
    let quoteId = null;
    if (analiseIntencao.intencao === 'orcamento' && analiseIntencao.dados.produtos.length > 0) {
      quoteId = await criarOuAtualizarOrcamento(sessao.id, clientId, analiseIntencao.dados);
    }
    
    return {
      message: mensagemResposta,
      sessionId: sessao.id,
      quote_id: quoteId
    };
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    throw error;
  }
}

// Analisar a intenção da mensagem
async function analisarIntencao(mensagem) {
  try {
    // Usar OpenAI para analisar a intenção
    const resposta = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um analisador de intenções para um assistente virtual de uma empresa de produtos de concreto.
          Baseado na mensagem do usuário, identifique:
          1. A intenção principal (saudacao, duvida_produtos, orcamento, reclamacao, outro)
          2. Categoria de produto mencionada (blocos, postes, lajes, null)
          3. Extração de dados relevantes (como nome, email, telefone, endereço, produtos com quantidades, etc)
          
          Responda em formato JSON com esta estrutura exata:
          {
            "intencao": "tipo_intencao",
            "categoria_produto": "categoria ou null",
            "dados": {
              "nome": "nome extraído ou null",
              "email": "email extraído ou null",
              "telefone": "telefone extraído ou null",
              "endereco": "endereço extraído ou null",
              "produtos": [
                {"tipo": "tipo do produto", "quantidade": "quantidade mencionada", "especificacoes": "detalhes mencionados"}
              ]
            }
          }`
        },
        {
          role: 'user',
          content: mensagem
        }
      ],
      response_format: { type: 'json_object' }
    });
    
    const analise = JSON.parse(resposta.choices[0].message.content);
    console.log('Análise da mensagem:', analise);
    return analise;
  } catch (error) {
    console.error('Erro ao analisar intenção:', error);
    // Retornar uma análise padrão em caso de erro
    return {
      intencao: "outro",
      categoria_produto: "null",
      dados: {
        nome: null,
        email: null,
        telefone: null,
        endereco: null,
        produtos: []
      }
    };
  }
}

// Criar ou atualizar um orçamento baseado na conversa
async function criarOuAtualizarOrcamento(sessionId, clientId, dados) {
  // Verificar se já existe orçamento vinculado à sessão
  const { data: sessao, error: erroSessao } = await supabase
    .from('chat_sessions')
    .select('quote_id')
    .eq('id', sessionId)
    .single();
  
  if (erroSessao && erroSessao.code !== 'PGRST116') {
    console.error('Erro ao buscar sessão:', erroSessao);
    return null;
  }
  
  // Se já existe um orçamento, retornar o ID
  if (sessao?.quote_id) {
    return sessao.quote_id;
  }
  
  // Se não temos um cliente_id, não podemos criar um orçamento
  if (!clientId) {
    return null;
  }
  
  try {
    // Preparar itens para o orçamento
    const items = dados.produtos.map(p => ({
      product: p.tipo || 'Produto não especificado',
      quantity: p.quantidade || '1',
      specifications: p.especificacoes || '',
      price: 0 // Preço será definido pelo administrador
    }));
    
    // Criar um novo orçamento
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert([{
        client_id: clientId,
        status: 'draft',
        items: items
      }])
      .select()
      .single();
    
    if (quoteError) {
      console.error('Erro ao criar orçamento:', quoteError);
      return null;
    }
    
    // Atualizar a sessão com o quote_id
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ quote_id: quote.id })
      .eq('id', sessionId);
    
    if (updateError) {
      console.error('Erro ao atualizar sessão com quote_id:', updateError);
    }
    
    return quote.id;
  } catch (error) {
    console.error('Erro ao criar/atualizar orçamento:', error);
    return null;
  }
}

// Handler principal
serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Processar apenas requisições POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Extrair dados da requisição
    const { messages, sessionId, clientId } = await req.json();
    
    // Validar dados
    if (!messages || !messages.length) {
      return new Response(
        JSON.stringify({ error: 'Mensagens são obrigatórias' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Extrair a última mensagem (do usuário)
    const lastMessage = messages[messages.length - 1];
    
    // Obter histórico (todas as mensagens exceto a última)
    const historico = messages.slice(0, -1);
    
    // Processar a mensagem
    const resposta = await processarMensagem(
      lastMessage.content, 
      historico, 
      clientId, 
      sessionId
    );
    
    // Retornar a resposta
    return new Response(
      JSON.stringify(resposta),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Erro no handler principal:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
