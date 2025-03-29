import { supabase } from '@/lib/supabase';
import { VendedorChatMessage, VendedorChatSession } from '@/lib/vendedorTypes';

// Funções para gerenciar sessões de chat
export async function criarSessaoChat(clienteId?: string | null): Promise<VendedorChatSession> {
  try {
    // Se clienteId for undefined ou null, não incluímos no objeto de inserção
    const insertData = clienteId 
      ? { cliente_id: clienteId, status: 'ativo', updated_at: new Date().toISOString() }
      : { status: 'ativo', updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('vendedor_chat_sessions')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar sessão de chat:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro no criarSessaoChat:', error);
    throw error;
  }
}

export async function buscarSessaoPorId(sessionId: string): Promise<VendedorChatSession | null> {
  const { data, error } = await supabase
    .from('vendedor_chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar sessão de chat:', error);
    throw error;
  }

  return data;
}

export async function atualizarStatusSessao(sessionId: string, status: 'ativo' | 'encerrado' | 'aguardando'): Promise<void> {
  const { error } = await supabase
    .from('vendedor_chat_sessions')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Erro ao atualizar status da sessão:', error);
    throw error;
  }
}

// Funções para gerenciar mensagens de chat
export async function enviarMensagem(sessionId: string, remetente: 'cliente' | 'vendedor', conteudo: string): Promise<VendedorChatMessage> {
  try {
    const { data, error } = await supabase
      .from('vendedor_chat_messages')
      .insert({
        session_id: sessionId,
        remetente,
        conteudo
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro no enviarMensagem:', error);
    throw error;
  }
}

export async function buscarMensagensPorSessao(sessionId: string): Promise<VendedorChatMessage[]> {
  const { data, error } = await supabase
    .from('vendedor_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar mensagens:', error);
    throw error;
  }

  return data || [];
}

// Setup para tempo real usando canais do Supabase
export function configurarChatTempoReal(sessionId: string, callback: (mensagem: VendedorChatMessage) => void) {
  try {
    const channel = supabase
      .channel(`vendedor-chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendedor_chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          callback(payload.new as VendedorChatMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Erro ao configurar tempo real:', error);
    throw error;
  }
}
