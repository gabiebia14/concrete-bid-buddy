
import React from 'react';
import { cn } from '@/lib/utils';

export type MessageRole = 'assistant' | 'user';

export interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp?: Date;
}

export function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
  const isAssistant = role === 'assistant';
  
  return (
    <div 
      className={cn(
        "flex w-full mb-4",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      <div 
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%] break-words",
          isAssistant 
            ? "bg-gray-100 text-gray-800" 
            : "bg-lime-600 text-white"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <div 
            className={cn(
              "text-xs mt-1 text-right",
              isAssistant ? "text-gray-500" : "text-lime-200"
            )}
          >
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}
