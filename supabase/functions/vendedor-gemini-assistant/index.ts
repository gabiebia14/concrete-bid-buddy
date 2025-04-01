
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

// Configuração de CORS para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Lidar com requisições preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    
    console.log("Recebendo mensagens:", JSON.stringify(messages));
    
    // Formatar as mensagens para o formato do Gemini
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    // Adicionar contexto adicional para o vendedor
    const systemPrompt = {
      role: 'model',
      parts: [{ 
        text: `Você é um assistente virtual especializado em vendas de produtos de concreto da IPT Teixeira.
        Seja educado, amigável e profissional. Seu objetivo é ajudar potenciais clientes, 
        responder às suas dúvidas sobre produtos de concreto como blocos, lajes, tubos e pisos, 
        e eventualmente encaminhá-los para um vendedor humano. 
        Não invente informações sobre preços específicos, mas pode falar sobre vantagens, características 
        e aplicações dos produtos. Contexto do usuário: ${userContext || "Novo cliente"}`
      }]
    };
    
    // Integrar o prompt do sistema com as mensagens
    const geminiMessages = [systemPrompt, ...formattedMessages];
    
    console.log("Enviando para Gemini:", JSON.stringify(geminiMessages));
    
    // Construir a URL com a chave API
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    
    // Fazer a requisição para a API do Gemini
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000
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
      })
    });
    
    const data = await response.json();
    console.log("Resposta do Gemini:", JSON.stringify(data));
    
    if (data.error) {
      throw new Error(`Erro na API do Gemini: ${data.error.message}`);
    }
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui processar sua solicitação. Por favor, tente novamente.";
    
    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error("Erro na função Edge:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
