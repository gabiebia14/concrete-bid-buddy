
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
  webhookUrl?: string;
}

export function useChat({ clientId, onQuoteRequest, source = 'web', webhookUrl }: UseChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const navigate = useNavigate();

  // URL padrão para o webhook do n8n (usando proxy para evitar CORS)
  const defaultWebhookUrl = "/api/n8n/chat-assistant";

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

  const callWebhook = async (userMessage: string) => {
    try {
      // Usar a URL fornecida ou a URL padrão
      const targetUrl = webhookUrl || defaultWebhookUrl;
      console.log(`Chamando webhook em: ${targetUrl}`);
      
      // Montando o payload para o webhook do n8n
      const payload = {
        message: userMessage,
        sessionId: sessionId,
        clientId: clientId,
        source: source,
        name: clientInfo?.name,
        email: clientInfo?.email,
        phone: clientInfo?.phone
      };
      
      console.log('Enviando payload para webhook:', JSON.stringify(payload));
      
      // Chamando o webhook do n8n
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro na resposta do webhook: ${response.status}`, errorText);
        throw new Error(`Erro na resposta do webhook: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Resposta recebida do webhook:', responseData);
      return responseData;
    } catch (error) {
      console.error("Erro ao chamar webhook:", error);
      throw error;
    }
  }

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
      
      let data;
      
      try {
        // Usar webhook do n8n
        data = await callWebhook(message);
        console.log('Resposta recebida do webhook n8n:', data);
      } catch (webhookError) {
        console.error("Erro ao chamar webhook n8n:", webhookError);
        
        // Mostrar mensagem de erro
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
        
        setIsLoading(false);
        toast.error('Erro ao processar mensagem. Nossa equipe já foi notificada do problema.');
        return;
      }
      
      // Processar a resposta
      if (data) {
        // Salvar mensagem do assistente no banco de dados
        try {
          const assistantMessageContent = data?.message || "Desculpe, estou tendo dificuldades para processar sua solicitação no momento.";
          
          // Registrar mensagem no estado local
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            session_id: sessionId,
            content: assistantMessageContent,
            role: 'assistant',
            created_at: new Date().toISOString(),
            timestamp: new Date().toISOString(),
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Salvar no banco de dados
          await saveChatMessage({
            session_id: assistantMessage.session_id,
            content: assistantMessage.content,
            role: assistantMessage.role,
            created_at: assistantMessage.created_at
          });
          
          console.log('Mensagem do assistente salva com sucesso');
        } catch (error) {
          console.error('Erro ao salvar mensagem do assistente:', error);
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
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      
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
