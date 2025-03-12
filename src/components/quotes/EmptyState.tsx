
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = () => {
  return (
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
  );
};
