
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuoteHeader } from '@/components/quotes/QuoteHeader';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { EmptyState } from '@/components/quotes/EmptyState';
import { useQuotes } from '@/hooks/useQuotes';

export default function QuoteHistory() {
  const { quotes, isLoading } = useQuotes();
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredQuotes = activeTab === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.status === activeTab);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <QuoteHeader />

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
