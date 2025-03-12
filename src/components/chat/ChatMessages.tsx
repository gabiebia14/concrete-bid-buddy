
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import { ChatMessageItem } from './ChatMessage';
import { Loader2 } from 'lucide-react';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function ChatMessages({ messages, isTyping = false }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}
      
      {isTyping && (
        <div className="flex items-start gap-2">
          <div className="h-8 w-8 mt-0.5 flex items-center justify-center bg-primary/10 text-primary rounded-full">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div className="bg-muted px-4 py-2 rounded-lg">
            <p className="text-sm">Digitando<span className="animate-pulse">...</span></p>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
