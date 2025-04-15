
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Vendedor() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    console.log("Enviando mensagem para N8N webhook:", message);

    try {
      // Usando o proxy configurado no vite.config.ts em vez do URL direto
      const response = await fetch('/api/n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta do webhook: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "Desculpe, não consegui processar sua mensagem.";
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao processar mensagem. Tente novamente.");
      return "Desculpe, ocorreu um erro ao processar sua mensagem.";
    } finally {
      setIsLoading(false);
    }
  };

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
          />
        </div>
      </div>
    </Layout>
  );
}
