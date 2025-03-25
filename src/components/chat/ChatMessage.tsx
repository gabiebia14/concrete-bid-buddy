
import React from 'react';
import { Bot, User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { ChatMessage as ChatMessageType } from '@/lib/types';

// Renomeando para MessageItem para evitar confusão com o tipo ChatMessage
interface MessageItemProps {
  message: ChatMessageType;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-2 animate-slide-in`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 mt-0.5 bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </Avatar>
      )}
      
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 mt-0.5 bg-secondary text-secondary-foreground">
          <User className="h-4 w-4" />
        </Avatar>
      )}
    </div>
  );
}
