
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createTransport } from "https://esm.sh/@modelcontextprotocol/sdk/transport";
import { Client } from "https://esm.sh/@modelcontextprotocol/sdk/client/index";

// Obter as chaves de API das variáveis de ambiente
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SMITHERY_API_KEY = Deno.env.get("SMITHERY_API_KEY") || "";

// Configuração de CORS
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
    // Verificar se temos as chaves de API necessárias
    if (!SMITHERY_API_KEY) {
      throw new Error("SMITHERY_API_KEY não configurada nas variáveis de ambiente");
    }

    // Extrair dados do email da requisição
    const { from, to, subject, text, html } = await req.json();

    if (!from || !to || !subject) {
      throw new Error("Campos obrigatórios ausentes (from, to, subject)");
    }

    // Criar o transporte para o servidor Smithery
    const transport = createTransport(
      "https://server.smithery.ai/@ykhli/mcp-send-emails", 
      { "resendApiToken": RESEND_API_KEY }, 
      SMITHERY_API_KEY
    );

    // Inicializar o cliente MCP
    const client = new Client({
      name: "IPT Teixeira Email Service",
      version: "1.0.0"
    });

    // Conectar ao transporte
    await client.connect(transport);
    
    // Listar as ferramentas disponíveis (para log)
    const tools = await client.listTools();
    console.log(`Ferramentas disponíveis: ${tools.map(t => t.name).join(", ")}`);

    // Enviar o email usando a ferramenta do MCP
    const result = await client.callTool("sendEmail", {
      from,
      to,
      subject,
      text,
      html
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Email enviado com sucesso",
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Erro desconhecido ao enviar email"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
