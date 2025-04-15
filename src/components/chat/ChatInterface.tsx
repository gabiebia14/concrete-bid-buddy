
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';
import { ChatMessage, ChatMessageProps } from '@/components/chat/ChatMessage';

export interface ChatInterfaceProps {
  title?: string;
  description?: string;
  initialMessages?: ChatMessageProps[];
  showReset?: boolean;
  onSendMessage?: (message: string) => Promise<string>;
  isLoading?: boolean;
}

const defaultInitialMessages: ChatMessageProps[] = [
  {
    content: "Olá! Sou o assistente virtual da IPT Teixeira. Como posso ajudar com seu orçamento de produtos de concreto hoje?",
    role: "assistant",
    timestamp: new Date()
  }
];

export function ChatInterface({ 
  title = "Assistente Virtual",
  description = "Converse com nosso assistente para tirar dúvidas sobre produtos",
  initialMessages = defaultInitialMessages,
  showReset = true,
  onSendMessage,
  isLoading = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !onSendMessage) return;

    const userMessage: ChatMessageProps = {
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await onSendMessage(input);
      
      const assistantMessage: ChatMessageProps = {
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
    }
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <Card className="w-full border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-lime-600" />
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-4">
        <ScrollArea className="h-[350px] pr-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              content={message.content}
              role={message.role}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0 flex flex-col sm:flex-row gap-2">
        <div className="flex w-full">
          <Input
            ref={inputRef}
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="rounded-r-none"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            className="rounded-l-none bg-lime-600 hover:bg-lime-700"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {showReset && (
          <Button 
            variant="outline" 
            onClick={handleResetChat}
            className="sm:w-auto w-full flex gap-1"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Reiniciar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
