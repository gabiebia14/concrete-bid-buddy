
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  placeholder = "Digite sua mensagem..."
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Função para ajustar a altura do textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Ajustar altura quando o conteúdo muda
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Manipular envio da mensagem
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    onSendMessage(message.trim());
    setMessage('');
    
    // Resetar altura do textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Manipular tecla Enter para enviar (Shift+Enter para quebra de linha)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 border-t bg-background">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-10 resize-none py-2"
        rows={1}
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!message.trim() || isLoading}
        className="h-10 w-10 shrink-0"
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Enviar mensagem</span>
      </Button>
    </form>
  );
};
