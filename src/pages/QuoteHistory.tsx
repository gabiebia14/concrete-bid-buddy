import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, Calendar, MapPin, CreditCard, RefreshCw, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <div className="page-container max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="page-title mb-2">Histórico de Orçamentos</h1>
              <p className="text-muted-foreground">
                Acompanhe todos os seus orçamentos e solicitações
              </p>
            </div>
            <Button asChild>
              <Link to="/criar-orcamento">
                Novo Orçamento
              </Link>
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="approved">Aprovados</TabsTrigger>
              <TabsTrigger value="completed">Concluídos</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="animate-fade-in">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredQuotes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum orçamento encontrado</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      {activeTab === 'all' 
                        ? 'Você ainda não possui nenhum orçamento. Crie seu primeiro orçamento agora.'
                        : `Você não possui orçamentos com status "${activeTab}".`}
                    </p>
                    <Button asChild>
                      <Link to="/criar-orcamento">
                        Criar Orçamento
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredQuotes.map((quote) => (
                    <Card key={quote.id} className="card-hover">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle>Orçamento #{quote.id.split('-')[1]}</CardTitle>
                              {getStatusBadge(quote.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Criado em {formatDate(quote.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {quote.total_amount && (
                              <Badge variant="outline" className="text-base font-semibold">
                                R$ {quote.total_amount.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Prazo de Entrega</p>
                              <p className="text-sm font-medium">
                                {quote.delivery_deadline ? formatDate(quote.delivery_deadline) : 'A definir'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Local de Entrega</p>
                              <p className="text-sm font-medium">{quote.delivery_location}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Forma de Pagamento</p>
                              <p className="text-sm font-medium">
                                {quote.payment_method || 'A definir'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Última Atualização</p>
                              <p className="text-sm font-medium">{formatDate(quote.updated_at)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground mb-2">Itens ({quote.items.length})</p>
                          <div className="space-y-2">
                            {quote.items.map((item, index) => (
                              <div key={index} className="text-sm border rounded-md p-2 bg-muted/30">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{item.product_name}</span>
                                  <span>
                                    {item.quantity} {item.quantity > 1 ? 'unidades' : 'unidade'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Dimensões: {item.dimensions}</span>
                                  {item.unit_price && (
                                    <span>R$ {item.unit_price.toFixed(2)} cada</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <Button variant="outline" size="sm" className="text-xs">
                            Ver Detalhes
                            <ArrowRight className="ml-2 h-3 w-3" />
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
      </main>
      
      <Footer />
    </div>
  );
}
