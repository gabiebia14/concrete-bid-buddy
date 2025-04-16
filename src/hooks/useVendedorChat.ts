
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
    if (!messageContent.trim()) return '';
    
    setIsLoading(true);
    
    // Adiciona a mensagem do usuário ao estado
    const userMessage: ChatMessageProps = {
      content: messageContent,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Simplificando o body para corresponder ao que está funcionando no n8n
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: messageContent
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Detalhes do erro:', errorText);
        throw new Error(`Erro na resposta do webhook: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      // O n8n retorna a resposta no campo output
      if (!data || !data.output) {
        console.error('Resposta inválida:', data);
        throw new Error('Resposta inválida do servidor');
      }

      const assistantResponse = data.output;
      
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
      
      // Mensagem de erro mais amigável
      const errorMessage = "Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente em alguns instantes.";
      toast.error(errorMessage);
      
      // Adiciona a mensagem de erro ao chat
      const errorChatMessage: ChatMessageProps = {
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorChatMessage]);
      
      return errorMessage;
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
