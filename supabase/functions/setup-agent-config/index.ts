
// Este arquivo configura o agente para o assistente de chat

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Configurações do Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Definir cabeçalhos CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Definir o modelo de sistema principal para o agente
const sistemaPrompt = `Você é o Assistente Virtual da IPT Teixeira, empresa especializada em produtos de concreto pré-fabricados.

INFORMAÇÕES SOBRE A EMPRESA:
- Nome: IPT Teixeira
- Segmento: Fábrica de artefatos de concreto
- Produtos: Blocos estruturais, postes, tubos, lajes, piso intertravado, guias, sarjetas e outros artefatos de concreto
- Localização: Região do ABC Paulista, São Paulo

SUA FUNÇÃO:
- Responder dúvidas sobre produtos de concreto da IPT Teixeira
- Ajudar clientes a escolher os produtos mais adequados para suas necessidades
- Informar sobre especificações técnicas dos produtos
- Coletar informações básicas para orçamentos
- Direcionar o cliente para o formulário de orçamento para solicitações formais

COMPORTAMENTO:
- Seja cordial e prestativo
- Comunique-se de forma clara e técnica quando necessário
- Evite gírias e linguagem muito informal
- Não forneça preços específicos (direcione para orçamento)
- Não se faça passar por humano (deixe claro que é um assistente virtual)
- Colete informações como nome, e-mail, telefone se o cliente demonstrar interesse em um orçamento

RESPOSTAS SOBRE PRODUTOS:
Quando um cliente perguntar sobre um produto específico, forneça:
- Descrição básica
- Aplicações comuns
- Vantagens do produto
- Variações disponíveis (se aplicável)
- Convide-o a fazer um orçamento formal

INFORMAÇÕES DE CONTATO DA EMPRESA:
- Telefone: (11) 4444-5555
- Email: contato@iptteixeira.com.br
- Site: www.iptteixeira.com.br
- Horário de atendimento: Segunda a Sexta, das 8h às 18h`;

serve(async (req) => {
  // Tratamento de CORS para requisições OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verificar se a tabela agent_configs existe
    const { error: tableCheckError } = await supabase.from("agent_configs").select("count", { count: "exact", head: true });
    
    // Se a tabela não existir, criar a tabela
    if (tableCheckError && tableCheckError.code === "42P01") { // relação não existe
      // Criar a tabela agent_configs
      const { error: createTableError } = await supabase.rpc("create_agent_configs_table");
      
      if (createTableError) {
        console.error("Erro ao criar tabela:", createTableError);
        // Tentar criar tabela via SQL diretamente
        const { error: sqlError } = await supabase.sql(`
          CREATE TABLE IF NOT EXISTS public.agent_configs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            sistema_principal TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Permitir acesso de leitura para todos
          ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Allow public read access" ON public.agent_configs FOR SELECT USING (true);
        `);
        
        if (sqlError) {
          console.error("Erro ao criar tabela via SQL:", sqlError);
          throw new Error("Não foi possível criar a tabela agent_configs");
        }
      }
    }
    
    // Configurar o agente se não existir
    const { data: existingConfig, error: configCheckError } = await supabase
      .from("agent_configs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
      
    if (configCheckError) {
      console.error("Erro ao verificar configuração existente:", configCheckError);
      throw new Error("Erro ao verificar configuração do agente");
    }
    
    if (!existingConfig || existingConfig.length === 0) {
      // Inserir a configuração do agente
      const { error: insertError } = await supabase
        .from("agent_configs")
        .insert({
          title: "IPT Teixeira Assistant",
          sistema_principal: sistemaPrompt
        });
        
      if (insertError) {
        console.error("Erro ao inserir configuração:", insertError);
        throw new Error("Não foi possível configurar o agente");
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Agente configurado com sucesso" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Erro ao configurar o agente", 
        error: error instanceof Error ? error.message : String(error) 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
