
import { supabase } from '@/lib/supabase';
import { VendedorChatMessage, VendedorChatSession } from '@/lib/vendedorTypes';

// Funções para gerenciar sessões de chat
export async function criarSessaoChat(clienteId?: string | null): Promise<VendedorChatSession> {
  try {
    console.log('Criando sessão de chat, clienteId:', clienteId);
    
    // Dados para inserção na tabela
    const insertData: any = { 
      status: 'ativo', 
      updated_at: new Date().toISOString() 
    };
    
    // Só adicionamos cliente_id se for fornecido um valor válido
    if (clienteId) {
      insertData.cliente_id = clienteId;
    }

    const { data, error } = await supabase
      .from('vendedor_chat_sessions')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar sessão de chat:', error);
      throw error;
    }

    console.log('Sessão criada com sucesso:', data);
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
    console.log(`Enviando mensagem como ${remetente}: "${conteudo}" para sessão ${sessionId}`);
    
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

    console.log('Mensagem enviada com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro no enviarMensagem:', error);
    throw error;
  }
}

export async function buscarMensagensPorSessao(sessionId: string): Promise<VendedorChatMessage[]> {
  try {
    console.log('Buscando mensagens para sessão:', sessionId);
    
    const { data, error } = await supabase
      .from('vendedor_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }

    console.log(`Encontradas ${data?.length || 0} mensagens para a sessão`);
    return data || [];
  } catch (error) {
    console.error('Erro em buscarMensagensPorSessao:', error);
    throw error;
  }
}

// Setup para tempo real usando canais do Supabase
export function configurarChatTempoReal(sessionId: string, callback: (mensagem: VendedorChatMessage) => void) {
  try {
    console.log('Configurando tempo real para sessão:', sessionId);
    
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
          console.log('Nova mensagem recebida em tempo real:', payload.new);
          callback(payload.new as VendedorChatMessage);
        }
      )
      .subscribe((status) => {
        console.log('Status da inscrição do canal:', status);
      });

    console.log('Canal configurado com sucesso');
    
    return () => {
      console.log('Removendo canal de tempo real');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Erro ao configurar tempo real:', error);
    throw error;
  }
}
