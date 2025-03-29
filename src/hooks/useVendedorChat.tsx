
import { useState, useEffect, useCallback } from 'react';
import { VendedorChatMessage, VendedorChatState } from '@/lib/vendedorTypes';
import { configurarChatTempoReal } from '@/services/vendedorChatService';
import { useVendedorChatSession } from './useVendedorChatSession';
import { useVendedorChatMessages } from './useVendedorChatMessages';
import { enviarMensagemAI } from './vendedorChatUtils';

export function useVendedorChat(clienteId?: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionManager = useVendedorChatSession();
  const messageManager = useVendedorChatMessages(sessionId);
  
  // Iniciar uma nova sessão de chat
  const iniciarChat = useCallback(async (telefone?: string) => {
    try {
      const novaSessionId = await sessionManager.iniciarChat();
      
      if (novaSessionId) {
        setSessionId(novaSessionId);
        
        // Se temos telefone, enviar mensagem inicial para o assistente
        if (telefone) {
          await enviarMensagemAI("Olá", telefone, novaSessionId);
          
          // Carregar mensagens da nova sessão
          const mensagens = await sessionManager.carregarMensagens(novaSessionId);
          messageManager.atualizarMensagens(mensagens);
        }
      }
      
      return novaSessionId;
    } catch (error: any) {
      console.error('Erro em iniciarChat:', error);
      return null;
    }
  }, [sessionManager, messageManager]);

  // Inicializar escuta em tempo real quando sessionId estiver disponível
  useEffect(() => {
    if (!sessionId) return;

    // Carregar mensagens iniciais
    sessionManager.carregarMensagens(sessionId).then(mensagens => {
      messageManager.atualizarMensagens(mensagens);
    });

    const unsubscribe = configurarChatTempoReal(sessionId, (novaMensagem) => {
      // Adicionar nova mensagem ao estado
      messageManager.atualizarMensagens(prevMessages => {
        // Verificar se a mensagem já existe para evitar duplicação
        if (!prevMessages.some(msg => msg.id === novaMensagem.id)) {
          return [...prevMessages, novaMensagem];
        }
        return prevMessages;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId, sessionManager, messageManager]);

  return {
    messages: messageManager.messages,
    isLoading: sessionManager.isLoading || messageManager.isLoading,
    error: sessionManager.error || messageManager.error,
    sessionId,
    iniciarChat,
    carregarMensagens: sessionManager.carregarMensagens,
    enviarMensagem: messageManager.enviarMensagem,
    limparErro: () => {
      sessionManager.limparErro();
      messageManager.limparErro();
    }
  };
}
