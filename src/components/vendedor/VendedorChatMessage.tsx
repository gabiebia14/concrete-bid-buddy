
import { VendedorChatMessage } from '@/lib/vendedorTypes';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface MessageProps {
  message: VendedorChatMessage;
}

export function VendedorMessage({ message }: MessageProps) {
  const isVendedor = message.remetente === 'vendedor';
  const timestamp = message.created_at 
    ? formatDistanceToNow(new Date(message.created_at), { 
        addSuffix: true, 
        locale: ptBR 
      })
    : '';

  return (
    <div className={cn(
      "flex items-start gap-2 p-2 rounded-lg",
      isVendedor 
        ? "ml-8 mr-4" 
        : "ml-4 mr-8"
    )}>
      <div className="flex-shrink-0 mt-1">
        <Avatar className={cn(
          "h-8 w-8",
          isVendedor ? "bg-lime-100" : "bg-gray-100"
        )}>
          <AvatarFallback className={cn(
            isVendedor ? "text-lime-800" : "text-gray-600"
          )}>
            {isVendedor ? "V" : <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className={cn(
        "flex flex-col rounded-xl p-3 max-w-[80%]",
        isVendedor
          ? "bg-lime-100 text-lime-900"
          : "bg-gray-100 text-gray-900"
      )}>
        <div className="text-sm font-medium mb-1">
          {isVendedor ? "Vendedor" : "Você"}
        </div>
        <div className="whitespace-pre-wrap text-sm">
          {message.conteudo}
        </div>
        <div className="text-xs opacity-70 mt-1 self-end">
          {timestamp}
        </div>
      </div>
    </div>
  );
}
