
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

  // URL do webhook do n8n (em produção, use um .env para isso)
  // Aqui estamos usando um URL relativo para evitar problemas de CORS em ambientes diferentes
  const n8nWebhookUrl = "/api/n8n/chat-assistant";

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
        console.log('Processando mensagem...');
        
        // Montando o payload para a API
        const payload = {
          message: message,
          sessionId: sessionId,
          clientId: clientId,
          source: source,
          name: clientInfo?.name,
          email: clientInfo?.email,
          phone: clientInfo?.phone
        };
        
        // Tentando primeiro via função do Supabase
        let data;
        let responseOk = false;
        
        try {
          // Primeiro tentamos via Supabase Function (ambiente de produção)
          console.log('Tentando via Supabase Function...');
          const supabaseResponse = await supabase.functions.invoke("chat-assistant", {
            body: payload
          });
          
          if (!supabaseResponse.error) {
            console.log('Resposta recebida da função Supabase');
            data = supabaseResponse.data;
            responseOk = true;
          } else {
            console.log('Erro na função Supabase, tentando via n8n webhook...');
          }
        } catch (supabaseError) {
          console.log('Erro ao chamar função Supabase:', supabaseError);
        }
        
        // Se a função Supabase falhar, tentamos via webhook do n8n
        if (!responseOk) {
          try {
            // Tentamos via webhook n8n (ambiente de desenvolvimento)
            console.log('Tentando via webhook n8n:', n8nWebhookUrl);
            const response = await fetch(n8nWebhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            });
            
            if (response.ok) {
              data = await response.json();
              console.log('Resposta recebida do webhook n8n:', data);
              responseOk = true;
            } else {
              throw new Error(`Erro na resposta do webhook: ${response.status}`);
            }
          } catch (webhookError) {
            console.error('Erro ao chamar webhook n8n:', webhookError);
            // Se falhar o webhook, tentamos uma última vez diretamente no localhost
            console.log('Tentando diretamente no localhost...');
            
            try {
              const localhostResponse = await fetch("http://localhost:5678/webhook-test/chat-assistant", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
              });
              
              if (localhostResponse.ok) {
                data = await localhostResponse.json();
                console.log('Resposta recebida de localhost:', data);
                responseOk = true;
              } else {
                throw new Error(`Erro na resposta de localhost: ${localhostResponse.status}`);
              }
            } catch (localhostError) {
              console.error('Todas as tentativas falharam:', localhostError);
              throw localhostError;
            }
          }
        }
        
        if (!responseOk || !data) {
          throw new Error('Não foi possível processar a solicitação');
        }
        
        // Processa a resposta independente da origem
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          session_id: sessionId,
          content: data?.message || "Desculpe, estou tendo dificuldades para processar sua solicitação no momento.",
          role: 'assistant',
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Salva a mensagem do assistente no banco de dados
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
        console.error("Erro ao processar mensagem:", error);
        
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
