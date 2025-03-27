
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatState } from '@/lib/chatTypes';
import { sendMessage, fetchChatHistory } from '@/services/chatService';
import { useToast } from '@/components/ui/use-toast';

export function useChat(initialSessionId?: string, phoneNumber?: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: initialSessionId || null
  });
  
  const { toast } = useToast();
  
  // Carregar histórico inicial se tivermos um sessionId
  useEffect(() => {
    if (state.sessionId) {
      setState(prev => ({ ...prev, isLoading: true }));
      
      fetchChatHistory(state.sessionId!)
        .then(messages => {
          setState(prev => ({
            ...prev,
            messages,
            isLoading: false
          }));
        })
        .catch(error => {
          console.error('Erro ao carregar histórico:', error);
          setState(prev => ({
            ...prev,
            error: 'Falha ao carregar o histórico da conversa.',
            isLoading: false
          }));
          
          toast({
            variant: 'destructive',
            title: 'Erro ao carregar histórico',
            description: 'Não foi possível recuperar as mensagens anteriores. Por favor, recarregue a página ou tente novamente mais tarde.'
          });
        });
    }
  }, [state.sessionId, toast]);
  
  // Função para enviar uma mensagem
  const sendUserMessage = useCallback(async (content: string) => {
    try {
      // Adicionar mensagem do usuário ao estado localmente primeiro
      const userMessage: ChatMessage = {
        content,
        role: 'user',
        created_at: new Date().toISOString()
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null
      }));
      
      // Enviar a mensagem para a API
      const response = await sendMessage(content, state.sessionId, phoneNumber);
      
      // Adicionar resposta do assistente ao estado
      const assistantMessage: ChatMessage = {
        content: response.message,
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        sessionId: response.sessionId
      }));
      
      // Se um orçamento foi criado, mostrar notificação
      if (response.quote_id) {
        toast({
          title: 'Orçamento iniciado',
          description: 'Detectamos um potencial orçamento na sua conversa. Você pode continuar o chat ou editar o orçamento na seção de orçamentos.',
        });
      }
      
      return assistantMessage;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Falha ao enviar mensagem. Tente novamente.'
      }));
      
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar sua mensagem. Por favor, verifique sua conexão e tente novamente.'
      });
      
      return null;
    }
  }, [state.sessionId, phoneNumber, toast]);
  
  // Função para limpar o chat
  const resetChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      sessionId: null
    });
  }, []);
  
  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sessionId: state.sessionId,
    sendMessage: sendUserMessage,
    resetChat
  };
}
