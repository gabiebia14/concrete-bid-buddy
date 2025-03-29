
import { VendedorChatMessage, VendedorChatState } from '@/lib/vendedorTypes';
import { supabase } from '@/lib/supabase';

// Função para enviar mensagem para a função edge
export async function enviarMensagemAI(
  conteudo: string, 
  telefone: string, 
  sessaoId: string | null = null
): Promise<any> {
  if (!conteudo.trim() || !telefone) return null;
  
  console.log('Enviando mensagem para função edge com dados:', {
    message: conteudo,
    phone: telefone,
    sessionId: sessaoId,
  });
  
  // Enviar para a função edge
  const { data, error } = await supabase.functions.invoke('vendedor-gemini-assistant', {
    body: { 
      message: conteudo,
      phone: telefone,
      sessionId: sessaoId,
      channel: 'website'
    }
  });
  
  if (error) {
    console.error(`Erro ao chamar função vendedor-gemini-assistant:`, error);
    throw error;
  }
  
  console.log('Resposta da função edge:', data);
  return data;
}

// Função auxiliar para criar uma mensagem temporária
export function criarMensagemTemporaria(
  conteudo: string,
  remetente: 'cliente' | 'vendedor',
  sessionId?: string
): VendedorChatMessage {
  return {
    id: `temp-${Date.now()}`,
    session_id: sessionId,
    remetente,
    conteudo,
    created_at: new Date().toISOString()
  };
}

// Função para atualizar o estado com uma nova mensagem
export function adicionarMensagem(
  estado: VendedorChatState,
  mensagem: VendedorChatMessage
): VendedorChatState {
  // Verificar se a mensagem já existe para evitar duplicação
  if (!estado.messages.some(msg => msg.id === mensagem.id)) {
    return {
      ...estado,
      messages: [...estado.messages, mensagem]
    };
  }
  return estado;
}
