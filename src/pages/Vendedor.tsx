
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/lib/vendedorTypes';
import { v4 as uuidv4 } from 'uuid';

export default function Vendedor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [orcamentoConcluido, setOrcamentoConcluido] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      content: `Olá${user ? ', ' + user.email : ''}! Sou o assistente virtual especializado em vendas da IPT Teixeira, com amplo conhecimento sobre nossa linha de produtos de concreto. Como posso ajudar você hoje?`,
      role: "assistant",
      timestamp: new Date()
    }
  ]);

  const extrairDadosOrcamento = (mensagens: ChatMessage[]) => {
    const todasMensagens = mensagens.map(msg => msg.content.toLowerCase()).join(' ');
    
    let produtos: any[] = [];
    
    // Extração de tubos
    if (todasMensagens.includes('tubo') || todasMensagens.includes('tubos')) {
      const tuboRegex = /(\d+)\s*(?:unidades de)?\s*tubos?\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(?:x|por)\s*(\d+(?:[.,]\d+)?)\s*(?:pa\s*(\d+)|pa(\d+))?/gi;
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
            tipo: `PA${tipo}`
          });
        }
      });
    }
    
    // Extração de postes
    if (todasMensagens.includes('poste') || todasMensagens.includes('postes')) {
      const posteRegex = /(\d+)\s*(?:unidades de)?\s*postes?\s*(?:circular|duplo t)?\s*(?:(\d+(?:[.,]\d+)?)\s*[\/\\]?\s*(\d+(?:[.,]\d+)?))?\s*(?:padrão)?\s*(cpfl|elektro|telefônica)?/gi;
      const posteMatches = [...todasMensagens.matchAll(new RegExp(posteRegex))];
      
      posteMatches.forEach(match => {
        const quantidade = parseInt(match[1] || '0');
        const altura = match[2] || '';
        const capacidade = match[3] || '';
        const padrao = match[4] || '';
        
        if (quantidade > 0) {
          const tipoPoste = todasMensagens.includes("duplo t") ? "Poste Duplo T" : "Poste Circular";
          produtos.push({
            product_id: uuidv4(),
            product_name: tipoPoste,
            dimensions: altura && capacidade ? `${altura}/${capacidade}` : '',
            quantity: quantidade,
            padrao: padrao ? padrao.toUpperCase() : ''
          });
        }
      });
    }
    
    // Extração de blocos
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
            quantity: quantidade
          });
        }
      });
    }
    
    // Extração de local de entrega
    let localEntrega = '';
    const localRegex = /(?:(?:cidade|local|entrega|entregar)[:\s]+(?:em|para|no|de|na|ao)?\s+)([a-zà-ú\s]+)/i;
    const localMatch = todasMensagens.match(localRegex);
    if (localMatch && localMatch[1]) {
      localEntrega = localMatch[1].trim().replace(/\s+/g, ' ');
      localEntrega = localEntrega.charAt(0).toUpperCase() + localEntrega.slice(1);
    }
    
    // Extração de prazo
    let prazo = '';
    const prazoRegex = /(?:prazo|entrega)[:\s]+(?:de)?\s*(\d+)\s*(?:dias|dia)/i;
    const prazoMatch = todasMensagens.match(prazoRegex);
    if (prazoMatch && prazoMatch[1]) {
      const dias = parseInt(prazoMatch[1]);
      prazo = `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
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
      
      // Verificar se temos dados suficientes para criar um orçamento
      if (dadosOrcamento.produtos.length === 0) {
        toast.error("Não foi possível identificar produtos para o orçamento");
        return false;
      }
      
      let client_id = '';
      
      // Buscar cliente existente ou criar novo
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
      
      // Preparar itens do orçamento
      const items = dadosOrcamento.produtos.map((produto: any) => ({
        product_id: produto.product_id,
        product_name: produto.product_name,
        dimensions: produto.dimensions || '',
        quantity: produto.quantity,
        unit_price: 0, // Será preenchido pelo vendedor
        total_price: 0, // Será preenchido pelo vendedor
        padrao: produto.padrao || '',
        tipo: produto.tipo || ''
      }));
      
      // Criar orçamento
      const { data, error: erroOrcamento } = await supabase
        .from('quotes')
        .insert({
          client_id,
          status: 'pending',
          items,
          delivery_location: dadosOrcamento.localEntrega || '',
          delivery_deadline: dadosOrcamento.prazo || '',
          payment_method: dadosOrcamento.formaPagamento || '',
          created_from: 'chat_assistant',
          conversation_history: messages.map(m => ({
            content: m.content,
            role: m.role,
            timestamp: m.timestamp
          }))
        })
        .select();
      
      if (erroOrcamento) {
        console.error("Erro ao criar orçamento:", erroOrcamento);
        toast.error("Erro ao salvar o orçamento");
        return false;
      }
      
      console.log("Orçamento criado com sucesso:", data);
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
    const dadosOrcamento = extrairDadosOrcamento(messages);
    
    // Verificar se temos dados mínimos para criar um orçamento
    if (dadosOrcamento.produtos.length === 0) {
      toast.error("Não foi possível identificar os produtos para o orçamento. Por favor, forneça detalhes específicos sobre os produtos desejados.");
      return;
    }
    
    if (!dadosOrcamento.localEntrega) {
      toast.error("Local de entrega não identificado. Por favor, informe o local de entrega.");
      return;
    }
    
    // Criar orçamento no Supabase
    const sucesso = await criarOrcamentoSupabase(dadosOrcamento);
    
    if (sucesso) {
      toast.success("Orçamento criado com sucesso! Em breve entraremos em contato.");
      setOrcamentoConcluido(true);
      
      // Navegar para histórico após breve delay
      setTimeout(() => {
        navigate('/historico-orcamentos');
      }, 3000);
    }
  };

  const verificarOrcamentoCompleto = (mensagens: ChatMessage[]) => {
    const dadosOrcamento = extrairDadosOrcamento(mensagens);
    
    const temProdutos = dadosOrcamento.produtos.length > 0;
    const temLocalEntrega = !!dadosOrcamento.localEntrega;
    const temPrazo = !!dadosOrcamento.prazo;
    const temPagamento = !!dadosOrcamento.formaPagamento;
    
    const todasMensagens = mensagens.map(msg => msg.content.toLowerCase()).join(' ');
    const clienteConfirmou = todasMensagens.includes('só isso') || 
                            todasMensagens.includes('apenas isso') || 
                            todasMensagens.includes('nada mais') ||
                            todasMensagens.includes('está correto') ||
                            todasMensagens.includes('esta correto') ||
                            todasMensagens.includes('confirmo');
    
    const isCompleto = temProdutos && temLocalEntrega && (temPrazo || temPagamento) && clienteConfirmou;
    
    if (isCompleto) {
      console.log("Orçamento considerado completo:", {
        temProdutos,
        temLocalEntrega,
        temPrazo,
        temPagamento,
        clienteConfirmou
      });
    }
    
    return isCompleto;
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    console.log("Enviando mensagem para o assistente:", message);
    
    try {
      const userContext = user ? `Cliente logado: ${user.email}` : "Cliente não logado";
      
      const newMessage: ChatMessage = {
        content: message,
        role: 'user',
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      const { data, error } = await supabase.functions.invoke('vendedor-gemini-assistant', {
        body: { 
          messages: updatedMessages,
          userContext 
        }
      });
      
      if (error) {
        console.error("Erro ao chamar o assistente:", error);
        throw new Error(error.message);
      }
      
      console.log("Resposta do assistente:", data);
      
      // Mostrar confirmação em determinados casos
      if (
        !showConfirmation && 
        (message.toLowerCase().includes('preço') || 
         message.toLowerCase().includes('orçamento') ||
         message.toLowerCase().includes('comprar') ||
         message.toLowerCase().includes('vendedor') ||
         Math.random() > 0.7)
      ) {
        setShowConfirmation(true);
      }
      
      const assistantMessage: ChatMessage = {
        content: data.response || "Desculpe, não consegui processar sua solicitação.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Verificar automaticamente se o orçamento está completo
      if (verificarOrcamentoCompleto(finalMessages)) {
        setTimeout(() => {
          handleEnviarParaVendedor();
        }, 1500);
      }
      
      return data.response || "Desculpe, não consegui processar sua solicitação.";
    } catch (error) {
      console.error("Erro no processamento da mensagem:", error);
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
