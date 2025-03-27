
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface ChatInterfaceProps {
  sessionId?: string;
  title?: string;
  description?: string;
  className?: string;
  showReset?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  title = "Assistente IPT Teixeira",
  description = "Tire suas dúvidas, solicite informações ou peça um orçamento.",
  className = "",
  showReset = true
}) => {
  const { messages, isLoading, sendMessage, resetChat } = useChat(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para rolar para o final da conversa
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Rolar para o final quando novas mensagens chegarem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card className={`flex flex-col h-[600px] w-full ${className}`}>
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {showReset && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={resetChat}
              disabled={isLoading || messages.length === 0}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Reiniciar conversa</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {messages.length > 0 ? (
            <div className="flex flex-col">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <img 
                src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" 
                alt="IPT Teixeira" 
                className="w-16 h-16 mb-4 opacity-70"
              />
              <h3 className="text-lg font-medium">Como posso ajudar?</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Converse com nosso assistente para conhecer mais sobre nossos produtos, 
                tirar dúvidas ou solicitar um orçamento.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-0">
        <ChatInput 
          onSendMessage={sendMessage}
          isLoading={isLoading}
          placeholder="Digite sua mensagem..."
        />
      </CardFooter>
    </Card>
  );
};
