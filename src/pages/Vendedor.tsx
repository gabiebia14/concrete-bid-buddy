
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useVendedorChat } from '@/hooks/useVendedorChat';

export default function Vendedor() {
  const { messages, isLoading, handleSendMessage } = useVendedorChat();

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Assistente de Vendas IPT Teixeira</h1>
          
          <ChatInterface 
            title="Assistente de Vendas" 
            description="Nosso assistente especializado está pronto para ajudar com seu orçamento"
            onSendMessage={handleSendMessage}
            showReset={true}
            isLoading={isLoading}
            initialMessages={messages}
          />
        </div>
      </div>
    </Layout>
  );
}

