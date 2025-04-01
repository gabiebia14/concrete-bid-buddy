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
    
    if (todasMensagens.includes('tubo') || todasMensagens.includes('tubos')) {
      const tuboRegex = /(\d+)\s*(?:unidades de)?\s*tubos?\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(?:x|por)\s*(\d+(?:[.,]\d+)?)\s*(?:pa\s*(\d+)|pa(\d+))?/i;
      const tuboMatches = [...todasMensagens.matchAll(new RegExp(tuboRegex, 'gi'))];
      
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
    
    if (todasMensagens.includes('poste') || todasMensagens.includes('postes')) {
      const posteRegex = /(\d+)\s*(?:unidades de)?\s*postes?\s*(?:circular)?\s*(?:(\d+)\s*[\/\\]?\s*(\d+))?\s*(?:padrão)?\s*(cpfl|elektro|telefônica)?/i;
      const posteMatches = [...todasMensagens.matchAll(new RegExp(posteRegex, 'gi'))];
      
      posteMatches.forEach(match => {
        const quantidade = parseInt(match[1] || '0');
        const altura = match[2] || '';
        const capacidade = match[3] || '';
        const padrao = match[4] || '';
        
        if (quantidade > 0) {
          produtos.push({
            product_id: uuidv4(),
            product_name: `Poste Circular`,
            dimensions: altura && capacidade ? `${altura}/${capacidade}` : '',
            quantity: quantidade,
            padrao: padrao.toUpperCase()
          });
        }
      });
    }
    
    let localEntrega = '';
    const localRegex = /(?:(?:cidade|local|entrega)\s+(?:em|para|:)?\s+)(\w+)/i;
    const localMatch = todasMensagens.match(localRegex);
    if (localMatch && localMatch[1]) {
      localEntrega = localMatch[1].charAt(0).toUpperCase() + localMatch[1].slice(1);
    }
    
    let prazo = '';
    const prazoRegex = /(\d+)\s*dias/i;
    const prazoMatch = todasMensagens.match(prazoRegex);
    if (prazoMatch && prazoMatch[1]) {
      prazo = `${prazoMatch[1]} dias`;
    }
    
    let formaPagamento = '';
    if (todasMensagens.includes('à vista') || todasMensagens.includes('a vista')) {
      formaPagamento = 'À vista';
    } else if (todasMensagens.includes('boleto')) {
      formaPagamento = 'Boleto';
    } else if (todasMensagens.includes('cartão') || todasMensagens.includes('cartao')) {
      formaPagamento = 'Cartão';
    } else if (todasMensagens.includes('pix')) {
      formaPagamento = 'PIX';
    }
    
    return {
      produtos,
      localEntrega,
      prazo,
      formaPagamento
    };
  };

  const criarOrcamentoSupabase = async (dadosOrcamento: any) => {
    try {
      if (!user) {
        toast.error("Você precisa estar logado para salvar um orçamento.");
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
      
      const items = dadosOrcamento.produtos.map((produto: any) => ({
        product_id: produto.product_id,
        product_name: produto.product_name,
        dimensions: produto.dimensions,
        quantity: produto.quantity,
        unit_price: 0,
        total_price: 0,
        padrao: produto.padrao,
        tipo: produto.tipo
      }));
      
      const { error: erroOrcamento } = await supabase
        .from('quotes')
        .insert({
          client_id,
          status: 'pending',
          items,
          delivery_location: dadosOrcamento.localEntrega,
          delivery_deadline: dadosOrcamento.prazo,
          payment_method: dadosOrcamento.formaPagamento,
          created_from: 'chat_assistant',
          conversation_history: messages.map(m => ({
            content: m.content,
            role: m.role,
            timestamp: m.timestamp
          }))
        });
      
      if (erroOrcamento) {
        console.error("Erro ao criar orçamento:", erroOrcamento);
        toast.error("Erro ao salvar o orçamento");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao processar orçamento:", error);
      toast.error("Ocorreu um erro ao processar seu orçamento");
      return false;
    }
  };

  const handleEnviarParaVendedor = async () => {
    const dadosOrcamento = extrairDadosOrcamento(messages);
    
    if (dadosOrcamento.produtos.length === 0) {
      toast.error("Não foi possível identificar os produtos para o orçamento");
      return;
    }
    
    if (!dadosOrcamento.localEntrega) {
      toast.error("Local de entrega não identificado");
      return;
    }
    
    const sucesso = await criarOrcamentoSupabase(dadosOrcamento);
    
    if (sucesso) {
      toast.success("Orçamento criado com sucesso! Em breve entraremos em contato.");
      setOrcamentoConcluido(true);
    }
  };

  const verificarOrcamentoCompleto = (mensagens: ChatMessage[]) => {
    const todasMensagens = mensagens.map(msg => msg.content.toLowerCase()).join(' ');
    
    const temProdutos = todasMensagens.includes('unidades') || 
                        todasMensagens.includes('quantidade') || 
                        todasMensagens.includes('tubos') || 
                        todasMensagens.includes('postes') || 
                        todasMensagens.includes('blocos');
    
    const temLocalEntrega = todasMensagens.includes('entrega') || 
                           todasMensagens.includes('cidade') || 
                           todasMensagens.includes('endereço');
    
    const temPrazo = todasMensagens.includes('prazo') || 
                    todasMensagens.includes('dias') || 
                    todasMensagens.includes('data');
    
    const temPagamento = todasMensagens.includes('pagamento') || 
                        todasMensagens.includes('à vista') || 
                        todasMensagens.includes('parcelado') || 
                        todasMensagens.includes('boleto');
    
    const clienteConfirmou = todasMensagens.includes('só isso') || 
                            todasMensagens.includes('apenas isso') || 
                            todasMensagens.includes('nada mais');
    
    return temProdutos && temLocalEntrega && temPrazo && temPagamento && clienteConfirmou;
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
      
      if (verificarOrcamentoCompleto(finalMessages)) {
        setTimeout(() => {
          setOrcamentoConcluido(true);
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
                disabled={orcamentoConcluido}
              >
                <Send className="h-4 w-4" />
                {orcamentoConcluido ? "Orçamento Registrado!" : "Solicitar Contato com Vendedor"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
