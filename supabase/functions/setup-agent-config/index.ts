
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import modeloAgente from '../../data/modelo-agente.json' assert { type: "json" };

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Tratar requisições CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se a tabela agent_configs existe
    const { error: tableCheckError } = await supabase
      .from('agent_configs')
      .select('id')
      .limit(1);

    // Se houver erro, provavelmente a tabela não existe
    if (tableCheckError) {
      console.log('A tabela agent_configs não existe. Criando...');
      
      // Criar a tabela agent_configs
      const createTableResult = await supabase.rpc('create_agent_configs_table');
      console.log('Resultado da criação da tabela:', createTableResult);
    }

    // Extrair dados do modelo de agente
    const config = modeloAgente.configuracao_agente;
    
    // Preparar dados para inserção
    const agentConfigData = {
      name: config.nome,
      version: config.versao,
      description: config.descricao,
      sistema_principal: config.openai.sistema_principal,
      sistema_especialista: config.openai.sistema_especialista,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Salvar configuração do agente na tabela
    const { data, error } = await supabase
      .from('agent_configs')
      .upsert([agentConfigData], { onConflict: 'name' })
      .select();
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Configuração do agente salva com sucesso',
        data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
