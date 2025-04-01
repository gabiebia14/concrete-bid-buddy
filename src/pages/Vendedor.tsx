import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatMessage, ChatMessageProps } from '@/components/chat/ChatMessage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function Vendedor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [orcamentoConcluido, setOrcamentoConcluido] = useState(false);
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      content: `Olá${user ? ', ' + user.email : ''}! Sou o assistente virtual especializado em vendas da IPT Teixeira, com amplo conhecimento sobre nossa linha de produtos de concreto. Como posso ajudar você hoje?`,
      role: "assistant",
      timestamp: new Date()
    }
  ]);

  const extrairDadosOrcamento = (mensagens: ChatMessageProps[]) => {
    
    const todasMensagens = mensagens.map(msg => msg.content.toLowerCase()).join(' ');
    
    let produtos: any[] = [];
    
    if (todasMensagens.includes('tubo') || todasMensagens.includes('tubos')) {
      const tuboRegex = /(\d+)\s*(?:unidades de)?\s*tubos?\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(?:x|por)\s*(\d+(?:[.,]\d+)?)\s*(?:metros)?\s*(?:pa\s*(\d+)|pa(\d+))?/gi;
      const tuboMatches = [...todasMensagens.matchAll(new RegExp(tuboRegex))];
      
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
    }
    
    if (todasMensagens.includes('poste') || todasMensagens.includes('postes')) {
      const posteRegex = /(\d+)\s*(?:unidades de)?\s*postes?\s*(circular|duplo t)?.*?(\d+(?:[.,]\d+)?)\s*[\/\\]?\s*(\d+(?:[.,]\d+)?)?.*?(cpfl|elektro|telefônica)?/gi;
      const posteMatches = [...todasMensagens.matchAll(new RegExp(posteRegex))];
      
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
    }
    
    if (todasMensagens.includes('bloco') || todasMensagens.includes('blocos')) {
      const blocoRegex = /(\d+)\s*(?:unidades de)?\s*blocos?\s*(?:estrutural|vedação|vedacao)?\s*(?:de)?\s*(?:(\d+)x(\d+)x(\d+))?/gi;
      const blocoMatches = [...todasMensagens.matchAll(new RegExp(blocoRegex))];
      
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
    }
    
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
        break;
      }
    }
    
    if (!localEntrega) {
      const cidadesComuns = ['potirendaba', 'são paulo', 'sao paulo', 'rio preto', 'são josé do rio preto', 'ribeirao preto', 'campinas', 'araraquara'];
      for (const cidade of cidadesComuns) {
        if (todasMensagens.includes(cidade)) {
          localEntrega = cidade.charAt(0).toUpperCase() + cidade.slice(1);
          break;
        }
      }
    }
    
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
        break;
      }
    }
    
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
    
    console.log("Dados extraídos do orçamento:", {
      produtos,
      localEntrega,
      prazo,
      formaPagamento
    });
    
    return {
      produtos,
      localEntrega,
      prazo,
      formaPagamento
    };
  };

  const criarOrcamentoSupabase = async (dadosOrcamento: any) => {
    try {
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
      
      const { data: clienteExistente } = await supabase
        .from('clients')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      
      if (clienteExistente) {
        client_id = clienteExistente.id;
      } else {
        const { data: novoCliente, error: erroCliente } = await supabase
          .from('clients')
          .insert({
            name: user.email.split('@')[0],
            email: user.email,
            phone: ''
          })
          .select('id')
          .single();
        
        if (erroCliente) {
          console.error("Erro ao criar cliente:", erroCliente);
          toast.error("Erro ao criar perfil de cliente");
          return false;
        }
        
        client_id = novoCliente.id;
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
            content: m.content,
            role: m.role,
            timestamp: m.timestamp
          })),
          total_value: totalAmount
        })
        .select();
      
      if (erroOrcamento) {
        console.error("Erro ao criar orçamento:", erroOrcamento);
        toast.error("Erro ao salvar o orçamento");
        return false;
      }
      
      console.log("Orçamento criado com sucesso:", data);
      toast.success("Orçamento criado com sucesso! Em breve entraremos em contato.");
      return true;
    } catch (error) {
      console.error("Erro ao processar orçamento:", error);
      toast.error("Ocorreu um erro ao processar seu orçamento");
      return false;
    } finally {
      setIsSavingQuote(false);
    }
  };

  const handleEnviarParaVendedor = async () => {
    try {
      console.log("Iniciando criação de orçamento...");
      const dadosOrcamento = extrairDadosOrcamento(messages);
      
      // Log mais detalhado para depuração
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
        
        // Adicionar mensagem de confirmação do assistente se não houver uma
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
      console.error("Erro ao enviar para vendedor:", error);
      toast.error("Ocorreu um erro ao processar o orçamento");
    }
  };

  const verificarOrcamentoCompleto = (mensagens: ChatMessageProps[]) => {
    try {
      console.log("Verificando se orçamento está completo...");
      
      const dadosOrcamento = extrairDadosOrcamento(mensagens);
      
      const temProdutos = dadosOrcamento.produtos.length > 0;
      const temLocalEntrega = !!dadosOrcamento.localEntrega;
      const temPrazo = !!dadosOrcamento.prazo;
      const temPagamento = !!dadosOrcamento.formaPagamento;
      
      // Verificar se as últimas 3 mensagens contêm palavras de confirmação
      const ultimasMensagens = mensagens.slice(-3).map(msg => msg.content.toLowerCase());
      
      const palavrasConfirmacao = [
        'sim', 'confirmo', 'confirmado', 'pode confirmar', 'está correto', 'esta correto', 
        'só isso', 'apenas isso', 'nada mais'
      ];
      
      // Verificar se o assistente pediu confirmação e o usuário confirmou
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
        // Verificar se o cliente respondeu com confirmação após a pergunta
        for (let i = indiceConfirmacao + 1; i < mensagens.length; i++) {
          const msg = mensagens[i];
          if (msg.role === 'user') {
            const textoUsuario = msg.content.toLowerCase();
            clienteConfirmou = palavrasConfirmacao.some(palavra => textoUsuario.includes(palavra));
            if (clienteConfirmou) break;
          }
        }
      }
      
      // Log detalhado para depuração
      console.log("Detalhes da verificação:", {
        temProdutos,
        temLocalEntrega,
        temPrazoOuPagamento: temPrazo || temPagamento,
        assistentePediuConfirmacao,
        clienteConfirmou,
        ultimasMensagens
      });
      
      // Considera orçamento completo se tiver produtos, local de entrega, 
      // pelo menos um dos: prazo ou pagamento, e o cliente tiver confirmado
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
    console.log("Enviando mensagem para o assistente:", message);
    
    try {
      const userContext = user ? `Cliente logado: ${user.email}` : "Cliente não logado";
      
      const updatedMessages = [...messages, {
        content: message,
        role: 'user' as 'user' | 'assistant',
        timestamp: new Date()
      }];
      
      // Atualizar mensagens imediatamente no componente
      setMessages(updatedMessages);
      
      // Verificar se o usuário está confirmando antes de chamar API
      // para não depender apenas da resposta do assistente
      const isConfirmationMessage = message.toLowerCase().includes('sim') || 
                                   message.toLowerCase().includes('confirmo');
      
      const shouldCheckCompletion = isConfirmationMessage && verificarOrcamentoCompleto(updatedMessages);
      
      if (shouldCheckCompletion) {
        console.log("Detectou confirmação de pedido, processando...");
        setTimeout(() => {
          handleEnviarParaVendedor();
        }, 800);
      }
      
      // Chamar a função da API
      const { data, error } = await supabase.functions.invoke('vendedor-gemini-assistant', {
        body: { 
          messages: updatedMessages,
          userContext 
        }
      });
      
      if (error) {
        console.error("Erro ao chamar o assistente:", error);
        
        // Se houver erro mas o usuário estava confirmando, tenta criar o orçamento mesmo assim
        if (isConfirmationMessage && !shouldCheckCompletion) {
          console.log("Erro na API, mas detectou confirmação. Tentando processar mesmo assim...");
          setTimeout(() => {
            handleEnviarParaVendedor();
          }, 800);
        }
        
        throw new Error(error.message);
      }
      
      console.log("Resposta do assistente:", data);
      
      // Adicionar resposta do assistente
      const assistantResponse = data.response || "Desculpe, não consegui processar sua solicitação.";
      
      const assistantMessage: ChatMessageProps = {
        content: assistantResponse,
        role: 'assistant',
        timestamp: new Date()
      };
      
      // Atualizar mensagens com a resposta do assistente
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Verificar mais uma vez se o orçamento está completo
      if (!shouldCheckCompletion && verificarOrcamentoCompleto(finalMessages)) {
        console.log("Orçamento completo detectado após resposta do assistente");
        setTimeout(() => {
          handleEnviarParaVendedor();
        }, 1000);
      }
      
      return assistantResponse;
    } catch (error) {
      console.error("Erro no processamento da mensagem:", error);
      
      // Verificar novamente se a mensagem era de confirmação
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

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Fale com um Vendedor</h1>
          <p className="text-muted-foreground">
            Converse com nossa equipe especializada para tirar dúvidas e obter recomendações personalizadas sobre nossos produtos de concreto
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <ChatInterface 
              title="Assistente de Vendas IPT Teixeira" 
              description="Nosso assistente especializado está pronto para ajudar com suas dúvidas sobre produtos de concreto"
              initialMessages={messages}
              onSendMessage={handleSendMessage}
              onConfirmOrder={handleEnviarParaVendedor}
            />
            
            {isLoading && (
              <div className="flex justify-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin text-lime-600" />
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleEnviarParaVendedor}
                className="bg-lime-600 hover:bg-lime-700 px-6 py-2 flex items-center gap-2"
                disabled={orcamentoConcluido || isSavingQuote}
              >
                {isSavingQuote ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando Orçamento...
                  </>
                ) : orcamentoConcluido ? (
                  <>
                    <Send className="h-4 w-4" />
                    Orçamento Registrado!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Solicitar Orçamento com Vendedor
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
