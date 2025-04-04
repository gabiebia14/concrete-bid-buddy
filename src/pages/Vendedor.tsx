
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useVendedorChat } from '@/hooks/useVendedorChat';
import { VendedorHeader } from '@/components/vendedor/VendedorHeader';
import { LoadingIndicator } from '@/components/vendedor/LoadingIndicator';
import { EnviarOrcamentoButton } from '@/components/vendedor/EnviarOrcamentoButton';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Vendedor() {
  const {
    messages,
    isLoading,
    isSavingQuote,
    orcamentoConcluido,
    quoteId,
    threadId,
    handleSendMessage,
    handleEnviarParaVendedor
  } = useVendedorChat();

  // Monitoramento de status em log para depuração
  useEffect(() => {
    console.log("Status do chat de vendas:", {
      threadId: threadId || 'não iniciado',
      quoteId: quoteId || 'não criado',
      isLoading,
      isSavingQuote,
      orcamentoConcluido,
      mensagensCount: messages.length
    });
    
    // Exibir toast quando um orçamento for criado
    if (quoteId && !orcamentoConcluido) {
      toast.success(`Orçamento #${quoteId.substring(0, 8)} foi criado, mas ainda não foi finalizado`);
    }
  }, [threadId, quoteId, isLoading, isSavingQuote, orcamentoConcluido, messages.length]);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <VendedorHeader />

        <div className="grid grid-cols-1 gap-6">
          <div>
            <ChatInterface 
              title="Assistente de Vendas IPT Teixeira" 
              description="Nosso assistente especializado OpenAI está pronto para ajudar com suas dúvidas sobre produtos de concreto"
              initialMessages={messages}
              onSendMessage={handleSendMessage}
              onConfirmOrder={handleEnviarParaVendedor}
            />
            
            <LoadingIndicator isLoading={isLoading} />
            
            <EnviarOrcamentoButton 
              onClick={handleEnviarParaVendedor}
              isSaving={isSavingQuote}
              orcamentoConcluido={orcamentoConcluido}
            />
            
            {quoteId && (
              <div className="mt-4 text-center text-sm text-gray-600">
                ID do orçamento: {quoteId.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
