
import React from 'react';
import { Bot, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

export function ChatHeader() {
  return (
    <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8 bg-primary">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </Avatar>
        <div>
          <h3 className="text-sm font-medium">Assistente IPT Teixeira</h3>
          <p className="text-xs text-muted-foreground">Especialista em produtos de concreto</p>
        </div>
      </div>
      <Button variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Novo Chat
      </Button>
    </div>
  );
}
