
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
      const loadMessages = async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });
        
        if (!error && data) {
          setMessages(data);
        }
      };
      
      loadMessages();
    }
  }, [sessionId]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return;
    
    // Informações do usuário - preferência para usuário logado, depois para userInfo passado como prop
    const userMetadata = userData || userInfo || {};
    
    try {
      setIsLoading(true);
      
      // Criar objeto de mensagem com timestamp atual
      const now = new Date().toISOString();
      
      // Adicionar mensagem do usuário à lista
      const userMessage: ChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        content: message,
        role: 'user',
        created_at: now
      };
      
      // Salvar mensagem no Supabase
      const { error: saveError } = await supabase
        .from('chat_messages')
        .insert(userMessage);
      
      if (saveError) {
        console.error('Erro ao salvar mensagem:', saveError);
      }
      
      setMessages(prev => [...prev, userMessage]);
      
      // Corrigindo o URL do webhook
      const correctWebhookUrl = "http://gbservin8n.sevirenostrinta.com.br/webhook-test/chat-assistant";
      
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
      
      if (webhookUrl || correctWebhookUrl) {
        try {
          response = await fetch(webhookUrl || correctWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            throw new Error(`Erro na resposta do webhook: ${response.status}`);
          }
          
          const responseData = await response.json();
          console.log('Resposta do webhook:', responseData);
          
          // Verificar se há dados de orçamento na resposta
          if (responseData.quoteData && onQuoteRequest) {
            onQuoteRequest(responseData.quoteData);
          }
          
          // Adicionar resposta do assistente à lista
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            session_id: sessionId,
            content: responseData.message || responseData.reply || responseData.response || 'Desculpe, ocorreu um erro ao processar sua mensagem.',
            role: 'assistant',
            created_at: new Date().toISOString()
          };
          
          // Salvar resposta no Supabase
          const { error: saveAssistantError } = await supabase
            .from('chat_messages')
            .insert(assistantMessage);
          
          if (saveAssistantError) {
            console.error('Erro ao salvar resposta do assistente:', saveAssistantError);
          }
          
          setMessages(prev => [...prev, assistantMessage]);
        } catch (fetchError) {
          console.error('Erro ao enviar mensagem:', fetchError);
          
          // Mensagem de erro
          const errorMessage: ChatMessage = {
            id: uuidv4(),
            session_id: sessionId,
            content: 'Desculpe, estou enfrentando problemas técnicos no momento. Nossa equipe já foi notificada. Por favor, tente novamente em instantes.',
            role: 'assistant',
            created_at: new Date().toISOString()
          };
          
          // Salvar mensagem de erro no Supabase
          await supabase.from('chat_messages').insert(errorMessage);
          
          setMessages(prev => [...prev, errorMessage]);
          
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível conectar ao serviço de assistente.'
          });
        }
      } else {
        console.error('Webhook URL não definida');
        
        // Mensagem de erro se não houver webhook
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          session_id: sessionId,
          content: 'Desculpe, estamos com problemas para conectar ao serviço de assistente. Por favor, tente novamente mais tarde.',
          role: 'assistant',
          created_at: new Date().toISOString()
        };
        
        // Salvar mensagem de erro no Supabase
        await supabase.from('chat_messages').insert(errorMessage);
        
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
        session_id: sessionId,
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      
      // Salvar mensagem de erro no Supabase
      await supabase.from('chat_messages').insert(errorMessage);
      
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
