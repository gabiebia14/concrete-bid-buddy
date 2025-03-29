
import { useState, useCallback } from 'react';
import { VendedorChatMessage } from '@/lib/vendedorTypes';
import { enviarMensagem } from '@/services/vendedorChatService';
import { useToast } from '@/components/ui/use-toast';
import { enviarMensagemAI, criarMensagemTemporaria } from './vendedorChatUtils';

export function useVendedorChatMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<VendedorChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const atualizarMensagens = useCallback((novasMensagensOuFuncao: VendedorChatMessage[] | ((prev: VendedorChatMessage[]) => VendedorChatMessage[])) => {
    if (typeof novasMensagensOuFuncao === 'function') {
      setMessages(novasMensagensOuFuncao);
    } else {
      setMessages(novasMensagensOuFuncao);
    }
  }, []);

  // Enviar nova mensagem
  const enviarMensagem = useCallback(async (
    conteudo: string, 
    remetente: 'cliente' | 'vendedor' = 'cliente',
    telefone?: string
  ) => {
    if (!conteudo.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Enviando mensagem:', conteudo, 'Telefone:', telefone);
      
      // Se temos telefone e é uma mensagem do cliente, usar a função de IA
      if (telefone && remetente === 'cliente') {
        // Adicionar a mensagem do cliente imediatamente para feedback visual
        const tempClientMessage = criarMensagemTemporaria(conteudo, 'cliente', sessionId || undefined);
        
        setMessages(prev => [...prev, tempClientMessage]);
        
        if (!sessionId) {
          throw new Error('Sessão de chat não iniciada');
        }
        
        console.log('Enviando mensagem para IA com sessão:', sessionId);
        
        // Enviar para a IA usando a sessão existente
        const resultado = await enviarMensagemAI(conteudo, telefone, sessionId);
        setIsLoading(false);
        return resultado;
      }
      
      // Caso contrário, usar o fluxo padrão
      if (!sessionId) {
        throw new Error('Sessão de chat não iniciada');
      }
      
      const mensagem = await enviarMensagem(sessionId, remetente, conteudo);
      
      // Atualizamos o estado imediatamente para uma experiência mais responsiva
      setMessages(prev => [...prev, mensagem]);
      setIsLoading(false);
      
      return mensagem;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      setError(error.message || 'Erro ao enviar mensagem');
      setIsLoading(false);
      
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: error.message || 'Não foi possível enviar a mensagem.'
      });
      
      return null;
    }
  }, [sessionId, toast]);

  return {
    messages,
    isLoading,
    error,
    enviarMensagem,
    atualizarMensagens,
    limparErro: () => setError(null)
  };
}
