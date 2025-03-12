import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, Calendar, MapPin, CreditCard, RefreshCw, ArrowRight, Plus, Search } from 'lucide-react';
import { Quote, QuoteStatus } from '@/lib/types';
import { fetchQuotes } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function QuoteHistory() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setIsLoading(true);
        const quotesData = await fetchQuotes();
        setQuotes(quotesData || getMockQuotes());
      } catch (error) {
        console.error('Error loading quotes:', error);
        toast.error('Erro ao carregar orçamentos. Por favor, tente novamente.');
        setQuotes(getMockQuotes());
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuotes();
  }, []);

  const filteredQuotes = activeTab === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.status === activeTab);

  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'outline' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      approved: { label: 'Aprovado', variant: 'default' as const },
      sent: { label: 'Enviado', variant: 'default' as const },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const },
      completed: { label: 'Concluído', variant: 'default' as const },
    };
    
    const config = statusConfig[status];
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
        status: 'completed' as QuoteStatus,
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

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Orçamentos</h1>
            <p className="text-muted-foreground">Acompanhe todas suas solicitações</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar orçamentos..."
                className="pl-8 h-9 w-[200px] lg:w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
            <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
              <Link to="/criar-orcamento" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-muted/20 p-1">
            <TabsTrigger value="all" className="text-sm">Todos</TabsTrigger>
            <TabsTrigger value="pending" className="text-sm">Pendentes</TabsTrigger>
            <TabsTrigger value="approved" className="text-sm">Aprovados</TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">Concluídos</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : filteredQuotes.length === 0 ? (
              <Card className="bg-white border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    Você ainda não possui nenhum orçamento. Crie seu primeiro orçamento agora.
                  </p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link to="/criar-orcamento">
                      Criar Orçamento
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredQuotes.map((quote) => (
                  <Card key={quote.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold text-gray-900">
                              Orçamento #{quote.id.split('-')[1]}
                            </span>
                            {getStatusBadge(quote.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            Criado em {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-base font-semibold bg-green-50 text-green-700 border-green-200">
                            R$ {quote.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Prazo de Entrega</p>
                            <p className="text-sm font-medium text-gray-900">
                              {quote.delivery_deadline ? new Date(quote.delivery_deadline).toLocaleDateString('pt-BR') : 'A definir'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Local</p>
                            <p className="text-sm font-medium text-gray-900">{quote.delivery_location}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Pagamento</p>
                            <p className="text-sm font-medium text-gray-900">
                              {quote.payment_method || 'A definir'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <RefreshCw className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Atualização</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(quote.updated_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-900">Itens ({quote.items.length})</p>
                        <div className="grid gap-2">
                          {quote.items.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900">{item.product_name}</p>
                                  <p className="text-sm text-gray-500">
                                    {item.dimensions} - {item.quantity} unidades
                                  </p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  R$ {item.unit_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /un
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button variant="outline" className="text-sm">
                          Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
