
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/lib/chatTypes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const formattedDate = message.created_at 
    ? format(new Date(message.created_at), "dd MMM, HH:mm", { locale: ptBR })
    : '';
  
  return (
    <div className={cn(
      "flex w-full gap-3 p-4",
      isUser ? "justify-end" : ""
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <img src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" alt="IPT Teixeira" />
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col space-y-1 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-2 text-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground">
          {formattedDate}
        </span>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <img src="https://ui.shadcn.com/avatars/01.png" alt="User" />
        </Avatar>
      )}
    </div>
  );
};
