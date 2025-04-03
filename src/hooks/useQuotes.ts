
import { useState, useEffect } from 'react';
import { Quote } from '@/lib/types';
import { fetchQuotes } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setIsLoading(true);
        if (!user) {
          console.log("Nenhum usuário logado, não é possível buscar orçamentos");
          setQuotes([]);
          return;
        }
        
        console.log("Buscando orçamentos para o usuário:", user.email);
        const quotesData = await fetchQuotes();
        console.log("Orçamentos carregados:", quotesData?.length || 0);
        
        if (quotesData && quotesData.length > 0) {
          console.log("Último orçamento:", {
            id: quotesData[0].id,
            status: quotesData[0].status,
            items: quotesData[0].items?.length,
            created_at: quotesData[0].created_at
          });
          setQuotes(quotesData);
        } else {
          console.log("Nenhum orçamento encontrado para o usuário");
          setQuotes([]);
        }
      } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        toast.error('Erro ao carregar orçamentos. Por favor, tente novamente.');
        setQuotes([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuotes();
  }, [user]);

  return { quotes, isLoading };
};
