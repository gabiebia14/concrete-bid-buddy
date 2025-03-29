
import { useState, useCallback } from 'react';
import { VendedorChatState } from '@/lib/vendedorTypes';
import { criarSessaoChat, buscarMensagensPorSessao } from '@/services/vendedorChatService';
import { useToast } from '@/components/ui/use-toast';

export function useVendedorChatSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Iniciar uma nova sessão de chat
  const iniciarChat = useCallback(async (telefone?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Tentando criar sessão de chat com telefone:', telefone);
      const session = await criarSessaoChat(null); // Não usamos clienteId para evitar o erro de foreign key
      
      console.log('Sessão criada com sucesso:', session.id);
      setIsLoading(false);
      
      return session.id;
    } catch (error: any) {
      console.error('Erro ao iniciar chat:', error);
      setError(error.message || 'Erro ao iniciar chat');
      setIsLoading(false);
      
      toast({
        variant: 'destructive',
        title: 'Erro ao iniciar chat',
        description: error.message || 'Não foi possível iniciar o chat. Tente novamente.'
      });
      
      return null;
    }
  }, [toast]);

  // Carregar mensagens por sessão
  const carregarMensagens = useCallback(async (sessionId: string) => {
    if (!sessionId) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      const mensagens = await buscarMensagensPorSessao(sessionId);
      setIsLoading(false);
      
      return mensagens;
    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error);
      setError(error.message || 'Erro ao carregar mensagens');
      setIsLoading(false);
      
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar mensagens',
        description: error.message || 'Não foi possível carregar as mensagens.'
      });
      
      return [];
    }
  }, [toast]);

  return {
    isLoading,
    error,
    iniciarChat,
    carregarMensagens,
    limparErro: () => setError(null)
  };
}
