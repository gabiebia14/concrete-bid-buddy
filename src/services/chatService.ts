
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/lib/chatTypes';

// Função para buscar o histórico de mensagens de uma sessão
export async function fetchChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar histórico de chat:', error);
    throw error;
  }
  
  return data || [];
}

// Função para enviar mensagem para o assistente
export async function sendMessage(message: string, sessionId: string | null): Promise<{
  message: string;
  sessionId: string;
  quote_id?: string;
}> {
  try {
    // Preparar as mensagens para enviar
    const messages: ChatMessage[] = [
      { role: 'user', content: message }
    ];
    
    // Se tivermos um sessionId, buscar o histórico anterior (últimas 10 mensagens)
    if (sessionId) {
      const history = await fetchChatHistory(sessionId);
      
      // Pegar as últimas 10 mensagens para contexto (evitar ultrapassar limites de tokens)
      const recentHistory = history.slice(-10);
      
      // Adicionar o histórico antes da mensagem atual
      messages.unshift(...recentHistory);
    }
    
    // Chamar a função edge do Supabase
    const { data, error } = await supabase.functions.invoke("chat-assistant", {
      body: {
        messages: messages,
        sessionId: sessionId
      }
    });
    
    if (error) {
      console.error('Erro ao enviar mensagem para o assistente:', error);
      throw error;
    }
    
    return {
      message: data.message,
      sessionId: data.sessionId,
      quote_id: data.quote_id
    };
  } catch (error) {
    console.error('Erro no serviço de chat:', error);
    throw error;
  }
}
