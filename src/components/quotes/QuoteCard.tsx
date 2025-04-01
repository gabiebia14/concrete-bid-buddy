
import { Quote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, CreditCard, RefreshCw, ArrowRight } from 'lucide-react';
import { getStatusBadge, formatDate } from '@/utils/quoteUtils';

interface QuoteCardProps {
  quote: Quote;
}

export const QuoteCard = ({ quote }: QuoteCardProps) => {
  return (
    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
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
              Criado em {formatDate(quote.created_at)}
            </p>
          </div>
          {/* Removida a exibição do valor total do orçamento */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Prazo de Entrega</p>
              <p className="text-sm font-medium text-gray-900">
                {quote.delivery_deadline ? formatDate(quote.delivery_deadline) : 'A definir'}
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
                {formatDate(quote.updated_at)}
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
                  {/* Removida a exibição do valor unitário do produto */}
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
  );
};
