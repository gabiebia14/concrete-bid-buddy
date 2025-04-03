
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuoteHeader } from '@/components/quotes/QuoteHeader';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { EmptyState } from '@/components/quotes/EmptyState';
import { useQuotes } from '@/hooks/useQuotes';
import { useAuth } from '@/contexts/AuthContext';

export default function QuoteHistory() {
  const { quotes, isLoading } = useQuotes();
  const [activeTab, setActiveTab] = useState<string>('all');
  const { user } = useAuth();
  const [loadingStatus, setLoadingStatus] = useState("Carregando orçamentos...");

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

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setLoadingStatus("Ainda carregando orçamentos... Isso pode levar alguns segundos.");
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <QuoteHeader />

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
              </div>
            ) : filteredQuotes.length === 0 ? (
              <EmptyState />
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
