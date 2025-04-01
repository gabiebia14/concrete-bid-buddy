
import { useState, useEffect } from 'react';
import { Quote } from '@/lib/types';
import { fetchQuotes } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const getMockQuotes = (): Quote[] => {
  return [
    {
      id: 'quote-001',
      client_id: 'client-001',
      client_name: 'João Silva',
      client_email: 'joao@exemplo.com',
      client_phone: '(11) 98765-4321',
      items: [
        {
          product_id: 'product-001',
          product_name: 'Bloco de Concreto Estrutural',
          dimensions: '14x19x39cm',
          quantity: 500,
          unit_price: 2.75,
          total_price: 1375,
        },
        {
          product_id: 'product-002',
          product_name: 'Piso Intertravado',
          dimensions: '10x20x6cm',
          quantity: 200,
          unit_price: 1.85,
          total_price: 370,
        },
      ],
      status: 'approved',
      delivery_location: 'Rua Exemplo, 123 - São Paulo/SP',
      delivery_deadline: '2023-12-15',
      payment_method: 'Transferência Bancária',
      created_at: '2023-11-28T14:32:45Z',
      updated_at: '2023-11-30T09:15:22Z',
      notes: 'Entregar na parte da manhã, antes das 11h.',
      total_amount: 1745,
    },
    {
      id: 'quote-002',
      client_id: 'client-001',
      client_name: 'João Silva',
      client_email: 'joao@exemplo.com',
      client_phone: '(11) 98765-4321',
      items: [
        {
          product_id: 'product-003',
          product_name: 'Laje Pré-Moldada',
          dimensions: '30x10x3m',
          quantity: 10,
          unit_price: 120,
          total_price: 1200,
        },
      ],
      status: 'pending',
      delivery_location: 'Rua Exemplo, 123 - São Paulo/SP',
      delivery_deadline: '2023-12-20',
      payment_method: 'Cartão de Crédito',
      created_at: '2023-12-01T10:15:30Z',
      updated_at: '2023-12-01T10:15:30Z',
      notes: '',
      total_amount: 1200,
    },
    {
      id: 'quote-003',
      client_id: 'client-001',
      client_name: 'João Silva',
      client_email: 'joao@exemplo.com',
      client_phone: '(11) 98765-4321',
      items: [
        {
          product_id: 'product-001',
          product_name: 'Bloco de Concreto Estrutural',
          dimensions: '14x19x39cm',
          quantity: 300,
          unit_price: 2.75,
          total_price: 825,
        },
      ],
      status: 'completed' as any,
      delivery_location: 'Rua Exemplo, 123 - São Paulo/SP',
      delivery_deadline: '2023-11-10',
      payment_method: 'Boleto Bancário',
      created_at: '2023-10-25T16:42:18Z',
      updated_at: '2023-11-12T11:30:05Z',
      notes: 'Entrega realizada com sucesso.',
      total_amount: 825,
    },
  ];
};

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setIsLoading(true);
        if (!user) {
          setQuotes(getMockQuotes());
          return;
        }
        
        console.log("Buscando orçamentos para o usuário:", user.email);
        const quotesData = await fetchQuotes();
        console.log("Orçamentos carregados:", quotesData);
        
        if (quotesData && quotesData.length > 0) {
          setQuotes(quotesData);
        } else {
          console.log("Sem orçamentos encontrados, usando dados de exemplo");
          setQuotes(getMockQuotes());
        }
      } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        toast.error('Erro ao carregar orçamentos. Por favor, tente novamente.');
        setQuotes(getMockQuotes());
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuotes();
  }, [user]);

  return { quotes, isLoading };
};
