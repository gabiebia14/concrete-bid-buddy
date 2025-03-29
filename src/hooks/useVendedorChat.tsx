
import { useState, useEffect, useCallback } from 'react';
import { VendedorChatMessage, VendedorChatState } from '@/lib/vendedorTypes';
import { configurarChatTempoReal } from '@/services/vendedorChatService';
import { useVendedorChatSession } from './useVendedorChatSession';
import { useVendedorChatMessages } from './useVendedorChatMessages';
import { enviarMensagemAI } from './vendedorChatUtils';

export function useVendedorChat(clienteId?: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inicializado, setInicializado] = useState(false);
  const sessionManager = useVendedorChatSession();
  const messageManager = useVendedorChatMessages(sessionId);
  
  // Iniciar uma nova sessão de chat
  const iniciarChat = useCallback(async (telefone?: string) => {
    try {
      console.log('Iniciando chat com telefone:', telefone);
      const novaSessionId = await sessionManager.iniciarChat();
      
      if (novaSessionId) {
        setSessionId(novaSessionId);
        setInicializado(true);
        console.log('Nova sessão criada:', novaSessionId);
        
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

  // Enviar mensagem garantindo que a sessão esteja iniciada
  const enviarMensagemSegura = useCallback(async (
    conteudo: string,
    remetente: 'cliente' | 'vendedor' = 'cliente',
    telefone?: string
  ) => {
    // Se ainda não tivermos uma sessão, criar uma
    if (!sessionId) {
      console.log('Sessão não iniciada. Iniciando antes de enviar mensagem...');
      const novaSessaoId = await iniciarChat(telefone);
      
      if (!novaSessaoId) {
        throw new Error('Não foi possível iniciar a sessão de chat');
      }
      
      // Aguardar um momento para garantir que a sessão esteja pronta
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Agora podemos enviar a mensagem
      return messageManager.enviarMensagem(conteudo, remetente, telefone);
    }
    
    // Se já temos uma sessão, enviar normalmente
    return messageManager.enviarMensagem(conteudo, remetente, telefone);
  }, [sessionId, iniciarChat, messageManager]);

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
    inicializado,
    iniciarChat,
    carregarMensagens: sessionManager.carregarMensagens,
    enviarMensagem: enviarMensagemSegura,
    limparErro: () => {
      sessionManager.limparErro();
      messageManager.limparErro();
    }
  };
}
