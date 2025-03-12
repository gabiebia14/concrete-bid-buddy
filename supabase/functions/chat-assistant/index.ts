
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

// Configuração do modelo com temperatura reduzida para respostas mais consistentes
const chatModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get('OPENAI_API_KEY'),
  modelName: "gpt-4o-mini",
  temperature: 0.5
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
    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();
    console.log(`Processando requisição de chat para sessão ${sessionId}`);
    
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
    
    // Template do sistema com as instruções detalhadas + catálogo de produtos
    const systemTemplate = ChatPromptTemplate.fromMessages([
      ["system", `Você é um ASSISTENTE DE Vendas com especialização e 20 anos de experiência em conduzir negociações para a IPT Teixeira, líder na produção de artefatos de concreto há mais de 30 anos.

REGRAS DE ATENDIMENTO:
1. Após a primeira mensagem do cliente, cumprimente com: "Olá, sou o assistente de vendas da IPT Teixeira, uma empresa líder na fabricação de artefatos de concreto há mais de 35 anos. Como posso ajudá-lo hoje?"

2. IDENTIFICAÇÃO DE NECESSIDADES:
- Produto exato necessário (apenas da tabela oficial)
- Quantidades de cada item
- Localização de entrega
- Prazo necessário
- Forma de pagamento desejada

3. DIRETRIZES DE COMUNICAÇÃO:
- Não antecipe informações sobre medidas ou tipos
- Aguarde o cliente perguntar especificamente
- Se o cliente não for claro, faça perguntas sobre categorias
- Para postes: primeiro pergunte se é circular ou duplo T
- Só apresente lista completa se o cliente perguntar explicitamente

4. CATÁLOGO DE PRODUTOS ATUAL:
${productsContext}

5. RESTRIÇÕES:
- Nunca invente produtos fora da tabela acima
- Não especule sobre valores
- Não faça suposições sobre finalidades
- Não force fechamento de negócio

6. RECURSOS PERMITIDOS:
- Catálogo: https://www.iptteixeira.com.br/catalogo/2015/files/assets/basic-html/index.html#1
- Vídeo: https://www.youtube.com/watch?v=MOsHYJ1yq5E

7. APÓS COLETAR INFORMAÇÕES:
- Ofereça produtos complementares relacionados
- Confirme satisfação do cliente
- Prepare informações para equipe de vendas`],
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

    return new Response(
      JSON.stringify({ 
        message: prompt.content,
        session_id: sessionId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
