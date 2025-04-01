
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useVendedorChat } from '@/hooks/useVendedorChat';
import { VendedorHeader } from '@/components/vendedor/VendedorHeader';
import { LoadingIndicator } from '@/components/vendedor/LoadingIndicator';
import { EnviarOrcamentoButton } from '@/components/vendedor/EnviarOrcamentoButton';

export default function Vendedor() {
  const {
    messages,
    isLoading,
    isSavingQuote,
    orcamentoConcluido,
    handleSendMessage,
    handleEnviarParaVendedor
  } = useVendedorChat();

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <VendedorHeader />

        <div className="grid grid-cols-1 gap-6">
          <div>
            <ChatInterface 
              title="Assistente de Vendas IPT Teixeira" 
              description="Nosso assistente especializado está pronto para ajudar com suas dúvidas sobre produtos de concreto"
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
          </div>
        </div>
      </div>
    </Layout>
  );
}
