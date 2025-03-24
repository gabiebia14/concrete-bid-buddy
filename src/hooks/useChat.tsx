
import { useState, useEffect } from 'react';
import { saveChatMessage, createChatSession, fetchClientById } from '@/lib/supabase';
import { ChatMessage, ChatSession } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UseChatProps {
  clientId?: string;
  onQuoteRequest?: (quoteData: any) => void;
  source?: 'web' | 'whatsapp';
}

export function useChat({ clientId, onQuoteRequest, source = 'web' }: UseChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadClientInfo = async () => {
      if (clientId) {
        try {
          const clientData = await fetchClientById(clientId);
          setClientInfo(clientData);
          console.log('Informações do cliente carregadas:', clientData);
        } catch (error) {
          console.error('Erro ao carregar informações do cliente:', error);
        }
      }
    };
    
    loadClientInfo();
  }, [clientId]);

  useEffect(() => {
    const initSession = async () => {
      try {
        console.log('Iniciando sessão de chat...');
        
        const session: ChatSession = await createChatSession({
          client_id: clientId,
          status: 'active',
          created_at: new Date().toISOString()
        });
        
        console.log('Sessão criada com ID:', session.id);
        setSessionId(session.id);
        
        if (session.id) {
          const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true });
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            setMessages(data as ChatMessage[]);
          }
        }
      } catch (error) {
        console.error('Erro ao iniciar sessão de chat:', error);
        toast.error('Erro ao iniciar o chat. Por favor, tente novamente.');
      }
    };
    
    initSession();
  }, [clientId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId) return;
    
    try {
      console.log('Enviando mensagem:', message);
      setIsLoading(true);
      
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        session_id: sessionId,
        content: message,
        role: 'user',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      try {
        await saveChatMessage({
          session_id: userMessage.session_id,
          content: userMessage.content,
          role: userMessage.role,
          created_at: userMessage.created_at
        });
        console.log('Mensagem do usuário salva com sucesso');
      } catch (error) {
        console.error('Erro ao salvar mensagem do usuário:', error);
      }
      
      try {
        console.log('Chamando função de borda para o chat com a API Assistants...');
        const { data, error } = await supabase.functions.invoke("chat-assistant", {
          body: {
            message: message,
            sessionId: sessionId,
            clientId: clientId,
            source: source
          }
        });
        
        if (error) {
          throw new Error(`Erro na função de borda: ${error.message}`);
        }
        
        console.log('Resposta recebida da função de borda (GPT-4o)');
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          session_id: sessionId,
          content: data?.message || "Desculpe, estou tendo dificuldades para processar sua solicitação no momento.",
          role: 'assistant',
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        try {
          await saveChatMessage({
            session_id: assistantMessage.session_id,
            content: assistantMessage.content,
            role: assistantMessage.role,
            created_at: assistantMessage.created_at
          });
          console.log('Mensagem do assistente salva com sucesso');
        } catch (saveError) {
          console.error('Erro ao salvar mensagem do assistente:', saveError);
        }
        
        if (data?.quote_data) {
          console.log("Dados do orçamento detectados:", data.quote_data);
          setQuoteData(data.quote_data);
          
          if (data.quote_id) {
            console.log("Orçamento criado com ID:", data.quote_id);
            setQuoteId(data.quote_id);
          }
          
          onQuoteRequest?.(data.quote_data);
        }
      } catch (error) {
        console.error("Error calling edge function:", error);
        
        const fallbackMessage: ChatMessage = {
          id: `assistant-fallback-${Date.now()}`,
          session_id: sessionId,
          content: "Desculpe, estou enfrentando problemas técnicos no momento. Nossa equipe já foi notificada. Por favor, tente novamente em instantes.",
          role: 'assistant',
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
        
        try {
          await saveChatMessage({
            session_id: fallbackMessage.session_id,
            content: fallbackMessage.content,
            role: fallbackMessage.role,
            created_at: fallbackMessage.created_at
          });
        } catch (saveError) {
          console.error('Erro ao salvar mensagem de fallback:', saveError);
        }
        
        toast.error('Erro ao processar mensagem. Nossa equipe já foi notificada do problema.');
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  return {
    message,
    setMessage,
    messages,
    isLoading,
    handleSendMessage,
    quoteData,
    quoteId,
    clientInfo
  };
}
