
import { useState, useEffect, useCallback } from 'react';
import { ChatState, ChatService, ChatProps } from '@/types/chat.types';
import ChatServiceClass from '@/services/chatService';
import { getFinalWebhookUrl } from '@/utils/chatUtils';
import { toast } from 'sonner';

export function useChat({ clientId, source = 'web', webhookUrl, onQuoteRequest, userInfo }: ChatProps) {
  const [state, setState] = useState<ChatState>({
    message: '',
    messages: [],
    isLoading: false,
    sessionId: ''
  });
  
  const [chatService, setChatService] = useState<ChatService | null>(null);
  
  // Inicializar o serviço de chat
  useEffect(() => {
    const finalWebhookUrl = getFinalWebhookUrl(webhookUrl);
    const service = new ChatServiceClass(finalWebhookUrl);
    
    // Carregar mensagens existentes
    const loadMessages = async () => {
      await service.loadMessages();
      setState(prev => ({
        ...prev,
        messages: service.getMessages(),
        sessionId: service.getSessionId()
      }));
    };
    
    setChatService(service);
    loadMessages();
  }, [webhookUrl]);
  
  // Atualizar a mensagem atual
  const setMessage = useCallback((message: string) => {
    setState(prev => ({ ...prev, message }));
  }, []);
  
  // Enviar mensagem
  const handleSendMessage = useCallback(async () => {
    if (!chatService || !state.message.trim()) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Preparar dados do usuário
      const userData = {
        clientId,
        source,
        name: userInfo?.name || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || ''
      };
      
      // Enviar mensagem ao serviço
      const response = await chatService.sendMessage(state.message, userData);
      
      // Verificar se há dados de orçamento na resposta
      if (response && response.quoteData && onQuoteRequest) {
        onQuoteRequest(response.quoteData);
      }
      
      // Limpar a mensagem de entrada e atualizar estado
      setState(prev => ({
        ...prev,
        message: '',
        messages: chatService.getMessages(),
        isLoading: false
      }));
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.message, chatService, clientId, source, userInfo, onQuoteRequest]);
  
  return {
    ...state,
    setMessage,
    handleSendMessage
  };
}
