
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/lib/chatTypes";

/**
 * Envia uma mensagem para o assistente virtual
 * @param content Conteúdo da mensagem
 * @param sessionId ID da sessão (opcional)
 * @returns Resposta do assistente
 */
export async function sendMessage(content: string, sessionId: string | null = null) {
  try {
    const { data, error } = await supabase.functions.invoke("chat-assistant", {
      body: {
        message: content,
        sessionId: sessionId
      }
    });
    
    if (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao comunicar com o assistente:", error);
    throw new Error("Falha na comunicação com o assistente. Tente novamente mais tarde.");
  }
}

/**
 * Busca o histórico de mensagens de uma sessão
 * @param sessionId ID da sessão
 * @returns Array de mensagens
 */
export async function fetchChatHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase.functions.invoke("chat-assistant", {
      body: {
        sessionId
      },
      method: "POST",
      path: "history"
    });
    
    if (error) {
      console.error("Erro ao buscar histórico:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw new Error("Falha ao recuperar histórico de mensagens.");
  }
}
