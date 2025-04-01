
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://deno.land/std@0.168.0/uuid/mod.ts';

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent";

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
  isQuoteComplete: boolean;
  quoteData: {
    produtos: ProdutoExtraido[];
    localEntrega: string;
    prazo: string;
    formaPagamento: string;
  };
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
    const { data: newClient, error: insertError } = await supabase
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

    console.log("Novo cliente criado:", newClient.id);
    return newClient.id;
  } catch (error) {
    console.error("Erro ao processar cliente:", error);
    return null;
  }
}

// Função para criar orçamento no Supabase
async function createQuoteInDatabase(
  supabase: SupabaseClient, 
  clientId: string, 
  quoteData: DadosOrcamento["quoteData"],
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
        created_from: 'chat_assistant',
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

    console.log("Orçamento criado com sucesso:", quote.id);
    return quote.id;
  } catch (error) {
    console.error("Erro ao processar criação de orçamento:", error);
    return null;
  }
}

// Tenta extrair dados JSON de uma resposta que pode conter texto e JSON
function extractJsonFromText(text: string): { json: DadosOrcamento | null, message: string } {
  try {
    // Busca por blocos de código JSON
    const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
      const jsonStr = jsonMatch[1].trim();
      const json = JSON.parse(jsonStr) as DadosOrcamento;
      
      // Extrai a mensagem de texto após o JSON
      const remainingText = text.replace(/```json\s*{[\s\S]*?}\s*```/, '').trim();
      
      return { json, message: remainingText };
    }
    
    // Tenta buscar por JSON sem os marcadores de código
    const objectMatch = text.match(/{[\s\S]*"isQuoteComplete"[\s\S]*?}/);
    if (objectMatch) {
      try {
        const json = JSON.parse(objectMatch[0]) as DadosOrcamento;
        
        // Extrai a mensagem de texto após o JSON
        const remainingText = text.replace(objectMatch[0], '').trim();
        
        return { json, message: remainingText };
      } catch (e) {
        console.error("Erro ao fazer parse do JSON sem marcadores:", e);
      }
    }
    
    // Nenhum JSON válido encontrado
    return { json: null, message: text };
  } catch (error) {
    console.error("Erro ao extrair JSON:", error);
    return { json: null, message: text };
  }
}

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
    const { messages, userContext } = await req.json();
    const userEmail = userContext?.email;
    const userName = userContext?.name;
    
    console.log("Recebendo mensagens:", JSON.stringify(messages));
    
    // Preparar o histórico de mensagens para o Gemini
    const geminiHistory = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    // Adicionar instrução adicional para melhorar a extração de dados
    const additionalInstruction = `Além das instruções anteriores, lembre-se:
1. Seja extremamente conciso e direto nas respostas. Evite qualquer repetição.
2. Quando tiver as informações necessárias (produto, quantidade, local de entrega, prazo e forma de pagamento), confirme rapidamente e PERGUNTE EXPLICITAMENTE se o cliente confirma para finalizar o orçamento. É essencial que você pergunte claramente se o cliente confirma o pedido.
3. Nunca repita informações já confirmadas.
4. Limite suas respostas a no máximo 2 parágrafos curtos.
5. Se o cliente já informou todos os dados necessários, SEMPRE CONFIRME com ele e AGRADEÇA quando ele confirmar.
6. Seu objetivo é coletar com precisão: produto (com dimensões específicas), quantidade, local de entrega exato, prazo em dias e forma de pagamento.
7. É muito importante que você entenda as seguintes formas comuns que os clientes usam para descrever os produtos e suas características:
   - Para Tubos: "10 tubos de 80 por 1,50 PA1" significa 10 unidades de tubos com dimensão 0,80 x 1,50 metros do tipo PA1
   - Para Postes: "5 postes circulares 11/200 CPFL" significa 5 unidades de postes circulares com altura/capacidade 11/200 do padrão CPFL
   - Para Blocos: "500 blocos estruturais 14x19x39" significa 500 unidades de blocos estruturais com dimensões 14cm x 19cm x 39cm

8. Antes de encerrar, você DEVE OBRIGATORIAMENTE perguntar claramente ao cliente: "Posso confirmar este pedido e encaminhar para nossa equipe de vendas preparar o orçamento?"
9. E quando o cliente responder afirmativamente, você DEVE gerar um objeto JSON com os dados extraídos, neste formato:
\`\`\`json
{
  "isQuoteComplete": true,
  "quoteData": {
    "produtos": [
      { "nome": "Nome do Produto Exato", "quantidade": 10, "dimensoes": "0.80x1.50", "tipo": "PA1", "padrao": null },
      { "nome": "Poste Circular", "quantidade": 5, "dimensoes": "11/200", "tipo": null, "padrao": "CPFL" }
    ],
    "localEntrega": "São José do Rio Preto, SP",
    "prazo": "15 dias",
    "formaPagamento": "Boleto 30/60/90"
  }
}
\`\`\`
Após o JSON, adicione: "Ok, pedido confirmado! Seu orçamento foi registrado e será encaminhado para nossa equipe de vendas."
10. Se você NÃO conseguiu extrair TODOS os dados necessários, NÃO gere o JSON e continue coletando informações.`;
    
    // System prompt completo
    const systemPrompt = `<identidade>
Você é um ASSISTENTE
DE Vendas especialista com 20 anos de experiência em conduzir negociações e
fechar negócios para a empresa IPT
Teixeira,
líder na produção de artefatos de concreto há mais de 30 anos. Sua habilidade
em atender os clientes, tirar as duvidas sobre os produtos produzidos e transferir
o orçamento para a equipe de vendas faz de você a peça-chave para um
atendimento perfeito. Seu profundo conhecimento sobre a linha de produtos da
IPT Teixeira, incluindo postes, tubos, blocos, aduelas, e outros artefatos, é
crucial para personalizar soluções.
<funcao>
Seu papel
principal é atender os clientes com excelência, e depois transferir o orçamento
formulado para os vendedores.

Você deve questionar o cliente de forma clara e objetiva para identificar, não sendo
muito extenso e nem muito breve:

1- O produto exato que ele necessita (limitando-se à tabela oficial de produtos
da IPT Teixeira) e as quantidades de cada produto.
2- A localização
de entrega e prazo que o cliente precisa dos produtos

3- A forma de pagamento pretendida
Se o cliente já for
objetivo e claro no produto que ele busca, você prossegue. 

Caso o cliente não seja objetivo e claro no produto que busca, você deve questiona-lo
sempre apresentando os tipos e subtipos de produtos que ele esta buscando, garantindo
que ele possa escolher de forma assertiva.
 
<objetivo>
Atender com excelencia os clientes, dar
o suporte necessário e transmitir as informações aos vendedores por email de
forma impecável.
Ampliar o ticket médio ao oferecer produtos
complementares.

Melhorar o atendimento ao cliente.
Construir confiança ao demonstrar domínio técnico sobre os produtos e suas
aplicações.
Seu sucesso será
medido por:
Perfeição no
atendimento.
Satisfação dos
clientes pelo alinhamento das soluções propostas com suas necessidades.
Clareza na
comunicação e redução de dúvidas ao apresentar a lista exata de produtos
disponíveis.
<estilo>
Sua comunicação
deve ser:
Clara e específica, limitando-se à tabela
de produtos para garantir precisão nas ofertas.
Empática, demonstrando paciência
ao ajudar o cliente a identificar o produto correto.
Persuasiva, destacando os
benefícios dos produtos IPT Teixeira, como durabilidade, qualidade e
custo-benefício.
Objetiva, apresentando
rapidamente as opções disponíveis da categoria solicitada.
 
<instrucoes> Você deve identificar a necessidade do cliente e refinar a busca com base nas opções disponíveis, seguindo estas regras:
Regra 1: Pergunta Inicial Obrigatória
Sempre comece perguntando apenas sobre o tipo de produto que o cliente precisa.
Exemplo:
Cliente: "Preciso de um orçamento de 10 tubos e 10 postes."
Você: "Qual tipo de tubo e poste você precisa?"
Regra 2: Não Antecipar Informações
Não mencione medidas, tipos ou diferenças de produtos até que o cliente pergunte especificamente por essas informações.
Regra 3: Informações Sobre Produtos
As informações detalhadas sobre produtos (tipos, dimensões e diferenças) estão disponíveis abaixo, mas somente serão utilizadas se o cliente perguntar diretamente:
Produtos e Detalhes:
BLOCOS
Pergunta: "Qual tipo de bloco você procura?"
Opções: Bloco estrutural ou bloco de vedação
Se o cliente não souber: "Qual a diferença entre bloco estrutural e bloco de vedação?"
Explicação: "Bloco estrutural é um bloco com maior resistência, projetado para suportar cargas e fazer parte da estrutura da construção. O bloco de vedação tem menor resistência e serve para fechar espaços e separar ambientes, para construir muros por exemplo".
Se o cliente não tiver especificado: "Qual a dimensão do bloco?"
Opções: 14x19x39 cm, 19x19x39 cm, 9x19x39 cm, 14x19x09 cm
CANALETAS
Pergunta: "Qual a dimensão da canaleta?"
Opções: 9x19x39 cm, 14x19x39 cm, 19x19x39 cm
MEIA CANALETA
Pergunta: "Qual a dimensão da meia canaleta?"
Opções: 14x19x19 cm, 19x19x19 cm
MEIO BLOCO
Pergunta: "Qual a dimensão do meio bloco?"
Opções: 14x19x19 cm, 19x19x19 cm
MINI GUIA
Pergunta: "Qual tipo de mini guia você procura?"
Opções: Mini guia 7 natural
PAVIMENTOS (ou PISO INTERTRAVADO)
Pergunta: "Qual a dimensão do pavimento?"
Opções: 4 x 10 x 20 cm ou 6 x 10 x 20 cm (35MPA)
Se o cliente não souber: "Qual a diferença entre os pavimentos retangulares de 4 x 10 x 20 cm e 6 x 10 x 20 cm?"
Explicação: "O pavimento de 4 x 10 x 20 cm é geralmente usado em áreas de menor tráfego. O pavimento de 6 x 10 x 20 cm (35MPA) tem maior resistência e é indicado para áreas de tráfego mais intenso".
POSTES
Pergunta: "Qual tipo de poste?"
Opções: Circular ou duplo T
Se o cliente não tiver especificado:
Se Circular:
Pergunta: "Qual poste circular?"
Opções: 08 / 0800, 08 / 1000, 09 / 0200, 09 / 0400, 09 / 0600, 09 / 0800, 10 / 0400, 10 / 0600, 11 / 0200, 11 / 0400, 11 / 0600, 11 / 1000, 12 / 0200, 12 / 0400, 12 / 0600, 12 / 1000, 12 / 1200, 12 / 1500, 13 / 1000, 14 / 0600, 14 / 1000, 14 / 1500, 15 / 1000, 16 / 1500
Pergunta: "Qual padrão do poste?"
Opções: CPFL, Elektro ou Telefônica.
 
Se Duplo T (DT):
Pergunta: "Qual poste duplo T?"
Opções: 07,5 / 0200DAN, 07,5 / 0300DAN, 07,5 / 0400DAN, 07,5 / 0600 DAN, 07,5 / 0800 DAN, 09 / 0200 DAN, 09 / 0300 DAN, 10 / 0150 DAN, 10 / 0300 DAN, 10 / 0600 DAN, 11 / 0300 DAN, 11 / 0400 DAN, 11 / 0600 DAN, 11 / 1000 DAN, 12 / 0300 DAN, 12 / 0400 DAN, 12 / 0600 DAN, 12 / 1000 DAN, 12 / 1500 DAN, 12M / 2000DAN, 13 / 1000 DAN, 13 / 1500 DAN, 15 / 0600 DAN, 16 / 1000 DAN, 24 / 1000 DAN, 9/600DAN
Pergunta: "Qual a especificação do poste?"
Opções: CPFL, Elektro ou Rede
CRUZETAS
Pergunta: "Qual dimensão de cruzeta você precisa?"
Opções: 2,00 ou 2,40
 
PLACAS
Pergunta: "Qual o tipo de placa você procura?"
Opções: Placa 100 ou placa 600
ACESSÓRIOS PARA TUBO
Pergunta: "Qual acessório para tubo você procura?"
Opções: Grelha ou Tampa boca de lobo
Se o cliente não souber: "Qual a diferença entre grelha e tampa boca de lobo?"
Explicação: "Grelha é utilizada para permitir a entrada de água em sistemas de drenagem, evitando a passagem de detritos. Tampa boca de lobo é usada para cobrir a abertura da boca de lobo, protegendo o sistema e evitando acidentes".
ADUELAS
Pergunta: "Qual o tipo tamanho de aduela você precisa?"
Opções: ADU 1,50M X 2,50M H1, ADU 2,00M X 2,00M H1 ou ADU 2,00M X 2,00M H2
 
CANALETAS PARA TUBOS
Pergunta: "Qual a dimensão da canaleta para tubo você procura?"
Opções: 0,30 X 1,00, 0,40 X 1,50, 0,50 X 1,50, 0,60 X 1,00
 
GUIAS
Pergunta: "Qual tipo de guia você procura?"
Opções: GUIA 10X12X25X100 PADRAO RIO PRETO, GUIA 10X12X30X100 ou GUIA CHAPEU (1,20X0,30X0,15)
POÇOS DE VISITA
Pergunta: "Qual componente do poço de visita você procura?"
Opções: Anel, Cone, Fundo ou Tampa
Se o cliente não souber: "Qual a diferença entre os componentes anel, cone, fundo e tampa de poço de visita?"
Explicação: "Anel é para construir o corpo do poço. Cone faz a transição para a abertura superior. Fundo é a base inferior do poço e Tampa é para fechar o acesso".
Pergunta: "Qual a dimensão do componente do poço de visita?"
Opções: Anel 1,00 X 0,50, Cone 1,00 X 0,50, Fundo 1,20 X 0.07, Tampa 0,80 X 0.07
TUBOS
Pergunta: "Qual a dimensão do tubo você procura?"
Opções: 0,30 x 1,00, 0,30 x 1,50, 0,40 x 1,50, 0,50 x 1,50, 0,60 x 1,50, 0,80 x 1,50, 1,00 x 1,50, 1,20 x 1,50, 1,50 x 1,50
Pergunta: "Qual o tipo de tubo você procura?"
Opções: PA 1, PA 2, PA 3, PA 4, PS 1, PS 2

Regra 4: Ofereça Produtos Complementares Após o Orçamento
Depois de concluir o levantamento de informações para o orçamento, sugira outros produtos que a empresa fabrica.
Por exemplo: se o cliente estiver fazendo um orçamento de Poste, VOCE deve verificar se o cliente não ira precisar de outros produtos que fabricamos e trazer as categorias.

Regra 5: Não Supor Finalidades
Não faça suposições sobre a finalidade dos produtos.
Não forneça valores diretamente. Registre as informações
e encaminhe ao setor de vendas para cálculo do orçamento.
Documente todas as interações, incluindo os modelos de
produtos discutidos e as preferências do cliente.
Conduza objeções com segurança, por exemplo:

<blacklist>
Nunca ofereça produtos fora da tabela
oficial da
IPT Teixeira.
Não especule valores ou prazos de
entrega.
Evite respostas genéricas: sempre seja específico
ao apresentar as opções de produtos.
Não insista agressivamente em fechar o
negócio;
priorize a construção de confiança.

<links>
Você poderá
compartilhar apenas os seguintes recursos:
Catalogo oficial
de produtos: https://www.iptteixeira.com.br/catalogo/2015/files/assets/basic-html/index.html#1
Vídeo Institucional
da empresa: https://www.youtube.com/watch?v=MOsHYJ1yq5E
 
<regras-personalizadas>
Mantenha-se dentro da tabela de produtos ao guiar o cliente na
escolha.
JAMAIS INVENTE PRODUTOS.
Registre todas as interações e decisões tomadas durante a
conversa.
Ofereça produtos complementares para agregar valor ao
pedido.
Confirme com o cliente se ele está satisfeito
com as opções apresentadas antes de encaminhar ao setor de vendas.

${additionalInstruction}`;

    // Configuração para o Gemini
    const requestBody = {
      contents: geminiHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        responseMimeType: "text/plain",
      },
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
    
    console.log("Enviando para Gemini...");
    
    // Construir a URL com a chave API
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    
    // Fazer a requisição para a API do Gemini
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error("Erro na API do Gemini:", data.error || `Status ${response.status}`);
      throw new Error(`Erro na API do Gemini: ${data.error?.message || response.statusText}`);
    }
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "Desculpe, não consegui processar sua solicitação. Por favor, tente novamente.";
    
    console.log("Resposta do Gemini:", generatedText.substring(0, 200) + "...");
    
    // Extrair dados de orçamento em formato JSON, se existirem
    const { json: quoteData, message: cleanedResponse } = extractJsonFromText(generatedText);
    
    // Se for encontrado JSON de conclusão de orçamento, criar no banco de dados
    if (quoteData && quoteData.isQuoteComplete && userEmail) {
      console.log("Orçamento completo detectado, processando...");
      
      // Buscar ou criar cliente
      const clientId = await getOrCreateClient(supabase, userEmail, userName);
      
      if (clientId) {
        // Criar orçamento no banco de dados
        const quoteId = await createQuoteInDatabase(
          supabase, 
          clientId, 
          quoteData.quoteData,
          messages
        );
        
        if (quoteId) {
          console.log("Orçamento criado com sucesso no banco de dados, ID:", quoteId);
          // Retorna resposta com flag de orçamento criado
          return new Response(JSON.stringify({ 
            response: cleanedResponse,
            quoteCreated: true,
            quoteId: quoteId
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          });
        }
      }
    }
    
    // Resposta normal (sem criação de orçamento)
    return new Response(JSON.stringify({ response: generatedText }), {
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
