
import { useState, useEffect, useCallback } from 'react';
import { VendedorChatMessage, VendedorChatState } from '@/lib/vendedorTypes';
import { 
  criarSessaoChat, 
  buscarMensagensPorSessao, 
  enviarMensagem as enviarMensagemService,
  configurarChatTempoReal
} from '@/services/vendedorChatService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export function useVendedorChat(clienteId?: string) {
  const [state, setState] = useState<VendedorChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null,
  });
  const { toast } = useToast();

  // Iniciar uma nova sessão de chat
  const iniciarChat = useCallback(async (telefone?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const session = await criarSessaoChat(clienteId);
      setState(prev => ({ 
        ...prev, 
        sessionId: session.id,
        isLoading: false 
      }));
      
      // Se temos telefone, enviar mensagem de boas-vindas via AI
      if (telefone) {
        await enviarMensagemAI("Olá", telefone, session.id);
      }
      
      return session.id;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Erro ao iniciar chat', 
        isLoading: false 
      }));
      toast({
        variant: 'destructive',
        title: 'Erro ao iniciar chat',
        description: error.message || 'Não foi possível iniciar o chat. Tente novamente.'
      });
      
      return null;
    }
  }, [clienteId, toast]);

  // Carregar mensagens por sessão
  const carregarMensagens = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const mensagens = await buscarMensagensPorSessao(sessionId);
      setState(prev => ({ 
        ...prev, 
        messages: mensagens,
        isLoading: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Erro ao carregar mensagens', 
        isLoading: false 
      }));
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar mensagens',
        description: error.message || 'Não foi possível carregar as mensagens.'
      });
    }
  }, [toast]);

  // Enviar mensagem para a função edge com IA
  const enviarMensagemAI = useCallback(async (conteudo: string, telefone: string, sessaoId: string | null = null) => {
    if (!conteudo.trim() || !telefone) return null;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Enviar para a função edge
      const { data, error } = await supabase.functions.invoke('vendedor-ai-assistant', {
        body: { 
          message: conteudo,
          phone: telefone,
          sessionId: sessaoId || state.sessionId,
          channel: 'website'
        }
      });
      
      if (error) {
        console.error('Erro ao chamar função do vendedor AI:', error);
        setState(prev => ({ 
          ...prev, 
          error: error.message, 
          isLoading: false 
        }));
        return null;
      }
      
      // Se não tínhamos sessão antes, vamos atualizar com a nova
      if (!state.sessionId && data.sessionId) {
        setState(prev => ({ ...prev, sessionId: data.sessionId }));
        
        // Carregar mensagens da nova sessão
        const mensagens = await buscarMensagensPorSessao(data.sessionId);
        setState(prev => ({ 
          ...prev, 
          messages: mensagens,
          isLoading: false 
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
      
      return data;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem para IA:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Erro ao enviar mensagem', 
        isLoading: false 
      }));
      
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: error.message || 'Não foi possível processar sua mensagem.'
      });
      
      return null;
    }
  }, [state.sessionId, toast]);

  // Enviar nova mensagem
  const enviarMensagemChat = useCallback(async (
    conteudo: string, 
    remetente: 'cliente' | 'vendedor' = 'cliente',
    telefone?: string
  ) => {
    if (!conteudo.trim()) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Se temos telefone e é uma mensagem do cliente, usar a função de IA
      if (telefone && remetente === 'cliente') {
        return await enviarMensagemAI(conteudo, telefone, state.sessionId);
      }
      
      // Caso contrário, usar o fluxo padrão
      if (!state.sessionId) {
        throw new Error('Sessão de chat não iniciada');
      }
      
      const mensagem = await enviarMensagemService(state.sessionId, remetente, conteudo);
      
      // Atualizamos o estado imediatamente para uma experiência mais responsiva
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, mensagem],
        isLoading: false 
      }));
      
      return mensagem;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Erro ao enviar mensagem', 
        isLoading: false 
      }));
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: error.message || 'Não foi possível enviar a mensagem.'
      });
      
      return null;
    }
  }, [state.sessionId, toast, enviarMensagemAI]);

  // Inicializar chat e configurar escuta em tempo real
  useEffect(() => {
    const initChat = async () => {
      const sessionId = await iniciarChat();
      if (sessionId) {
        await carregarMensagens(sessionId);
      }
    };

    if (!state.sessionId) {
      initChat();
    }

    return () => {
      // Cleanup ocorre automaticamente quando o componente é desmontado
    };
  }, [iniciarChat, carregarMensagens, state.sessionId]);

  // Configurar escuta em tempo real quando sessionId estiver disponível
  useEffect(() => {
    if (!state.sessionId) return;

    const unsubscribe = configurarChatTempoReal(state.sessionId, (novaMensagem) => {
      // Verificar se a mensagem já existe para evitar duplicação
      if (!state.messages.some(msg => msg.id === novaMensagem.id)) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, novaMensagem]
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [state.sessionId, state.messages]);

  return {
    ...state,
    iniciarChat,
    carregarMensagens,
    enviarMensagem: enviarMensagemChat,
    limparErro: () => setState(prev => ({ ...prev, error: null }))
  };
}
