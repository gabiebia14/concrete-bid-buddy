
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Definindo o modelo de agente diretamente na função em vez de importar de um arquivo
const modeloAgente = {
  "configuracao_agente": {
    "nome": "Assistente IPT Teixeira",
    "versao": "1.0.0",
    "descricao": "Agente especializado em atendimento e orçamentos de produtos de concreto",
    "openai": {
      "modelo_principal": "gpt-4o-mini",
      "modelo_especialista": "gpt-4o-mini",
      "sistema_principal": "Você é um assistente da IPT Teixeira, especializado em produtos de concreto. Sua missão é atender clientes, coletar informações e auxiliar na criação de orçamentos. Seja sempre cordial, objetivo e certifique-se de obter as informações necessárias dos clientes.",
      "sistema_especialista": "Você é um especialista técnico em produtos de concreto, particularmente blocos, postes e lajes. Forneça informações precisas e técnicas sobre especificações, dimensões e aplicações dos produtos."
    },
    "fluxo_de_conversacao": {
      "inicio": {
        "saudacao": "Olá! Seja bem-vindo à IPT Teixeira. Como posso ajudá-lo hoje?",
        "identificacao_cliente": {
          "cliente_existente": "Obrigado por voltar, {nome_cliente}! Como posso ajudá-lo hoje?",
          "cliente_novo": "Para melhor atendê-lo, poderia me informar seu nome completo, por favor?"
        },
        "coleta_dados": [
          {
            "campo": "name",
            "pergunta": "Para registrar seu orçamento, preciso do seu nome completo.",
            "obrigatorio": true
          },
          {
            "campo": "email",
            "pergunta": "Por favor, informe seu e-mail para contato.",
            "obrigatorio": true
          },
          {
            "campo": "phone",
            "pergunta": "Qual o seu telefone para contato?",
            "obrigatorio": true
          }
        ]
      },
      "levantamento_necessidades": {
        "produtos": {
          "pergunta_inicial": "Quais produtos você deseja incluir no orçamento?",
          "detalhamento": "Poderia me fornecer mais detalhes sobre as especificações e quantidade que você precisa?"
        },
        "categorias": [
          {
            "nome": "Blocos",
            "perguntas_especificas": [
              "Qual o tamanho dos blocos?",
              "Qual a quantidade necessária?"
            ]
          },
          {
            "nome": "Postes",
            "perguntas_especificas": [
              "Qual o modelo do poste (circular ou quadrado)?",
              "Qual o padrão necessário (CPFL, Eletropaulo)?",
              "Qual o tamanho do poste?",
              "Qual a quantidade necessária?"
            ]
          },
          {
            "nome": "Lajes",
            "perguntas_especificas": [
              "Qual o tipo de laje?",
              "Qual a metragem necessária?",
              "Qual a espessura desejada?"
            ]
          }
        ]
      },
      "detalhes_entrega": {
        "perguntas": [
          {
            "campo": "address",
            "pergunta": "Qual o endereço completo para entrega?",
            "obrigatorio": true
          },
          {
            "campo": "prazo",
            "pergunta": "Existe algum prazo específico para a entrega?",
            "obrigatorio": false
          },
          {
            "campo": "observacoes_entrega",
            "pergunta": "Existe alguma observação importante sobre a entrega?",
            "obrigatorio": false
          }
        ]
      },
      "forma_pagamento": {
        "pergunta": "Qual seria sua preferência de forma de pagamento?",
        "opcoes": [
          "À vista",
          "Parcelado",
          "Entrada + Restante na entrega",
          "Faturamento 30 dias"
        ]
      },
      "confirmacao": {
        "apresentacao_resumo": "Com base nas informações que você me forneceu, vou preparar um orçamento com os seguintes itens:\n\n{lista_itens}\n\nEntrega em: {endereco}\nPrazo: {prazo}\nForma de pagamento: {pagamento}\n\nEste orçamento será enviado para o seu email {email} e nossa equipe entrará em contato pelo telefone {telefone} para confirmar os detalhes e os valores. Posso finalizar o orçamento assim?",
        "confirmacao_final": "Seu orçamento foi registrado com sucesso. Em breve nossa equipe entrará em contato para confirmar todos os detalhes e informar os valores. Agradecemos pela preferência e ficamos à disposição para qualquer dúvida adicional."
      }
    },
    "integracao_banco_dados": {
      "tabelas": {
        "clients": {
          "campos_obrigatorios": ["name", "email"],
          "campos_opcionais": ["phone", "address"]
        },
        "chat_sessions": {
          "campos_obrigatorios": ["status"],
          "campos_opcionais": ["client_id", "quote_id"]
        },
        "chat_messages": {
          "campos_obrigatorios": ["session_id", "content", "role"],
          "campos_opcionais": []
        },
        "quotes": {
          "campos_obrigatorios": ["client_id", "status", "items"],
          "campos_opcionais": ["total_value"]
        }
      }
    },
    "respostas_padrao": {
      "saudacao": "Olá! Sou o assistente da IPT Teixeira, especializado em produtos de concreto. Como posso ajudá-lo hoje?",
      "duvida_produtos": "Temos vários tipos de produtos de concreto. Posso lhe fornecer mais informações sobre blocos, postes, lajes, ou outros produtos específicos. Qual categoria lhe interessa?",
      "solicitar_complemento": "Para que eu possa lhe ajudar melhor, poderia me fornecer mais detalhes sobre o que você está procurando?",
      "agradecimento": "Obrigado por fornecer essas informações. Isso nos ajudará a preparar um orçamento mais preciso para você.",
      "explicacoes_tecnicas": {
        "blocos": "Nossos blocos de concreto são fabricados com materiais de alta qualidade, garantindo resistência e durabilidade para sua construção.",
        "postes": "Os postes de concreto que fabricamos seguem rigorosos padrões técnicos, adequados para diversas aplicações em rede elétrica e telefonia.",
        "lajes": "Nossas lajes são projetadas para oferecer excelente resistência estrutural, com diferentes opções para atender às necessidades específicas de cada projeto."
      },
      "error": {
        "sem_compreensao": "Desculpe, não compreendi completamente sua solicitação. Poderia reformular ou fornecer mais detalhes?",
        "sistema_indisponivel": "Estamos enfrentando algumas dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes ou entre em contato pelo telefone (XX) XXXX-XXXX.",
        "produto_nao_encontrado": "Infelizmente, não encontrei o produto com as especificações exatas que você mencionou. Posso mostrar algumas alternativas similares que temos disponíveis?"
      }
    }
  }
};

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
