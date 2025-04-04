
import { Quote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, CreditCard, RefreshCw, ArrowRight, Bot, User, FileText } from 'lucide-react';
import { getStatusBadge, formatDate } from '@/utils/quoteUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuoteCardProps {
  quote: Quote;
}

export const QuoteCard = ({ quote }: QuoteCardProps) => {
  // Garantir que temos IDs válidos
  const displayId = quote.id ? quote.id.split('-')?.[1] || quote.id.substring(0, 8) : 'ID não disponível';
  
  // Verificar se as datas são válidas antes de formatar
  const isValidDate = (dateStr?: string) => dateStr && !isNaN(new Date(dateStr).getTime());
  const formatSafeDate = (dateStr?: string) => isValidDate(dateStr) ? formatDate(dateStr as string) : 'Data não disponível';
  
  // Verificar se temos itens válidos
  const hasValidItems = quote.items && Array.isArray(quote.items) && quote.items.length > 0;
  
  // Determinar ícone e texto baseado na origem do orçamento
  const getSourceIcon = () => {
    switch (quote.created_from) {
      case 'ai':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Bot className="h-4 w-4 text-purple-500" />
              </TooltipTrigger>
              <TooltipContent>Criado pela IA</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'manual':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <User className="h-4 w-4 text-blue-500" />
              </TooltipTrigger>
              <TooltipContent>Criado manualmente</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'import':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <FileText className="h-4 w-4 text-orange-500" />
              </TooltipTrigger>
              <TooltipContent>Importado</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold text-gray-900">
                Orçamento #{displayId}
              </span>
              {getStatusBadge(quote.status)}
              {getSourceIcon() && (
                <span className="flex items-center text-xs text-gray-500 gap-1">
                  {getSourceIcon()}
                  {quote.created_from === 'ai' && 'IA'}
                  {quote.created_from === 'manual' && 'Manual'}
                  {quote.created_from === 'import' && 'Importado'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Criado em {formatSafeDate(quote.created_at)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Prazo de Entrega</p>
              <p className="text-sm font-medium text-gray-900">
                {quote.delivery_deadline ? formatSafeDate(quote.delivery_deadline) : 'A definir'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Local</p>
              <p className="text-sm font-medium text-gray-900">{quote.delivery_location || 'A definir'}</p>
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
                {formatSafeDate(quote.updated_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900">
            Itens ({hasValidItems ? quote.items.length : 0})
          </p>
          
          {hasValidItems ? (
            <div className="grid gap-2">
              {quote.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name || 'Produto sem nome'}</p>
                      <p className="text-sm text-gray-500">
                        {item.dimensions || 'Dimensões não especificadas'} - {item.quantity || 0} unidades
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Nenhum item encontrado neste orçamento</p>
            </div>
          )}
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
