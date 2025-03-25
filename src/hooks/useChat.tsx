
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/lib/types';

interface ChatProps {
  clientId?: string;
  source?: string;
  webhookUrl?: string;
  onQuoteRequest?: (quoteData: any) => void;
  userInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export function useChat({ 
  clientId,
  source = 'web',
  webhookUrl,
  onQuoteRequest,
  userInfo
}: ChatProps) {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();

  // Iniciar sessão de chat
  useEffect(() => {
    // Verificar se já existe um session ID no localStorage
    const storedSessionId = localStorage.getItem('chatSessionId');
    
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      // Criar novo session ID
      const newSessionId = uuidv4();
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    }

    // Buscar informações do usuário se estiver autenticado
    const fetchUserData = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserData({
          id: data.user.id,
          name: data.user.user_metadata?.full_name || '',
          email: data.user.email || '',
          phone: data.user.user_metadata?.phone || '',
        });
      }
    };

    fetchUserData();
  }, []);

  // Carregar mensagens iniciais
  useEffect(() => {
    if (sessionId) {
      // Aqui você pode carregar mensagens anteriores se desejar
      // Por exemplo, buscando do Supabase ou localStorage
    }
  }, [sessionId]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return;
    
    // Informações do usuário - preferência para usuário logado, depois para userInfo passado como prop
    const userMetadata = userData || userInfo || {};
    
    try {
      setIsLoading(true);
      
      // Adicionar mensagem do usuário à lista
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: message,
        role: 'user'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Preparar o payload para o webhook
      const payload = {
        body: {
          message: message,
          sessionId: sessionId,
          source: source,
          name: userMetadata.name || '',
          email: userMetadata.email || '',
          phone: userMetadata.phone || '',
          clientId: clientId || userMetadata.id || null
        }
      };
      
      console.log('Enviando mensagem para webhook:', payload);
      
      // Enviar mensagem para webhook
      let response;
      
      if (webhookUrl) {
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const responseData = await response.json();
        console.log('Resposta do webhook:', responseData);
        
        // Verificar se há dados de orçamento na resposta
        if (responseData.quoteData && onQuoteRequest) {
          onQuoteRequest(responseData.quoteData);
        }
        
        // Adicionar resposta do assistente à lista
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: responseData.message || responseData.reply || responseData.response || 'Desculpe, ocorreu um erro ao processar sua mensagem.',
          role: 'assistant'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('Webhook URL não definida');
        
        // Mensagem de erro se não houver webhook
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          content: 'Desculpe, estamos com problemas para conectar ao serviço de assistente. Por favor, tente novamente mais tarde.',
          role: 'assistant'
        };
        
        setMessages(prev => [...prev, errorMessage]);
        
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível conectar ao serviço de assistente.'
        });
      }
      
      // Limpar a mensagem de entrada
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.'
      });
      
      // Adicionar mensagem de erro à lista
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        role: 'assistant'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [message, sessionId, source, clientId, webhookUrl, onQuoteRequest, userData, userInfo, toast]);

  return {
    message,
    setMessage,
    messages,
    isLoading,
    handleSendMessage,
    sessionId
  };
}
