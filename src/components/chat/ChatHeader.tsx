
import React, { ReactNode } from 'react';
import { Bot } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface ChatHeaderProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function ChatHeader({ 
  title = "Assistente IPT Teixeira", 
  description = "Especialista em produtos de concreto",
  actions 
}: ChatHeaderProps) {
  return (
    <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8 bg-primary">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </Avatar>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}
