
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/lib/chatTypes";

/**
 * Envia uma mensagem para o assistente virtual
 * @param content Conteúdo da mensagem
 * @param sessionId ID da sessão (opcional)
 * @param phoneNumber Número de telefone para identificação do cliente (opcional)
 * @returns Resposta do assistente
 */
export async function sendMessage(content: string, sessionId: string | null = null, phoneNumber: string | null = null) {
  try {
    const { data, error } = await supabase.functions.invoke("chat-assistant", {
      body: {
        message: content,
        sessionId: sessionId,
        phoneNumber: phoneNumber
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
    // Modificado para usar o endpoint correto sem a propriedade 'path'
    const { data, error } = await supabase.functions.invoke("chat-assistant", {
      body: {
        sessionId,
        action: "history" // Usar um campo na requisição para indicar que queremos o histórico
      }
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
