
import { useState } from 'react';
import { ChatMessageProps } from '@/components/chat/ChatMessage';
import { toast } from 'sonner';

const N8N_WEBHOOK_URL = 'https://gbservin8n.sevirenostrinta.com.br/webhook/9b4cfbf8-2f4b-4097-af4c-8c20d8054930';

export function useVendedorChat() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      content: "Olá! Sou o assistente virtual da IPT Teixeira. Como posso ajudar com seu orçamento de produtos de concreto hoje?",
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageContent: string): Promise<string> => {
    console.log("Enviando mensagem para webhook:", messageContent);
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageContent,
          timestamp: new Date().toISOString()
        })
      });

      console.log("Status da resposta:", response.status);
      
      if (!response.ok) {
        throw new Error(`Erro na resposta do webhook: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dados recebidos do webhook:", data);
      return data.response || "Desculpe, não consegui processar sua mensagem.";
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao processar mensagem. Tente novamente.");
      return "Desculpe, ocorreu um erro ao processar sua mensagem.";
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    handleSendMessage
  };
}
