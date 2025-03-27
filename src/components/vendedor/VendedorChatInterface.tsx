
import React, { useRef, useEffect } from 'react';
import { VendedorMessage } from './VendedorChatMessage';
import { VendedorChatInput } from './VendedorChatInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVendedorChat } from '@/hooks/useVendedorChat';
import { MessageSquare, ArrowDown } from 'lucide-react';

interface ChatInterfaceProps {
  title?: string;
  description?: string;
  clienteId?: string;
}

export function VendedorChatInterface({ 
  title = "Chat com Vendedor", 
  description = "Tire suas dúvidas e solicite orçamentos",
  clienteId
}: ChatInterfaceProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    isLoading, 
    error, 
    sessionId,
    enviarMensagem,
    limparErro
  } = useVendedorChat(clienteId);

  // Rolar para o final quando novas mensagens chegarem
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (message: string) => {
    if (error) limparErro();
    enviarMensagem(message, 'cliente');
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-muted-foreground">
              Envie uma mensagem para iniciar a conversa com nosso vendedor
            </p>
          </div>
        </div>
      );
    }

    return messages.map((message) => (
      <VendedorMessage key={message.id} message={message} />
    ));
  };

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 pt-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden flex flex-col">
        <div 
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-2 space-y-4 relative"
        >
          {renderMessages()}
          
          {/* Botão para rolar para o final */}
          {messages.length > 5 && (
            <Button
              size="sm"
              variant="outline"
              className="absolute bottom-4 right-4 rounded-full p-2 bg-white"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <VendedorChatInput
          onSendMessage={handleSendMessage}
          isDisabled={isLoading || !sessionId}
        />
      </CardContent>
    </Card>
  );
}
