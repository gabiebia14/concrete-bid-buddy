
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { ChatOpenAI } from "npm:@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence } from "npm:@langchain/core/runnables";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuração do modelo com temperatura reduzida para respostas mais consistentes e detalhadas
const chatModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get('OPENAI_API_KEY'),
  modelName: "gpt-4o-mini",
  temperature: 0.3 // Reduzida para maior consistência
});

// Modelo específico para extração de dados estruturados
const structuredDataModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get('OPENAI_API_KEY'),
  modelName: "gpt-4o-mini",
  temperature: 0.1 // Temperatura muito baixa para extração precisa de dados
});

// Criando o cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ehrerbpblmensiodhgka.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocmVyYnBibG1lbnNpb2RoZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTM2NzgsImV4cCI6MjA1NzMyOTY3OH0.Ppae9xwONU2Uy8__0v28OlyFGI6JXBFkMib8AJDwAn8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para buscar todos os produtos
async function fetchAllProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    console.log(`Buscados ${data.length} produtos`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

// Função para buscar produtos por categoria
async function fetchProductsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('category', `%${category}%`);
    
    if (error) throw error;
    console.log(`Buscados ${data.length} produtos na categoria ${category}`);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar produtos da categoria ${category}:`, error);
    return [];
  }
}

// Função para obter todas as categorias de produtos
async function fetchAllCategories() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category');
    
    if (error) throw error;
    
    // Extrair categorias únicas
    const categories = [...new Set(data.map(item => item.category))];
    console.log(`Categorias encontradas: ${categories.join(', ')}`);
    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

// Função para extrair informações estruturadas de orçamento da conversa
async function extractQuoteData(messages) {
  try {
    // Concatenar todas as mensagens para análise
    const conversationText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    // Template para extração de informações de orçamento
    const extractionTemplate = ChatPromptTemplate.fromMessages([
      ["system", `Você é um assistente especializado em extrair informações estruturadas de conversas sobre orçamentos de produtos de concreto.
      
Analise a conversa fornecida e extraia as seguintes informações em formato JSON:

1. Produtos: Liste cada produto mencionado com:
   - nome: nome do produto
   - quantidade: quantidade solicitada
   - especificacoes: quaisquer especificações mencionadas (classe, dimensões, tipo)

2. Cliente:
   - nome: nome do cliente (se mencionado)
   - email: email do cliente (se mencionado)
   - telefone: telefone do cliente (se mencionado)

3. Entrega:
   - local: local de entrega
   - prazo: prazo de entrega solicitado

4. Pagamento:
   - forma: forma de pagamento mencionada

5. Status:
   - completo: true/false (o orçamento contém todas as informações necessárias?)
   - faltando: liste quaisquer informações que ainda precisam ser coletadas

Retorne APENAS o JSON, sem nenhum texto antes ou depois. Se alguma informação não estiver disponível, use null para o valor. Todos os campos são obrigatórios no JSON, mesmo com valores null.

Exemplo de formato:
{
  "produtos": [
    {
      "nome": "Tubo de Concreto",
      "quantidade": 10,
      "especificacoes": "PA1, 1m x 1.5m"
    }
  ],
  "cliente": {
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "telefone": "(11) 98765-4321"
  },
  "entrega": {
    "local": "São Paulo, SP",
    "prazo": "15 dias"
  },
  "pagamento": {
    "forma": "30/60/90 dias"
  },
  "status": {
    "completo": true,
    "faltando": []
  }
}`],
      ["user", conversationText]
    ]);

    // Extrair informações estruturadas
    const response = await extractionTemplate.pipe(structuredDataModel).invoke({});
    console.log("Dados extraídos da conversa:", response.content);
    
    // Tentar fazer parse do JSON
    try {
      // Limpar a resposta para garantir que é um JSON válido
      const jsonString = response.content.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Erro ao extrair dados estruturados:", error);
    return null;
  }
}

// Função para salvar os dados de orçamento extraídos no Supabase
async function saveQuoteData(quoteData, sessionId) {
  try {
    if (!quoteData) return null;
    
    // Primeiro, verificar se já existe um cliente com o email fornecido
    let clientId = null;
    
    if (quoteData.cliente && quoteData.cliente.email) {
      const { data: existingClients } = await supabase
        .from('clients')
        .select('id')
        .eq('email', quoteData.cliente.email)
        .maybeSingle();
      
      if (existingClients) {
        clientId = existingClients.id;
        
        // Atualizar os dados do cliente se necessário
        await supabase
          .from('clients')
          .update({
            name: quoteData.cliente.nome || existingClients.name,
            phone: quoteData.cliente.telefone || existingClients.phone,
            address: quoteData.entrega?.local || existingClients.address
          })
          .eq('id', clientId);
      } else if (quoteData.cliente.nome) {
        // Criar novo cliente
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert({
            name: quoteData.cliente.nome,
            email: quoteData.cliente.email,
            phone: quoteData.cliente.telefone || '',
            address: quoteData.entrega?.local || ''
          })
          .select()
          .single();
        
        if (error) throw error;
        clientId = newClient.id;
      }
    }

    // Preparar os itens do orçamento
    const quoteItems = quoteData.produtos.map(produto => ({
      product_id: '', // Idealmente, deveríamos buscar o ID do produto pelo nome
      product_name: produto.nome,
      dimensions: produto.especificacoes || '',
      quantity: produto.quantidade || 0,
      unit_price: null, // Preço será definido pela equipe de vendas
      total_price: null
    }));

    // Criar o orçamento
    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        client_id: clientId,
        status: 'pending',
        items: quoteItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    // Atualizar a sessão de chat com o ID do orçamento criado
    await supabase
      .from('chat_sessions')
      .update({ 
        status: 'completed',
        quote_id: quote.id 
      })
      .eq('id', sessionId);

    console.log(`Orçamento criado com ID: ${quote.id}`);
    return quote;
  } catch (error) {
    console.error('Erro ao salvar dados do orçamento:', error);
    return null;
  }
}

// Função para verificar se a conversa terminou e deve gerar um orçamento
function shouldGenerateQuote(messages) {
  if (messages.length < 3) return false;
  
  // Verificar as últimas mensagens para indicações de que o orçamento foi finalizado
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()?.content.toLowerCase() || '';
  
  const finalPhrases = [
    'só isso', 'é isso', 'finalizar', 'concluir', 'terminar', 
    'gerar orçamento', 'fazer orçamento', 'criar orçamento',
    'obrigado', 'obrigada', 'valeu', 'ok', 'bom'
  ];
  
  // Verificar se o usuário usou frases de finalização
  const userFinalized = finalPhrases.some(phrase => lastUserMessage.includes(phrase));
  
  // Verificar se o assistente já solicitou informações suficientes
  const assistantAskedForConfirmation = 
    lastAssistantMessage.includes('mais alguma coisa') || 
    lastAssistantMessage.includes('posso ajudar com mais algo') ||
    lastAssistantMessage.includes('deseja adicionar mais produtos') ||
    lastAssistantMessage.includes('agradecemos seu contato');
  
  return userFinalized && assistantAskedForConfirmation;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();
    console.log(`Processando requisição de chat para sessão ${sessionId} com ${messages.length} mensagens`);
    
    // Buscar produtos e categorias para fornecer ao modelo
    const allProducts = await fetchAllProducts();
    const allCategories = await fetchAllCategories();
    
    // Organizar produtos por categoria para referência rápida
    const productsByCategory: Record<string, any[]> = {};
    allCategories.forEach(category => {
      productsByCategory[category] = allProducts.filter(product => 
        product.category === category
      );
    });
    
    // Criar o contexto de produtos para o assistente
    const productsContext = `
CATÁLOGO DE PRODUTOS IPT TEIXEIRA:
${allCategories.map(category => {
  return `
CATEGORIA: ${category}
${productsByCategory[category].map(product => 
  `- ${product.name}: ${product.description} (Dimensões: ${product.dimensions.join(', ')})`
).join('\n')}
`;
}).join('\n')}
`;

    console.log('Contexto de produtos carregado com sucesso');
    
    // Verificar se devemos gerar um orçamento baseado na conversa
    const shouldCreateQuote = shouldGenerateQuote(messages);
    let quoteData = null;
    let quote = null;
    
    if (shouldCreateQuote) {
      console.log("Detectada solicitação de orçamento. Extraindo dados...");
      quoteData = await extractQuoteData(messages);
      
      if (quoteData) {
        console.log("Dados extraídos com sucesso. Salvando orçamento...");
        quote = await saveQuoteData(quoteData, sessionId);
      }
    }
    
    // Template do sistema com as instruções detalhadas + catálogo de produtos
    const systemTemplate = ChatPromptTemplate.fromMessages([
      ["system", `Você é um ASSISTENTE DE Vendas com especialização e 20 anos de experiência em conduzir negociações para a IPT Teixeira, líder na produção de artefatos de concreto há mais de 30 anos.

REGRAS DE ATENDIMENTO IMPORTANTES (SIGA ESTRITAMENTE):
1. Após a primeira mensagem do cliente, cumprimente com: "Olá, sou o assistente de vendas da IPT Teixeira, uma empresa líder na fabricação de artefatos de concreto há mais de 35 anos. Como posso ajudá-lo hoje?"

2. TIPOS DE PRODUTOS QUE REQUEREM PERGUNTAS ESPECÍFICAS:
- Para TUBOS: SEMPRE pergunte qual classe (PA1, PA2, PA3, etc.) quando o cliente mencionar tubos
- Para POSTES: SEMPRE pergunte primeiro se é circular ou duplo T
- NUNCA prossiga com um orçamento sem confirmar estas especificações!

3. IDENTIFICAÇÃO DE NECESSIDADES (SEMPRE COLETE ESTAS INFORMAÇÕES):
- Produto exato necessário (apenas da tabela oficial)
- Especificações técnicas (classe, tipo, formato)
- Quantidades de cada item
- Localização de entrega
- Prazo necessário
- Forma de pagamento desejada

4. DIRETRIZES DE COMUNICAÇÃO:
- Não antecipe informações sobre medidas ou tipos
- Aguarde o cliente perguntar especificamente
- Se o cliente não for claro, faça perguntas detalhadas sobre especificações
- Só apresente lista completa se o cliente perguntar explicitamente

5. CATÁLOGO DE PRODUTOS ATUAL:
${productsContext}

6. RESTRIÇÕES:
- Nunca invente produtos fora da tabela acima
- Não especule sobre valores
- Não faça suposições sobre finalidades
- Não force fechamento de negócio

7. RECURSOS PERMITIDOS:
- Catálogo: https://www.iptteixeira.com.br/catalogo/2015/files/assets/basic-html/index.html#1
- Vídeo: https://www.youtube.com/watch?v=MOsHYJ1yq5E

8. APÓS COLETAR INFORMAÇÕES:
- Ofereça produtos complementares relacionados
- Confirme satisfação do cliente
- Prepare informações para equipe de vendas

9. FINALIZAÇÃO DO ORÇAMENTO:
- Sempre que perceber que o cliente finalizou seu pedido, resuma todas as informações coletadas
- Confirme os dados e avise que o orçamento será encaminhado para análise
- Agradeça o cliente pelo contato`],
      new MessagesPlaceholder("history")
    ]);

    // Processamento da mensagem
    const prompt = await systemTemplate.pipe(chatModel).invoke({
      history: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    });

    console.log('Resposta do chat gerada');

    // Se criamos um orçamento, informar ao usuário
    let finalResponse = prompt.content;
    
    if (quote) {
      finalResponse += `\n\nSeu orçamento foi registrado com sucesso sob o código #${quote.id}. Nossa equipe comercial entrará em contato em breve para discutir os próximos passos.`;
    }

    return new Response(
      JSON.stringify({ 
        message: finalResponse,
        session_id: sessionId,
        quote_data: quoteData,
        quote_id: quote?.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro ao processar requisição:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
