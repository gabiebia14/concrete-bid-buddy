
import { useState, useEffect, useCallback } from 'react';
import { Quote } from '@/lib/types';
import { fetchQuotes } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Número máximo de tentativas para buscar orçamentos
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1500; // 1.5 segundos entre tentativas

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState<string>('Carregando orçamentos...');
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();

  // Função para buscar orçamentos extraída para um callback para reutilização
  const fetchUserQuotes = useCallback(async (attempt = 1): Promise<Quote[] | null> => {
    try {
      if (!user) {
        console.log("Nenhum usuário logado, não é possível buscar orçamentos");
        return null;
      }
      
      console.log(`Tentativa ${attempt}/${MAX_RETRY_ATTEMPTS}: Buscando orçamentos para o usuário:`, user.email);
      const quotesData = await fetchQuotes();
      
      if (quotesData && quotesData.length > 0) {
        console.log(`Orçamentos carregados com sucesso: ${quotesData.length}`);
        console.log("Último orçamento:", {
          id: quotesData[0].id,
          status: quotesData[0].status,
          items: quotesData[0].items?.length,
          created_at: quotesData[0].created_at,
          created_from: quotesData[0].created_from || 'não especificado'
        });
        return quotesData;
      } 
      
      console.log("Nenhum orçamento encontrado para o usuário");
      return [];
    } catch (error) {
      console.error(`Erro ao carregar orçamentos (tentativa ${attempt}/${MAX_RETRY_ATTEMPTS}):`, error);
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Tentando novamente em ${RETRY_DELAY/1000} segundos...`);
        return null; // Indica que devemos tentar novamente
      } else {
        console.error('Todas as tentativas de buscar orçamentos falharam');
        return null;
      }
    }
  }, [user]);

  // Função para recarregar orçamentos manualmente
  const reloadQuotes = useCallback(async () => {
    if (!user) {
      toast.error('Você precisa estar logado para ver seus orçamentos.');
      return;
    }

    setIsLoading(true);
    setLoadingStatus('Atualizando orçamentos...');
    setRetryCount(0);

    try {
      const result = await fetchUserQuotes(1);
      if (result !== null) {
        setQuotes(result);
        toast.success('Orçamentos atualizados com sucesso!');
      } else {
        toast.error('Não foi possível atualizar os orçamentos. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchUserQuotes]);

  // Efeito para carregar orçamentos com sistema de retry
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        if (retryCount >= MAX_RETRY_ATTEMPTS) {
          console.error('Máximo de tentativas atingido');
          toast.error('Erro ao carregar orçamentos após várias tentativas.');
          setIsLoading(false);
          return;
        }

        if (!user) {
          console.log("Nenhum usuário logado, não é possível buscar orçamentos");
          setQuotes([]);
          setIsLoading(false);
          return;
        }
        
        // Atualiza mensagem de status durante tentativas repetidas
        if (retryCount > 0) {
          setLoadingStatus(`Tentando novamente... (${retryCount}/${MAX_RETRY_ATTEMPTS})`);
        }
        
        const result = await fetchUserQuotes(retryCount + 1);
        
        if (result === null && retryCount < MAX_RETRY_ATTEMPTS) {
          // Se falhou e ainda temos tentativas, tentamos novamente após um delay
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            // Força uma nova renderização para tentar novamente
            setLoadingStatus(`Preparando nova tentativa... (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
          }, RETRY_DELAY);
        } else if (result !== null) {
          // Sucesso
          setQuotes(result);
          setIsLoading(false);
        } else {
          // Falha após todas as tentativas
          setQuotes([]);
          setIsLoading(false);
          console.error('Falha ao buscar orçamentos após todas as tentativas');
        }
      } catch (error) {
        console.error('Erro inesperado ao carregar orçamentos:', error);
        toast.error('Erro ao carregar orçamentos. Por favor, tente novamente.');
        setQuotes([]);
        setIsLoading(false);
      }
    };
    
    setIsLoading(true);
    loadQuotes();
  }, [user, retryCount, fetchUserQuotes]);

  return { quotes, isLoading, loadingStatus, reloadQuotes };
};
