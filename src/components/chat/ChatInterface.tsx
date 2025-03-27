
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/lib/chatTypes";
import { useChat } from "@/hooks/useChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUserMessage = message.role === 'user';
  
  return (
    <div className={`mb-2 flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-xl px-4 py-2 text-sm w-fit max-w-[80%] ${isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
        {message.content}
      </div>
    </div>
  );
};

interface ChatInterfaceProps {
  phoneNumber?: string;
  title?: string; 
  description?: string;
  showReset?: boolean;
}

export function ChatInterface({ phoneNumber, title, description, showReset = true }: ChatInterfaceProps) {
  const { messages, isLoading, error, sendMessage, resetChat } = useChat(undefined, phoneNumber);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleSendMessage = async () => {
    if (input.trim()) {
      await sendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] rounded-md shadow-md overflow-hidden">
      {(title || description) && (
        <div className="p-4 bg-muted/30 border-b">
          {title && <h3 className="font-medium text-lg">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      
      <div className="flex-grow overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="p-4">
            {messages.map((message, index) => (
              <ChatBubble key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      {isLoading && (
        <div className="animate-pulse text-center p-2 bg-secondary text-secondary-foreground">
          Carregando...
        </div>
      )}
      
      {error && (
        <div className="text-center p-2 bg-destructive text-destructive-foreground">
          Erro: {error}
        </div>
      )}
      
      <div className="p-4 bg-background border-t">
        {showReset && messages.length > 0 && (
          <div className="mb-2 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetChat}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar conversa
            </Button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            Enviar
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
