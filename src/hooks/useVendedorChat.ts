
import { useState, useEffect } from 'react';
import { ChatMessageProps } from '@/components/chat/ChatMessage';
import { toast } from 'sonner';
import { ChatMessage } from '@/lib/vendedorTypes';

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
  const [sessionId, setSessionId] = useState<string>('');

  // Gerar um ID de sessão único quando o componente for montado pela primeira vez
  useEffect(() => {
    // Usar um ID de sessão existente do localStorage ou gerar um novo
    const existingSessionId = localStorage.getItem('chat_session_id');
    const newSessionId = existingSessionId || `session_${Math.random().toString(36).substring(2, 15)}`;
    
    if (!existingSessionId) {
      localStorage.setItem('chat_session_id', newSessionId);
    }
    
    setSessionId(newSessionId);
    
    // Restaurar mensagens do localStorage se existirem
    const savedMessages = localStorage.getItem(`chat_history_${newSessionId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Converter as datas de string para Date
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        setMessages(messagesWithDates);
      } catch (e) {
        console.error('Erro ao restaurar histórico do chat:', e);
      }
    }
  }, []);

  // Salvar mensagens no localStorage sempre que elas mudarem
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

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
      // Preparar a conversação completa para envio ao webhook
      // Converte para formato simples para serialização JSON
      const conversationHistory = messages.map(msg => ({
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp ? msg.timestamp.toISOString() : new Date().toISOString()
      }));
      
      // Adicionar a mensagem atual à conversação no formato simples
      conversationHistory.push({
        content: messageContent,
        role: 'user',
        timestamp: new Date().toISOString()
      });
      
      console.log('Enviando conversa para webhook:', JSON.stringify({
        message: messageContent,
        sessionId: sessionId,
        conversation: conversationHistory
      }, null, 2));
      
      // Enviar a conversação completa para o webhook
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: messageContent,
          sessionId: sessionId,
          conversation: conversationHistory
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Detalhes do erro:', errorText);
        throw new Error(`Erro na resposta do webhook: ${response.status} - ${errorText}`);
      }

      // Primeiro obtemos o texto da resposta
      const responseText = await response.text();
      console.log('Resposta bruta:', responseText);
      
      let assistantResponse;
      
      // Tentamos analisar como JSON
      try {
        const data = JSON.parse(responseText);
        console.log('Dados recebidos (formato JSON):', data);
        
        // Checamos se é um objeto com campo output ou se o próprio objeto pode ser usado
        if (data && data.output) {
          assistantResponse = data.output;
        } else if (data && data.response) {
          assistantResponse = data.response;
        } else if (typeof data === 'string') {
          // Se o JSON for apenas uma string
          assistantResponse = data;
        } else {
          // Fallback para o objeto JSON como string
          assistantResponse = JSON.stringify(data);
        }
      } catch (jsonError) {
        // Se não for um JSON válido, usamos o texto da resposta diretamente
        console.log('A resposta não é um JSON válido, usando o texto bruto');
        assistantResponse = responseText;
      }
      
      if (!assistantResponse) {
        console.error('Resposta inválida ou vazia');
        throw new Error('Resposta inválida ou vazia do servidor');
      }

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
    handleSendMessage,
    clearSession: () => {
      if (sessionId) {
        localStorage.removeItem(`chat_history_${sessionId}`);
        localStorage.removeItem('chat_session_id');
        setSessionId(`session_${Math.random().toString(36).substring(2, 15)}`);
        setMessages([{
          content: "Olá! Sou o assistente virtual da IPT Teixeira. Como posso ajudar com seu orçamento de produtos de concreto hoje?",
          role: "assistant",
          timestamp: new Date()
        }]);
      }
    }
  };
}
