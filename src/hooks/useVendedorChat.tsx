
import { useState, useEffect, useCallback } from 'react';
import { VendedorChatMessage, VendedorChatState } from '@/lib/vendedorTypes';
import { 
  criarSessaoChat, 
  buscarMensagensPorSessao, 
  enviarMensagem,
  configurarChatTempoReal
} from '@/services/vendedorChatService';
import { useToast } from '@/components/ui/use-toast';

export function useVendedorChat(clienteId?: string) {
  const [state, setState] = useState<VendedorChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null,
  });
  const { toast } = useToast();

  // Iniciar uma nova sessão de chat
  const iniciarChat = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const session = await criarSessaoChat(clienteId);
      setState(prev => ({ 
        ...prev, 
        sessionId: session.id,
        isLoading: false 
      }));
      
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

  // Enviar nova mensagem
  const enviarMensagemChat = useCallback(async (conteudo: string, remetente: 'cliente' | 'vendedor' = 'cliente') => {
    if (!state.sessionId || !conteudo.trim()) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const mensagem = await enviarMensagem(state.sessionId, remetente, conteudo);
      
      // Atualizamos o estado imediatamente para uma experiência mais responsiva
      // (A mensagem também virá pelo canal tempo real, mas evitamos atraso na UI)
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
  }, [state.sessionId, toast]);

  // Auto-responder como vendedor (simulação)
  const autoResponderComoVendedor = useCallback(async (mensagemCliente: string) => {
    if (!state.sessionId) return;
    
    // Atraso artificial para simular resposta do vendedor
    setTimeout(async () => {
      let resposta = 'Olá! Como posso ajudar com seu orçamento hoje?';
      
      if (mensagemCliente.toLowerCase().includes('preço')) {
        resposta = 'Os preços variam conforme as especificações. Pode me detalhar o que precisa?';
      } else if (mensagemCliente.toLowerCase().includes('entrega')) {
        resposta = 'Nosso prazo de entrega geralmente é de 5 a 10 dias úteis após a aprovação do orçamento.';
      } else if (mensagemCliente.toLowerCase().includes('produto')) {
        resposta = 'Temos uma variedade de produtos disponíveis. Qual categoria específica está procurando?';
      } else if (mensagemCliente.toLowerCase().includes('pagamento')) {
        resposta = 'Aceitamos pagamento à vista com 5% de desconto, ou parcelado em até 3x sem juros.';
      }
      
      await enviarMensagem(state.sessionId, 'vendedor', resposta);
    }, 1500);
  }, [state.sessionId]);

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
        
        // Auto-responder se a mensagem for do cliente
        if (novaMensagem.remetente === 'cliente') {
          autoResponderComoVendedor(novaMensagem.conteudo);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [state.sessionId, state.messages, autoResponderComoVendedor]);

  return {
    ...state,
    iniciarChat,
    carregarMensagens,
    enviarMensagem: enviarMensagemChat,
    limparErro: () => setState(prev => ({ ...prev, error: null }))
  };
}
