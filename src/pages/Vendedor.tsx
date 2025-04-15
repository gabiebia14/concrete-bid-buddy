
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Vendedor() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    console.log("Enviando mensagem para webhook:", message);

    try {
      // Chamada direta para o webhook sem usar proxy
      const response = await fetch('https://gbservin8n.sevirenostrinta.com.br/webhook/9b4cfbf8-2f4b-4097-af4c-8c20d8054930', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message,
          timestamp: new Date().toISOString()
        }),
      });

      console.log("Status da resposta:", response.status);
      
      if (!response.ok) {
        throw new Error(`Erro na resposta do webhook: ${response.status}`);
      }

      // Verificar o tipo de conteúdo antes de tentar analisar como JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log("Dados recebidos do webhook:", data);
        return data.response || "Desculpe, não consegui processar sua mensagem.";
      } else {
        // Se não for JSON, tratar como texto
        const textResponse = await response.text();
        console.log("Resposta não-JSON do webhook:", textResponse);
        toast.error("O webhook retornou um formato inesperado.");
        return "O servidor retornou uma resposta em formato inválido. Por favor, contate o suporte.";
      }
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
