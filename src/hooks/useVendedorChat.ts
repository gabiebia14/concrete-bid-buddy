
import { useState, useEffect } from 'react';
import { ChatMessageProps } from '@/components/chat/ChatMessage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

export interface ExtractedQuoteData {
  produtos: any[];
  localEntrega: string;
  prazo: string;
  formaPagamento: string;
}

// Função isolada para salvar resposta do agente no Supabase
async function salvarRespostaDoAgente(
  clientId: string,
  quoteId: string,
  extractedData: ExtractedQuoteData | null,
  messages: ChatMessageProps[]
): Promise<boolean> {
  console.log("Iniciando salvarRespostaDoAgente no cliente", { 
    timestamp: new Date().toISOString() 
  });
  
  if (!clientId) {
    console.error("ID do cliente não fornecido para salvar resposta do agente");
    return false;
  }

  if (!quoteId) {
    console.error("ID do orçamento não fornecido para salvar resposta do agente");
    return false;
  }

  console.log("Dados para salvar resposta do agente:", {
    clientId,
    quoteId,
    temDadosExtraidos: !!extractedData,
    produtosCount: extractedData?.produtos?.length ?? 0,
    mensagensCount: messages?.length ?? 0
  });

  try {
    // Preparar dados da conversa com tratamento para valores indefinidos
    const conversationData = messages.map(m => ({
      content: m.content || "",
      role: m.role || "user",
      timestamp: m.timestamp ?? new Date()
    }));

    // Primeira tentativa
    const { error } = await supabase
      .from('agent_responses')
      .insert({
        client_id: clientId,
        quote_id: quoteId,
        response_json: {
          extracted_data: extractedData || {},
          conversation: conversationData
        },
        processed: true,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Erro na primeira tentativa de salvar resposta do agente:", error, {
        clientId,
        quoteId,
        timestamp: new Date().toISOString()
      });
      
      // Segunda tentativa após delay
      console.log("Tentando salvar resposta do agente novamente após delay...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { error: retryError } = await supabase
        .from('agent_responses')
        .insert({
          client_id: clientId,
          quote_id: quoteId,
          response_json: {
            extracted_data: extractedData || {},
            conversation: conversationData
          },
          processed: true,
          created_at: new Date().toISOString()
        });
      
      if (retryError) {
        console.error("Erro persistente ao salvar resposta do agente após retry:", retryError);
        return false;
      }
      
      console.log("Resposta do agente salva com sucesso na segunda tentativa");
      return true;
    }

    console.log("Resposta do agente salva com sucesso para o orçamento:", quoteId);
    return true;
  } catch (error) {
    console.error("Exceção ao salvar resposta do agente:", error, {
      timestamp: new Date().toISOString(),
      clientId,
      quoteId
    });
    return false;
  }
}

export function useVendedorChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [orcamentoConcluido, setOrcamentoConcluido] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      content: `Olá${user ? ', ' + user.email : ''}! Sou o assistente virtual especializado em vendas da IPT Teixeira, com amplo conhecimento sobre nossa linha de produtos de concreto. Como posso ajudar você hoje?`,
      role: "assistant",
      timestamp: new Date()
    }
  ]);

  const extrairDadosOrcamento = (mensagens: ChatMessageProps[]): ExtractedQuoteData => {
    console.log("Iniciando extrairDadosOrcamento no cliente", { 
      timestamp: new Date().toISOString(),
      mensagensCount: mensagens?.length ?? 0
    });
    
    const todasMensagens = mensagens.map(msg => msg.content.toLowerCase()).join(' ');
    console.log("Texto completo para extração (primeiros 100 chars):", 
      todasMensagens.substring(0, 100) + "...");
    
    let produtos: any[] = [];
    
    // Extração de tubos
    if (todasMensagens.includes('tubo') || todasMensagens.includes('tubos')) {
      console.log("Detectou menção a tubos, iniciando extração");
      const tuboRegex = /(\d+)\s*(?:unidades de)?\s*tubos?\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(?:x|por)\s*(\d+(?:[.,]\d+)?)\s*(?:metros)?\s*(?:pa\s*(\d+)|pa(\d+))?/gi;
      const tuboMatches = [...todasMensagens.matchAll(new RegExp(tuboRegex))];
      
      console.log(`Encontrados ${tuboMatches.length} padrões de tubos via regex principal`);
      
      tuboMatches.forEach(match => {
        const quantidade = parseInt(match[1] || '0');
        const dimensao1 = match[2] || '';
        const dimensao2 = match[3] || '';
        const tipo = match[4] || match[5] || '1';
        
        if (quantidade > 0) {
          produtos.push({
            product_id: uuidv4(),
            product_name: `Tubo de Concreto`,
            dimensions: `${dimensao1}x${dimensao2}`,
            quantity: quantidade,
            tipo: `PA${tipo}`,
            unit_price: 0,
            total_price: 0
          });
        }
      });
      
      // Extração secundária com regex alternativo
      if (tuboMatches.length === 0) {
        console.log("Tentando extração secundária para tubos");
        const tuboRegexAlt = /tubos?\s*(?:de)?\s*(?:concreto)?\s*(\d+(?:[.,]\d+)?)\s*(?:metros|m)?\s*(?:pa\s*(\d+)|pa(\d+))?/gi;
        const tuboMatchesAlt = [...todasMensagens.matchAll(new RegExp(tuboRegexAlt))];
        
        console.log(`Encontrados ${tuboMatchesAlt.length} padrões de tubos via regex secundário`);
        
        if (tuboMatchesAlt.length > 0) {
          // Procurar por quantidade antes
          const qtdRegex = /(\d+)\s*(?:unidades|peças|pçs|unid)/i;
          const qtdMatch = todasMensagens.match(qtdRegex);
          const quantidade = qtdMatch ? parseInt(qtdMatch[1]) : 1; // Default para 1 se não encontrar
          
          tuboMatchesAlt.forEach(match => {
            const dimensao = match[1] || '';
            const tipo = match[2] || match[3] || '1';
            
            produtos.push({
              product_id: uuidv4(),
              product_name: `Tubo de Concreto`,
              dimensions: `${dimensao}m`,
              quantity: quantidade,
              tipo: `PA${tipo}`,
              unit_price: 0,
              total_price: 0
            });
          });
        }
      }
    }
    
    // Extração de postes
    if (todasMensagens.includes('poste') || todasMensagens.includes('postes')) {
      console.log("Detectou menção a postes, iniciando extração");
      const posteRegex = /(\d+)\s*(?:unidades de)?\s*postes?\s*(circular|duplo t)?.*?(\d+(?:[.,]\d+)?)\s*[\/\\]?\s*(\d+(?:[.,]\d+)?)?.*?(cpfl|elektro|telefônica)?/gi;
      const posteMatches = [...todasMensagens.matchAll(new RegExp(posteRegex))];
      
      console.log(`Encontrados ${posteMatches.length} padrões de postes via regex principal`);
      
      posteMatches.forEach(match => {
        const quantidade = parseInt(match[1] || '0');
        const tipo = match[2] || '';
        const altura = match[3] || '';
        const capacidade = match[4] || '';
        const padrao = match[5] || '';
        
        if (quantidade > 0) {
          const tipoPoste = tipo?.toLowerCase()?.includes("duplo") ? "Poste Duplo T" : "Poste Circular";
          produtos.push({
            product_id: uuidv4(),
            product_name: tipoPoste,
            dimensions: altura && capacidade ? `${altura}/${capacidade}` : '',
            quantity: quantidade,
            padrao: padrao ? padrao.toUpperCase() : '',
            unit_price: 0,
            total_price: 0
          });
        }
      });
      
      // Extração secundária com regex alternativo
      if (posteMatches.length === 0) {
        console.log("Tentando extração secundária para postes");
        const posteRegexAlt = /postes?\s*(circular|duplo t)?.*?(\d+(?:[.,]\d+)?)\s*(?:metros|m)/gi;
        const posteMatchesAlt = [...todasMensagens.matchAll(new RegExp(posteRegexAlt))];
        
        console.log(`Encontrados ${posteMatchesAlt.length} padrões de postes via regex secundário`);
        
        if (posteMatchesAlt.length > 0) {
          // Procurar por quantidade antes
          const qtdRegex = /(\d+)\s*(?:unidades|peças|pçs|unid)/i;
          const qtdMatch = todasMensagens.match(qtdRegex);
          const quantidade = qtdMatch ? parseInt(qtdMatch[1]) : 1; // Default para 1 se não encontrar
          
          // Procurar por padrão
          const padraoRegex = /(cpfl|elektro|telefônica)/i;
          const padraoMatch = todasMensagens.match(padraoRegex);
          const padrao = padraoMatch ? padraoMatch[1] : null;
          
          posteMatchesAlt.forEach(match => {
            const tipo = match[1] || '';
            const altura = match[2] || '';
            
            const tipoPoste = tipo?.toLowerCase()?.includes("duplo") ? "Poste Duplo T" : "Poste Circular";
            produtos.push({
              product_id: uuidv4(),
              product_name: tipoPoste,
              dimensions: `${altura}m`,
              quantity: quantidade,
              padrao: padrao ? padrao.toUpperCase() : '',
              unit_price: 0,
              total_price: 0
            });
          });
        }
      }
    }
    
    // Extração de blocos
    if (todasMensagens.includes('bloco') || todasMensagens.includes('blocos')) {
      console.log("Detectou menção a blocos, iniciando extração");
      const blocoRegex = /(\d+)\s*(?:unidades de)?\s*blocos?\s*(?:estrutural|vedação|vedacao)?\s*(?:de)?\s*(?:(\d+)x(\d+)x(\d+))?/gi;
      const blocoMatches = [...todasMensagens.matchAll(new RegExp(blocoRegex))];
      
      console.log(`Encontrados ${blocoMatches.length} padrões de blocos via regex principal`);
      
      blocoMatches.forEach(match => {
        const quantidade = parseInt(match[1] || '0');
        const dim1 = match[2] || '';
        const dim2 = match[3] || '';
        const dim3 = match[4] || '';
        const tipoBloco = todasMensagens.includes('estrutural') ? 'Estrutural' : 
                          (todasMensagens.includes('vedação') || todasMensagens.includes('vedacao')) ? 'Vedação' : '';
        
        if (quantidade > 0) {
          produtos.push({
            product_id: uuidv4(),
            product_name: `Bloco de Concreto ${tipoBloco}`,
            dimensions: (dim1 && dim2 && dim3) ? `${dim1}x${dim2}x${dim3}` : '',
            quantity: quantidade,
            unit_price: 0,
            total_price: 0
          });
        }
      });
      
      // Extração secundária com regex alternativo
      if (blocoMatches.length === 0) {
        console.log("Tentando extração secundária para blocos");
        const blocoRegexAlt = /blocos?\s*(?:estrutural|vedação|vedacao)?/gi;
        const blocoMatchesAlt = [...todasMensagens.matchAll(new RegExp(blocoRegexAlt))];
        
        console.log(`Encontrados ${blocoMatchesAlt.length} padrões de blocos via regex secundário`);
        
        if (blocoMatchesAlt.length > 0) {
          // Procurar por quantidade antes
          const qtdRegex = /(\d+)\s*(?:unidades|peças|pçs|unid)/i;
          const qtdMatch = todasMensagens.match(qtdRegex);
          const quantidade = qtdMatch ? parseInt(qtdMatch[1]) : 1; // Default para 1 se não encontrar
          
          // Procurar por dimensões
          const dimRegex = /(\d+)\s*(?:x|por)\s*(\d+)\s*(?:x|por)\s*(\d+)/i;
          const dimMatch = todasMensagens.match(dimRegex);
          
          const tipoBloco = todasMensagens.includes('estrutural') ? 'Estrutural' : 
                          (todasMensagens.includes('vedação') || todasMensagens.includes('vedacao')) ? 'Vedação' : '';
          
          produtos.push({
            product_id: uuidv4(),
            product_name: `Bloco de Concreto ${tipoBloco}`,
            dimensions: dimMatch ? `${dimMatch[1]}x${dimMatch[2]}x${dimMatch[3]}` : '',
            quantity: quantidade,
            unit_price: 0,
            total_price: 0
          });
        }
      }
    }
    
    console.log(`Total de produtos extraídos: ${produtos.length}`);
    
    // Extração de local de entrega
    let localEntrega = '';
    const localRegexPatterns = [
      /(?:(?:local|lugar|cidade|entrega|entregar|endereço|endereco)[:\s]+(?:em|para|no|de|na|ao)?\s+)([a-zà-ú\s,]+)/i,
      /(?:entregar em|entrega em|entregar para|entrega para|enviar para|envio para)[:\s]+([a-zà-ú\s,]+)/i,
      /(?:entrega|entregar|enviar)(?:\s+os\s+produtos)?(?:\s+para)?[:\s]+([a-zà-ú\s,]+)/i
    ];
    
    for (const pattern of localRegexPatterns) {
      const match = todasMensagens.match(pattern);
      if (match && match[1]) {
        localEntrega = match[1].trim().replace(/\s+/g, ' ');
        localEntrega = localEntrega.charAt(0).toUpperCase() + localEntrega.slice(1);
        console.log(`Local de entrega encontrado via regex principal: ${localEntrega}`);
        break;
      }
    }
    
    if (!localEntrega) {
      console.log("Local de entrega não encontrado via regex principal, tentando cidades comuns");
      const cidadesComuns = ['potirendaba', 'são paulo', 'sao paulo', 'rio preto', 'são josé do rio preto', 'ribeirao preto', 'campinas', 'araraquara'];
      for (const cidade of cidadesComuns) {
        if (todasMensagens.includes(cidade)) {
          localEntrega = cidade.charAt(0).toUpperCase() + cidade.slice(1);
          console.log(`Local de entrega encontrado em menções diretas: ${localEntrega}`);
          break;
        }
      }
    }
    
    // Extração de prazo
    let prazo = '';
    const prazoRegexPatterns = [
      /(?:prazo|entrega)[:\s]+(?:de)?\s*(\d+)\s*(?:dias|dia)/i,
      /(?:em|até)\s+(\d+)\s*(?:dias|dia)/i,
      /(?:prazo\s+(?:de|para)\s+entrega)[:\s]+(?:de)?\s*(\d+)\s*(?:dias|dia)/i
    ];
    
    for (const pattern of prazoRegexPatterns) {
      const match = todasMensagens.match(pattern);
      if (match && match[1]) {
        const dias = parseInt(match[1]);
        prazo = `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
        console.log(`Prazo encontrado: ${prazo}`);
        break;
      }
    }
    
    // Extração de forma de pagamento
    let formaPagamento = '';
    if (todasMensagens.includes('à vista') || todasMensagens.includes('a vista')) {
      formaPagamento = 'À vista';
    } else if (todasMensagens.includes('30 60 90') || todasMensagens.includes('30/60/90')) {
      formaPagamento = 'Parcelado 30/60/90';
    } else if (todasMensagens.includes('boleto')) {
      formaPagamento = 'Boleto';
    } else if (todasMensagens.includes('cartão') || todasMensagens.includes('cartao')) {
      formaPagamento = 'Cartão';
    } else if (todasMensagens.includes('pix')) {
      formaPagamento = 'PIX';
    }
    
    console.log(`Forma de pagamento encontrada: ${formaPagamento || "Não especificada"}`);
    
    const dadosExtraidos = {
      produtos,
      localEntrega,
      prazo,
      formaPagamento
    };
    
    console.log("Dados extraídos completos:", {
      produtosCount: dadosExtraidos.produtos.length,
      localEntrega: dadosExtraidos.localEntrega,
      prazo: dadosExtraidos.prazo,
      formaPagamento: dadosExtraidos.formaPagamento
    });
    
    return dadosExtraidos;
  };

  const criarOrcamentoSupabase = async (dadosOrcamento: ExtractedQuoteData) => {
    try {
      console.log("Iniciando criarOrcamentoSupabase", { 
        timestamp: new Date().toISOString() 
      });
      
      setIsSavingQuote(true);
      
      if (!user) {
        toast.error("Você precisa estar logado para salvar um orçamento.");
        return false;
      }
      
      if (dadosOrcamento.produtos.length === 0) {
        toast.error("Não foi possível identificar produtos para o orçamento");
        return false;
      }
      
      let client_id = '';
      
      // Obter cliente existente ou criar novo
      const { data: clienteExistente } = await supabase
        .from('clients')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      
      if (clienteExistente) {
        client_id = clienteExistente.id;
        console.log("Cliente existente encontrado:", client_id);
      } else {
        console.log("Cliente não encontrado, criando novo...");
        
        // Primeira tentativa de criar cliente
        let { data: novoCliente, error: erroCliente } = await supabase
          .from('clients')
          .insert({
            name: user.email.split('@')[0],
            email: user.email,
            phone: ''
          })
          .select('id')
          .single();
        
        // Tentar novamente se falhou
        if (erroCliente) {
          console.error("Erro na primeira tentativa de criar cliente:", erroCliente);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: clienteRetry, error: erroRetry } = await supabase
            .from('clients')
            .insert({
              name: user.email.split('@')[0],
              email: user.email,
              phone: ''
            })
            .select('id')
            .single();
            
          if (erroRetry) {
            console.error("Erro persistente ao criar cliente após retry:", erroRetry, {
              email: user.email
            });
            toast.error("Erro ao criar perfil de cliente");
            return false;
          }
          
          novoCliente = clienteRetry;
        }
        
        if (!novoCliente || !novoCliente.id) {
          console.error("Cliente criado, mas ID não retornado");
          toast.error("Erro ao identificar cliente");
          return false;
        }
        
        client_id = novoCliente.id;
        console.log("Novo cliente criado:", client_id);
      }
      
      if (!client_id) {
        console.error("Não foi possível obter o ID do cliente");
        toast.error("Erro ao identificar cliente");
        return false;
      }
      
      const totalAmount = dadosOrcamento.produtos.reduce(
        (total: number, produto: any) => total + (produto.total_price || 0), 
        0
      );

      console.log("Criando orçamento para cliente:", client_id);
      
      // Primeira tentativa de criar orçamento
      const { data, error: erroOrcamento } = await supabase
        .from('quotes')
        .insert({
          client_id,
          status: 'pending',
          items: dadosOrcamento.produtos,
          delivery_location: dadosOrcamento.localEntrega || '',
          delivery_deadline: dadosOrcamento.prazo || '',
          payment_method: dadosOrcamento.formaPagamento || '',
          created_from: 'chat_assistant',
          conversation_history: messages.map(m => ({
            content: m.content || '',
            role: m.role || 'user',
            timestamp: m.timestamp ?? new Date()
          })),
          total_value: totalAmount
        })
        .select();
      
      // Tentar novamente se falhou
      if (erroOrcamento) {
        console.error("Erro na primeira tentativa de criar orçamento:", erroOrcamento);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: dataRetry, error: erroRetry } = await supabase
          .from('quotes')
          .insert({
            client_id,
            status: 'pending',
            items: dadosOrcamento.produtos,
            delivery_location: dadosOrcamento.localEntrega || '',
            delivery_deadline: dadosOrcamento.prazo || '',
            payment_method: dadosOrcamento.formaPagamento || '',
            created_from: 'chat_assistant',
            conversation_history: messages.map(m => ({
              content: m.content || '',
              role: m.role || 'user',
              timestamp: m.timestamp ?? new Date()
            })),
            total_value: totalAmount
          })
          .select();
          
        if (erroRetry) {
          console.error("Erro persistente ao criar orçamento após retry:", erroRetry);
          toast.error("Erro ao salvar o orçamento");
          return false;
        }
        
        console.log("Orçamento criado com sucesso na segunda tentativa:", dataRetry);
        
        if (dataRetry && dataRetry.length > 0 && dataRetry[0].id) {
          const novoQuoteId = dataRetry[0].id;
          console.log("ID do orçamento criado na segunda tentativa:", novoQuoteId);
          setQuoteId(novoQuoteId);

          // Salvar a resposta do agente
          const resultado = await salvarRespostaDoAgente(
            client_id,
            novoQuoteId,
            dadosOrcamento,
            messages
          );
            
          if (!resultado) {
            console.error("Erro ao salvar resposta do agente, mas orçamento foi criado");
          } else {
            console.log("Resposta do agente salva com sucesso");
          }
          
          toast.success("Orçamento criado com sucesso! Em breve entraremos em contato.");
          return true;
        }
      } else {
        console.log("Orçamento criado com sucesso na primeira tentativa:", data);
        
        if (data && data.length > 0 && data[0].id) {
          const novoQuoteId = data[0].id;
          console.log("ID do orçamento criado na primeira tentativa:", novoQuoteId);
          setQuoteId(novoQuoteId);

          // Salvar a resposta do agente
          const resultado = await salvarRespostaDoAgente(
            client_id,
            novoQuoteId,
            dadosOrcamento,
            messages
          );
            
          if (!resultado) {
            // Tentar novamente se falhar
            console.error("Erro ao salvar resposta do agente, tentando novamente");
            
            const resultadoRetry = await salvarRespostaDoAgente(
              client_id,
              novoQuoteId,
              dadosOrcamento,
              messages
            );
            
            if (!resultadoRetry) {
              console.error("Erro persistente ao salvar resposta do agente, mas orçamento foi criado");
            } else {
              console.log("Resposta do agente salva com sucesso na segunda tentativa");
            }
          } else {
            console.log("Resposta do agente salva com sucesso na primeira tentativa");
          }
        } else {
          console.error("Orçamento criado mas ID não retornado");
        }
        
        toast.success("Orçamento criado com sucesso! Em breve entraremos em contato.");
        return true;
      }
      
      console.error("Fluxo de criação de orçamento não concluído corretamente");
      return false;
    } catch (error) {
      console.error("Erro ao processar orçamento:", error, {
        timestamp: new Date().toISOString(),
        produtosCount: dadosOrcamento?.produtos?.length || 0,
        email: user?.email || null
      });
      toast.error("Ocorreu um erro ao processar seu orçamento");
      return false;
    } finally {
      setIsSavingQuote(false);
    }
  };

  const handleEnviarParaVendedor = async () => {
    try {
      console.log("Iniciando handleEnviarParaVendedor", {
        timestamp: new Date().toISOString(),
        quoteIdExistente: quoteId || 'não existe'
      });
      
      if (quoteId) {
        console.log("Orçamento já criado, ID:", quoteId);
        setOrcamentoConcluido(true);
        toast.success("Orçamento #" + quoteId.substring(0, 8) + " criado com sucesso!");
        
        setTimeout(() => {
          navigate('/historico-orcamentos');
        }, 3000);
        return;
      }
      
      console.log("Iniciando criação de orçamento (método de backup)...");
      const dadosOrcamento = extrairDadosOrcamento(messages);
      
      console.log("Produtos encontrados:", dadosOrcamento.produtos.length);
      console.log("Local de entrega:", dadosOrcamento.localEntrega);
      console.log("Prazo:", dadosOrcamento.prazo);
      console.log("Forma de pagamento:", dadosOrcamento.formaPagamento);
      
      if (dadosOrcamento.produtos.length === 0) {
        toast.error("Não foi possível identificar os produtos para o orçamento. Por favor, forneça detalhes específicos sobre os produtos desejados.");
        return;
      }
      
      if (!dadosOrcamento.localEntrega) {
        toast.error("Local de entrega não identificado. Por favor, informe o local de entrega.");
        return;
      }
      
      const sucesso = await criarOrcamentoSupabase(dadosOrcamento);
      
      if (sucesso) {
        setOrcamentoConcluido(true);
        
        const ultimaMensagem = messages[messages.length - 1];
        if (ultimaMensagem.role !== 'assistant' || !ultimaMensagem.content.includes('registrado')) {
          const confirmacaoMessage: ChatMessageProps = {
            content: "Orçamento registrado com sucesso! Nossa equipe entrará em contato em breve com os detalhes. Obrigado pela preferência!",
            role: 'assistant',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, confirmacaoMessage]);
        }
        
        setTimeout(() => {
          navigate('/historico-orcamentos');
        }, 3000);
      }
    } catch (error) {
      console.error("Erro ao enviar para vendedor:", error, {
        timestamp: new Date().toISOString()
      });
      toast.error("Ocorreu um erro ao processar o orçamento");
    }
  };

  const verificarOrcamentoCompleto = (mensagens: ChatMessageProps[]): boolean => {
    try {
      console.log("Verificando se orçamento está completo...");
      
      const dadosOrcamento = extrairDadosOrcamento(mensagens);
      
      const temProdutos = dadosOrcamento.produtos.length > 0;
      const temLocalEntrega = !!dadosOrcamento.localEntrega;
      const temPrazo = !!dadosOrcamento.prazo;
      const temPagamento = !!dadosOrcamento.formaPagamento;
      
      const ultimasMensagens = mensagens.slice(-3).map(msg => msg.content.toLowerCase());
      
      const palavrasConfirmacao = [
        'sim', 'confirmo', 'confirmado', 'pode confirmar', 'está correto', 'esta correto', 
        'só isso', 'apenas isso', 'nada mais'
      ];
      
      let assistentePediuConfirmacao = false;
      let indiceConfirmacao = -1;
      
      for (let i = mensagens.length - 1; i >= 0; i--) {
        const msg = mensagens[i];
        if (msg.role === 'assistant' && 
           (msg.content.toLowerCase().includes('confirmar') || 
            msg.content.toLowerCase().includes('posso confirmar'))) {
          assistentePediuConfirmacao = true;
          indiceConfirmacao = i;
          break;
        }
      }
      
      let clienteConfirmou = false;
      if (assistentePediuConfirmacao && indiceConfirmacao < mensagens.length - 1) {
        for (let i = indiceConfirmacao + 1; i < mensagens.length; i++) {
          const msg = mensagens[i];
          if (msg.role === 'user') {
            const textoUsuario = msg.content.toLowerCase();
            clienteConfirmou = palavrasConfirmacao.some(palavra => textoUsuario.includes(palavra));
            if (clienteConfirmou) break;
          }
        }
      }
      
      console.log("Detalhes da verificação:", {
        temProdutos,
        temLocalEntrega,
        temPrazoOuPagamento: temPrazo || temPagamento,
        assistentePediuConfirmacao,
        clienteConfirmou,
        ultimasMensagens: ultimasMensagens.map(m => m.substring(0, 20) + "...").join(" | ")
      });
      
      return temProdutos && 
             temLocalEntrega && 
             (temPrazo || temPagamento) && 
             assistentePediuConfirmacao && 
             clienteConfirmou;
    } catch (error) {
      console.error("Erro ao verificar se orçamento está completo:", error);
      return false;
    }
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    console.log("Enviando mensagem para o assistente:", message.substring(0, 50) + "...");
    
    try {
      const userContext = user ? {
        email: user.email,
        name: user.email?.split('@')[0],
        isManager: user.isManager
      } : { 
        email: null, 
        name: null,
        isManager: false
      };
      
      console.log("Contexto do usuário:", {
        email: userContext.email || "não logado",
        isManager: userContext.isManager
      });
      
      const updatedMessages = [...messages, {
        content: message,
        role: 'user' as 'user' | 'assistant',
        timestamp: new Date()
      }];
      
      setMessages(updatedMessages);
      
      const isConfirmationMessage = message.toLowerCase().includes('sim') || 
                                   message.toLowerCase().includes('confirmo');
      
      const shouldCheckCompletion = isConfirmationMessage && verificarOrcamentoCompleto(updatedMessages);
      
      try {
        // Usar a edge function OpenAI
        console.log("Chamando edge function vendedor-openai-assistant", {
          threadId: threadId || "nova thread",
          mensagensCount: updatedMessages.length
        });
        
        // Primeira tentativa de chamar a função
        const { data, error } = await supabase.functions.invoke('vendedor-openai-assistant', {
          body: { 
            messages: updatedMessages.map(msg => ({
              content: msg.content || '',
              role: msg.role || 'user',
              timestamp: msg.timestamp ?? new Date().toISOString()
            })),
            userContext,
            threadId // Enviar o threadId existente, se houver
          }
        });
        
        if (error) {
          console.error("Erro ao chamar o assistente:", error);
          throw new Error(error.message);
        }
        
        console.log("Resposta do assistente recebida", {
          threadId: data.threadId || "não retornado",
          quoteCreated: data.quoteCreated || false,
          quoteId: data.quoteId || "não criado",
          extractedDataPresente: !!data.extractedData,
          responseLength: data.response?.length || 0
        });
        
        // Salvar o threadId retornado para uso futuro
        if (data.threadId) {
          setThreadId(data.threadId);
        }
        
        if (data.quoteCreated && data.quoteId) {
          console.log("Orçamento criado automaticamente pela edge function, ID:", data.quoteId);
          setQuoteId(data.quoteId);
          setOrcamentoConcluido(true);

          if (data.extractedData && user) {
            console.log("Tentando salvar resposta do agente no cliente após criação automática");
            let client_id: string | null = null;
            
            const { data: clienteExistente } = await supabase
              .from('clients')
              .select('id')
              .eq('email', user.email || '')
              .maybeSingle();
              
            if (clienteExistente && clienteExistente.id) {
              client_id = clienteExistente.id;
              console.log("ID do cliente encontrado para agent_responses:", client_id);
              
              // Tentativa de salvar resposta do agente
              const resultado = await salvarRespostaDoAgente(
                client_id,
                data.quoteId,
                data.extractedData,
                updatedMessages
              );
                
              if (!resultado) {
                // Segunda tentativa
                console.error("Falha na primeira tentativa de salvar resposta do agente após criação automática, tentando novamente");
                
                const resultadoRetry = await salvarRespostaDoAgente(
                  client_id,
                  data.quoteId,
                  data.extractedData,
                  updatedMessages
                );
                
                if (!resultadoRetry) {
                  console.error("Erro persistente ao salvar resposta do agente após criação automática de orçamento");
                } else {
                  console.log("Resposta do agente salva com sucesso na segunda tentativa após criação automática");
                }
              } else {
                console.log("Resposta do agente salva com sucesso após criação automática");
              }
            } else {
              console.error("Cliente não encontrado para salvar agent_responses", {
                email: user?.email
              });
            }
          } else {
            console.error("Dados insuficientes para salvar agent_responses", {
              extractedData: !!data.extractedData,
              user: !!user
            });
          }
          
          toast.success("Orçamento criado com sucesso! Em breve entraremos em contato.");
          
          setTimeout(() => {
            navigate('/historico-orcamentos');
          }, 3000);
        }
        
        const assistantResponse = data.response || "Desculpe, não consegui processar sua solicitação.";
        
        const assistantMessage: ChatMessageProps = {
          content: assistantResponse,
          role: 'assistant',
          timestamp: new Date()
        };
        
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        
        if (!data.quoteCreated && !shouldCheckCompletion && verificarOrcamentoCompleto(finalMessages)) {
          console.log("Orçamento completo detectado após resposta do assistente");
          setTimeout(() => {
            handleEnviarParaVendedor();
          }, 1000);
        }
        
        return assistantResponse;
      } catch (apiError) {
        console.error("Erro ao chamar API do assistente:", apiError);
        
        if (isConfirmationMessage) {
          console.log("Erro na API, mas detectada mensagem de confirmação");
          
          const dadosOrcamento = extrairDadosOrcamento(updatedMessages);
          const temDadosSuficientes = 
            dadosOrcamento.produtos.length > 0 && 
            !!dadosOrcamento.localEntrega &&
            (!!dadosOrcamento.prazo || !!dadosOrcamento.formaPagamento);
          
          if (temDadosSuficientes) {
            console.log("Erro na API, mas dados suficientes para tentar processar o orçamento");
            
            const fallbackResponse = "Entendi seu pedido. Estamos processando seu orçamento com os dados fornecidos.";
            
            const assistantMessage: ChatMessageProps = {
              content: fallbackResponse,
              role: 'assistant',
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            
            // Tentar processar o orçamento após delay
            setTimeout(() => {
              handleEnviarParaVendedor();
            }, 800);
            
            return fallbackResponse;
          }
        }
        
        // Tentar chamar a função novamente após erro
        try {
          console.log("Tentando chamar a edge function novamente após erro");
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Segunda tentativa de chamar a função
          const { data: dataRetry, error: errorRetry } = await supabase.functions.invoke('vendedor-openai-assistant', {
            body: { 
              messages: updatedMessages.map(msg => ({
                content: msg.content || '',
                role: msg.role || 'user',
                timestamp: msg.timestamp ?? new Date().toISOString()
              })),
              userContext,
              threadId // Enviar o threadId existente, se houver
            }
          });
          
          if (errorRetry) {
            throw new Error(errorRetry.message);
          }
          
          console.log("Segunda tentativa de chamada da edge function bem-sucedida");
          
          const assistantResponse = dataRetry.response || "Entendi seu pedido, mas estou encontrando algumas dificuldades técnicas.";
          
          const assistantMessage: ChatMessageProps = {
            content: assistantResponse,
            role: 'assistant',
            timestamp: new Date()
          };
          
          const finalMessages = [...updatedMessages, assistantMessage];
          setMessages(finalMessages);
          
          return assistantResponse;
        } catch (retryError) {
          console.error("Erro persistente na chamada da edge function:", retryError);
          const fallbackErrorResponse = "Desculpe, encontrei um problema ao processar sua mensagem. Por favor, tente novamente ou solicite contato com um vendedor humano.";
          
          const errorAssistantMessage: ChatMessageProps = {
            content: fallbackErrorResponse,
            role: 'assistant',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, errorAssistantMessage]);
          return fallbackErrorResponse;
        }
      }
    } catch (error) {
      console.error("Erro no processamento da mensagem:", error, {
        timestamp: new Date().toISOString()
      });
      
      if (message.toLowerCase().includes('sim') || message.toLowerCase().includes('confirmo')) {
        const dadosOrcamento = extrairDadosOrcamento(messages);
        if (dadosOrcamento.produtos.length > 0 && dadosOrcamento.localEntrega) {
          console.log("Detectada confirmação em meio a erro. Tentando processar orçamento mesmo assim.");
          setTimeout(() => {
            handleEnviarParaVendedor();
          }, 800);
          
          return "Pedido registrado. Nossa equipe entrará em contato em breve com o orçamento detalhado. Obrigado pela preferência!";
        }
      }
      
      return "Desculpe, encontrei um problema ao processar sua mensagem. Por favor, tente novamente ou solicite contato com um vendedor humano.";
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    isSavingQuote,
    orcamentoConcluido,
    setOrcamentoConcluido,
    handleSendMessage,
    handleEnviarParaVendedor,
    verificarOrcamentoCompleto,
    quoteId,
    threadId
  };
}
