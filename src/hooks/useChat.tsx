
import { useState, useEffect } from 'react';
import { saveChatMessage, createChatSession } from '@/lib/supabase';
import { ChatMessage, ChatSession } from '@/lib/types';
import { supabase } from '@/lib/supabase';
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
  const navigate = useNavigate();

  // Create or retrieve chat session on hook initialization
  useEffect(() => {
    const initSession = async () => {
      try {
        console.log('Iniciando sessão de chat...');
        
        // In a real app, we would check for existing active sessions first
        const session: ChatSession = await createChatSession({
          client_id: clientId,
          status: 'active',
          created_at: new Date().toISOString()
        });
        
        console.log('Sessão criada com ID:', session.id);
        setSessionId(session.id);
        
        // Removida a mensagem de boas-vindas inicial
        
      } catch (error) {
        console.error('Erro ao iniciar sessão de chat:', error);
        toast.error('Erro ao iniciar o chat. Por favor, tente novamente.');
      }
    };
    
    initSession();
  }, [clientId]);

  // Carregar mensagens existentes para a sessão se estiver vindo do WhatsApp
  useEffect(() => {
    if (sessionId && source === 'whatsapp') {
      const carregarMensagens = async () => {
        try {
          const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });
            
          if (error) throw error;
          
          if (data) {
            setMessages(data as ChatMessage[]);
          }
        } catch (error) {
          console.error('Erro ao carregar mensagens:', error);
        }
      };
      
      carregarMensagens();
    }
  }, [sessionId, source]);

  // Efeito para processar o orçamento quando disponível
  useEffect(() => {
    if (quoteData && onQuoteRequest) {
      console.log('Processando dados do orçamento:', quoteData);
      onQuoteRequest(quoteData);
      
      if (quoteId) {
        toast.success(`Orçamento #${quoteId} criado com sucesso!`);
        
        // Opcionalmente, redirecionar para a página do orçamento
        // navigate(`/quotes/${quoteId}`);
      }
    }
  }, [quoteData, quoteId, onQuoteRequest, navigate]);

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId) return;
    
    try {
      console.log('Enviando mensagem:', message);
      setIsLoading(true);
      
      // Save user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        session_id: sessionId,
        content: message,
        role: 'user',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      
      // Add to UI immediately
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      // Save to database
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
      
      // Call the LangChain Edge Function
      try {
        console.log('Chamando função de borda para o chat...');
        const { data, error } = await supabase.functions.invoke("chat-assistant", {
          body: {
            messages: [...messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            sessionId: sessionId
          }
        });
        
        if (error) {
          throw new Error(`Erro na função de borda: ${error.message}`);
        }
        
        console.log('Resposta recebida da função de borda');
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          session_id: sessionId,
          content: data?.message || "Desculpe, estou tendo dificuldades para processar sua solicitação no momento.",
          role: 'assistant',
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };
        
        // Add to UI
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save to database
        try {
          await saveChatMessage({
            session_id: assistantMessage.session_id,
            content: assistantMessage.content,
            role: assistantMessage.role,
            created_at: assistantMessage.created_at
          });
          console.log('Resposta do assistente salva com sucesso');
        } catch (error) {
          console.error('Erro ao salvar resposta do assistente:', error);
        }
        
        // Verificar se há dados de orçamento
        if (data?.quote_data) {
          console.log("Dados do orçamento detectados:", data.quote_data);
          setQuoteData(data.quote_data);
          
          if (data.quote_id) {
            console.log("Orçamento criado com ID:", data.quote_id);
            setQuoteId(data.quote_id);
          }
          
          // Notificar componentes externos
          onQuoteRequest?.(data.quote_data);
        }
      } catch (error) {
        console.error("Error calling edge function:", error);
        
        // Fallback message if edge function fails
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
    quoteId
  };
}
