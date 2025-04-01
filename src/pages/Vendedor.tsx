
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

  const handleEnviarParaVendedor = () => {
    toast.success("Contato encaminhado para um vendedor. Em breve entraremos em contato!");
    // Dar um tempo para o usuário ver a mensagem antes de redirecionar
    setTimeout(() => {
      navigate('/historico-orcamentos');
    }, 2000);
  };

  // Função que verifica se o orçamento está completo
  const verificarOrcamentoCompleto = (mensagens: ChatMessage[]) => {
    // Pegar apenas as mensagens do assistente
    const mensagensAssistente = mensagens.filter(msg => msg.role === 'assistant').map(msg => msg.content.toLowerCase());
    
    // Verifica se nas últimas 3 mensagens do assistente há confirmação de produtos, local e pagamento
    const ultimasMensagens = mensagensAssistente.slice(-3).join(' ');
    
    // Verificar se já tem as informações básicas para um orçamento
    const temProdutos = ultimasMensagens.includes('tubos') || ultimasMensagens.includes('postes') || 
                        ultimasMensagens.includes('blocos') || ultimasMensagens.includes('produto');
    const temLocal = ultimasMensagens.includes('entrega') || ultimasMensagens.includes('local');
    const temPagamento = ultimasMensagens.includes('pagamento') || ultimasMensagens.includes('à vista') || 
                          ultimasMensagens.includes('prazo');
    
    // Verifica se o assistente está perguntando se pode fazer mais alguma coisa
    const perguntandoFinalizar = ultimasMensagens.includes('mais alguma coisa') || 
                                 ultimasMensagens.includes('posso finalizar') ||
                                 ultimasMensagens.includes('algo mais');
    
    // Se tem todas as informações básicas e está perguntando se pode finalizar
    return (temProdutos && temLocal && temPagamento && perguntandoFinalizar);
  };

  // Função para enviar mensagem para o assistente Gemini
  const handleSendMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    console.log("Enviando mensagem para o assistente:", message);
    
    try {
      // Preparar o contexto do usuário
      const userContext = user ? `Cliente logado: ${user.email}` : "Cliente não logado";
      
      // Adicionar a mensagem do usuário à lista
      const newMessage: ChatMessage = {
        content: message,
        role: 'user',
        timestamp: new Date()
      };
      
      // Atualiza o estado com a nova mensagem
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Chamar a função edge do Gemini
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
      
      // Verificar se o algoritmo decide que é hora de sugerir um vendedor humano
      if (
        !showConfirmation && 
        (message.toLowerCase().includes('preço') || 
         message.toLowerCase().includes('orçamento') ||
         message.toLowerCase().includes('comprar') ||
         message.toLowerCase().includes('vendedor') ||
         Math.random() > 0.7) // Chance aleatória para demonstração
      ) {
        setShowConfirmation(true);
      }
      
      // Verificar se o orçamento está pronto para ser finalizado
      // Adicione a resposta do assistente temporariamente para verificação
      const checkMessages = [...updatedMessages, {
        content: data.response || "",
        role: 'assistant',
        timestamp: new Date()
      }];
      
      if (verificarOrcamentoCompleto(checkMessages)) {
        setOrcamentoConcluido(true);
        // Adiciona uma mensagem automática informando que o orçamento será enviado
        setTimeout(() => {
          handleEnviarParaVendedor();
        }, 2000);
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
            
            {/* Botão para solicitar contato */}
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
