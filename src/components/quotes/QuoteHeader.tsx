
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuoteHeader = () => {
  return (
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
  );
};
