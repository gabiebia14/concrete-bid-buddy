
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { ChatOpenAI } from "npm:@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence } from "npm:@langchain/core/runnables";

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();
    console.log(`Processing chat request for session ${sessionId}`);
    
    // Template do sistema com as instruções detalhadas
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

4. PRODUTOS DISPONÍVEIS:
BLOCOS:
- Estrutural ou vedação
- Dimensões: 14x19x39cm, 19x19x39cm, 9x19x39cm, 14x19x09cm

POSTES:
- Circular: modelos 08/0800 até 16/1500
- Duplo T: modelos 07,5/0200DAN até 24/1000DAN
- Padrões: CPFL, Elektro, Telefônica

[... outros produtos conforme documentação]

5. RESTRIÇÕES:
- Nunca invente produtos fora da tabela
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

    console.log('Chat response:', prompt);

    return new Response(
      JSON.stringify({ 
        message: prompt.content,
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
