
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { ChatOpenAI } from "npm:@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence } from "npm:@langchain/core/runnables";
import { StructuredOutputParser } from "npm:langchain/output_parsers";
import { z } from "npm:zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tool para consulta de produtos
const getProductTool = async (query: string) => {
  // Simulação de consulta de produtos
  // Em um ambiente real, isso consultaria o Supabase
  console.log("Searching products with query:", query);
  
  const products = [
    {
      name: "Bloco de Concreto Estrutural",
      category: "Blocos",
      dimensions: ["14x19x39cm", "19x19x39cm"],
      description: "Bloco de concreto para fins estruturais"
    },
    {
      name: "Piso Intertravado",
      category: "Pisos",
      dimensions: ["10x20x6cm", "10x20x8cm"],
      description: "Piso para calçadas e estacionamentos"
    },
    {
      name: "Laje Pré-Moldada",
      category: "Lajes",
      dimensions: ["30x10x3m", "40x10x3m"],
      description: "Laje pré-moldada para construção civil"
    }
  ];
  
  // Filtra produtos com base na consulta
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase()) || 
    product.category.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase())
  );
  
  return filteredProducts.length > 0 
    ? JSON.stringify(filteredProducts) 
    : "Nenhum produto encontrado com esta descrição.";
};

// Tool para geração de orçamento
const createQuoteTool = async (input: string) => {
  try {
    const quoteData = JSON.parse(input);
    console.log("Creating quote with data:", quoteData);
    
    // Aqui implementaríamos a lógica real de criação do orçamento
    // Retornando uma simulação de orçamento
    return JSON.stringify({
      success: true,
      quoteId: `quote-${Date.now()}`,
      items: quoteData.items,
      estimatedTotal: quoteData.items.reduce((total, item) => 
        total + (item.quantity * (item.unitPrice || 10)), 0)
    });
  } catch (e) {
    console.error("Error creating quote:", e);
    return JSON.stringify({
      success: false,
      error: "Formato inválido para criação de orçamento"
    });
  }
};

// Parser para detecção de intenção de orçamento
const quoteIntentSchema = z.object({
  isQuoteRequest: z.boolean().describe("Verdadeiro se o usuário está solicitando um orçamento"),
  products: z.array(z.object({
    name: z.string().describe("Nome do produto"),
    quantity: z.number().optional().describe("Quantidade desejada"),
    dimensions: z.string().optional().describe("Dimensões do produto")
  })).optional().describe("Lista de produtos mencionados"),
  needsMoreInfo: z.boolean().describe("Verdadeiro se precisamos de mais informações do usuário")
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key não configurada" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, sessionId } = await req.json();
    console.log(`Processing chat request for session ${sessionId}`);
    
    // Modelo de chat
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini",
      temperature: 0.7
    });
    
    // Parser para detecção de intenção de orçamento
    const quoteIntentParser = StructuredOutputParser.fromZodSchema(quoteIntentSchema);
    
    // Template da mensagem do sistema
    const systemTemplate = ChatPromptTemplate.fromMessages([
      ["system", `Você é um assistente virtual da IPT Teixeira, uma empresa especializada em produtos de concreto.
      
Produtos disponíveis:
- Blocos de concreto estrutural (dimensões: 14x19x39cm, 19x19x39cm)
- Pisos intertravados (dimensões: 10x20x6cm, 10x20x8cm)
- Lajes pré-moldadas (dimensões: 30x10x3m, 40x10x3m)
- Vigas e colunas de concreto

Seu objetivo é ajudar clientes a:
1. Obter informações sobre produtos de concreto
2. Criar orçamentos personalizados
3. Esclarecer dúvidas sobre entrega, instalação e pagamento

Responda sempre em português do Brasil de forma educada e profissional.

Se detectar que o cliente quer um orçamento, colete:
- Quais produtos específicos desejam
- Quantidades necessárias
- Dimensões preferidas
- Local de entrega

Você tem acesso às seguintes ferramentas:
- Pesquisa de produtos: para buscar detalhes sobre produtos específicos
- Criação de orçamento: para gerar um orçamento baseado nas necessidades do cliente`],
      new MessagesPlaceholder("history")
    ]);

    // Analisador para detectar intenção de orçamento
    const intentDetectionChain = RunnableSequence.from([
      chatModel,
      new StringOutputParser(),
      async (output) => {
        // Analisar a última mensagem para detectar intenção
        try {
          return {
            rawOutput: output,
            // Simplificação: verificamos palavras-chave em vez de usar o parser completo
            isQuoteRequest: output.toLowerCase().includes("orçamento") || 
                           output.toLowerCase().includes("preço") || 
                           output.toLowerCase().includes("comprar"),
            needsProductSearch: output.toLowerCase().includes("produto") || 
                               output.toLowerCase().includes("informações") ||
                               output.toLowerCase().includes("detalhe")
          };
        } catch (e) {
          console.error("Error parsing output:", e);
          return { rawOutput: output, isQuoteRequest: false, needsProductSearch: false };
        }
      }
    ]);

    // Função para processar a conversa
    const processQuery = async (query: string) => {
      // Preparar as mensagens para o modelo
      const formattedMessages = messages.map((msg: any) => {
        return msg.role === "user" 
          ? { type: "human", content: msg.content }
          : { type: "ai", content: msg.content };
      });
      
      // Executar a análise de intenção
      const prompt = await systemTemplate.pipe(intentDetectionChain).invoke({
        history: formattedMessages
      });
      
      // Determinar o próximo passo com base na intenção
      if (prompt.needsProductSearch) {
        // Buscar informações do produto
        const productInfo = await getProductTool(query);
        console.log("Product search results:", productInfo);
        
        // Gerar resposta incluindo informações do produto
        const augmentedQuery = `O cliente perguntou: "${query}". Aqui estão as informações dos produtos relacionados: ${productInfo}. 
        Por favor, forneça uma resposta útil com estas informações, formatando os detalhes de forma clara e amigável.`;
        
        const response = await chatModel.invoke([
          { role: "system", content: systemTemplate.messages[0].content },
          ...formattedMessages,
          { role: "user", content: augmentedQuery }
        ]);
        
        return response.content;
      } 
      else if (prompt.isQuoteRequest) {
        // Processar solicitação de orçamento
        console.log("Quote request detected");
        
        // Em uma implementação real, aqui extrairíamos os detalhes do orçamento
        // Para simplificar, vamos apenas gerar uma resposta apropriada
        const response = await chatModel.invoke([
          { role: "system", content: systemTemplate.messages[0].content },
          ...formattedMessages,
          { role: "user", content: `O cliente fez uma solicitação de orçamento: "${query}". 
          Solicite mais detalhes se necessário ou sugira os próximos passos para criar o orçamento.` }
        ]);
        
        return response.content;
      }
      else {
        // Resposta padrão para outras consultas
        const response = await chatModel.invoke([
          { role: "system", content: systemTemplate.messages[0].content },
          ...formattedMessages
        ]);
        
        return response.content;
      }
    };

    // Processar a última mensagem
    const lastUserMessage = messages.filter((msg: any) => msg.role === "user").pop();
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ 
          error: "Nenhuma mensagem do usuário encontrada" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await processQuery(lastUserMessage.content);
    
    return new Response(
      JSON.stringify({ 
        message: response,
        session_id: sessionId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
