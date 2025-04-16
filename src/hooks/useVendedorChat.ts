
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
    setIsLoading(true);
    
    // Adiciona a mensagem do usuário ao estado
    const userMessage: ChatMessageProps = {
      content: messageContent,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
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

      if (!response.ok) {
        throw new Error(`Erro na resposta do webhook: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.response || "Desculpe, não consegui processar sua mensagem.";
      
      // Adiciona a resposta do assistente ao estado
      const assistantMessage: ChatMessageProps = {
        content: assistantResponse,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      return assistantResponse;
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao processar mensagem. Tente novamente.");
      
      // Adiciona uma mensagem de erro do assistente
      const errorMessage: ChatMessageProps = {
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
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
