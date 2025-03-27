
import React, { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

export function VendedorChatInput({ 
  onSendMessage, 
  placeholder = "Digite sua mensagem...", 
  isDisabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  // Handler para permitir Shift+Enter para nova linha
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isDisabled) {
        onSendMessage(message);
        setMessage("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t bg-white">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          className="min-h-[3rem] max-h-[8rem] resize-none"
          autoComplete="off"
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || isDisabled}
          className="bg-lime-600 hover:bg-lime-700"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Enviar mensagem</span>
        </Button>
      </div>
    </form>
  );
}
