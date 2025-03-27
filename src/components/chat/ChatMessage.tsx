
import React from 'react';
import { Bot, User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { ChatMessage as ChatMessageType } from '@/lib/types';

interface MessageItemProps {
  message: ChatMessageType;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  
  // Função para processar links no texto
  const formatMessageContent = (content: string) => {
    // Expressão regular para encontrar URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Dividir o conteúdo em pedaços (texto e URLs)
    const parts = content.split(urlRegex);
    
    // Encontrar as URLs que correspondem ao regex
    const matches = content.match(urlRegex) || [];
    
    // Corrigido: Definir explicitamente o tipo de matches como string[]
    const urlMatches: string[] = matches;
    
    // Juntar as partes novamente, mas transformando URLs em links
    return parts.map((part, index) => {
      // Verificar se a parte é uma URL
      if (urlMatches.indexOf(part) !== -1) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`underline ${isUser ? 'text-primary-foreground' : 'text-blue-600'}`}
          >
            {part}
          </a>
        );
      }
      // Se for texto normal
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };
  
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
        <p className="text-sm whitespace-pre-wrap">{formatMessageContent(message.content)}</p>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 mt-0.5 bg-secondary text-secondary-foreground">
          <User className="h-4 w-4" />
        </Avatar>
      )}
    </div>
  );
}
