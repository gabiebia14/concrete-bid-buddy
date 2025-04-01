
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';
import { ChatMessage, ChatMessageProps } from './ChatMessage';
import { toast } from 'sonner';

// Definições de tipos para os recursos do chat
export interface ChatInterfaceProps {
  title?: string;
  description?: string;
  initialMessages?: ChatMessageProps[];
  showReset?: boolean;
  onSendMessage?: (message: string) => Promise<string>;
}

// Mensagens iniciais do assistente
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
  onSendMessage
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rolar para o final da conversa quando novas mensagens forem adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focar no input quando o componente montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Manipulador para envio de mensagem
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    console.log("Enviando mensagem:", input);
    
    // Adicionar mensagem do usuário
    const userMessage: ChatMessageProps = {
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Verificar se temos uma função para enviar mensagem
      if (onSendMessage) {
        const response = await onSendMessage(input);
        
        console.log("Resposta recebida:", response);
        
        // Adicionar mensagem do assistente após a resposta
        const assistantMessage: ChatMessageProps = {
          content: response,
          role: 'assistant',
          timestamp: new Date()
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Resposta padrão se não houver função para enviar mensagem
        setTimeout(() => {
          const assistantMessage: ChatMessageProps = {
            content: "Desculpe, não consigo processar sua solicitação no momento. Por favor, tente mais tarde.",
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      toast.error("Erro ao obter resposta do assistente");
      
      // Mostrar mensagem de erro como resposta do assistente
      const errorMessage: ChatMessageProps = {
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Resetar a conversa
  const handleResetChat = () => {
    setMessages(initialMessages);
    setInput('');
    setIsTyping(false);
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
          {isTyping && (
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
          />
          <Button 
            onClick={handleSendMessage} 
            className="rounded-l-none bg-lime-600 hover:bg-lime-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {showReset && (
          <Button 
            variant="outline" 
            onClick={handleResetChat}
            className="sm:w-auto w-full flex gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Reiniciar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
