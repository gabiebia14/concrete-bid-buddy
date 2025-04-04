
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Loader2, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { QuoteHeader } from '@/components/quotes/QuoteHeader';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { EmptyState } from '@/components/quotes/EmptyState';
import { useQuotes } from '@/hooks/useQuotes';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuoteHistory() {
  const { quotes, isLoading, loadingStatus, reloadQuotes } = useQuotes();
  const [activeTab, setActiveTab] = useState<string>('all');
  const { user } = useAuth();
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    console.log("QuoteHistory - Estado atual:", {
      isLoading,
      quotesCount: quotes?.length || 0,
      activeTab,
      userLogado: !!user
    });
  }, [isLoading, quotes, activeTab, user]);

  const filteredQuotes = activeTab === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.status === activeTab);

  // Função para lidar com o clique no botão de recarregar
  const handleReload = async () => {
    setIsReloading(true);
    try {
      await reloadQuotes();
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <QuoteHeader />
          
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 md:mt-0 flex items-center gap-2"
            onClick={handleReload}
            disabled={isLoading || isReloading}
          >
            {(isLoading || isReloading) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="bg-muted/20 p-1">
            <TabsTrigger value="all" className="text-sm">Todos</TabsTrigger>
            <TabsTrigger value="pending" className="text-sm">Pendentes</TabsTrigger>
            <TabsTrigger value="approved" className="text-sm">Aprovados</TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">Concluídos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <p className="text-sm text-muted-foreground">{loadingStatus}</p>
                
                {/* Skeletons para melhorar UX durante carregamento */}
                <div className="w-full space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border rounded-md p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <Skeleton className="h-5 w-40 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {[1, 2, 3, 4].map((j) => (
                          <Skeleton key={j} className="h-14 w-full" />
                        ))}
                      </div>
                      <Skeleton className="h-24 w-full mb-4" />
                      <div className="flex justify-end">
                        <Skeleton className="h-9 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="space-y-4">
                <EmptyState />
                
                {/* Mensagem adicional sugerindo atualização */}
                <div className="text-center text-sm text-muted-foreground mt-4">
                  <p>Se você criou orçamentos recentemente e eles não aparecem aqui,</p>
                  <p>tente atualizar clicando no botão "Atualizar" acima.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredQuotes.map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
