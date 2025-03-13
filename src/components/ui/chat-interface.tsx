
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { Layout } from '@/components/layout/Layout';
import { Bot, MessageSquare } from 'lucide-react';

interface ChatInterfaceProps {
  clientId?: string;
  onQuoteRequest?: (quoteData: any) => void;
}

export function ChatInterface({ clientId, onQuoteRequest }: ChatInterfaceProps) {
  const { 
    message, 
    setMessage, 
    messages, 
    isLoading, 
    handleSendMessage 
  } = useChat({ clientId, onQuoteRequest });

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col mb-6">
          <h1 className="text-2xl font-bold">Assistente de Vendas</h1>
          <p className="text-muted-foreground">Tire suas dúvidas sobre produtos e solicite orçamentos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Assistente IPT Teixeira
              </CardTitle>
              <CardDescription>
                Especialista em artefatos de concreto há mais de 30 anos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[600px] overflow-hidden">
                <ChatMessages messages={messages} isTyping={isLoading} />
                <ChatInput 
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Como posso ajudar?
              </CardTitle>
              <CardDescription>
                Exemplos de perguntas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors">
                  <p className="text-sm font-medium">Quais tipos de blocos vocês produzem?</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors">
                  <p className="text-sm font-medium">Preciso de um orçamento para 1000 pisos intertravados</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors">
                  <p className="text-sm font-medium">Quais são as dimensões dos seus postes?</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors">
                  <p className="text-sm font-medium">Vocês fazem entrega para qual região?</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors">
                  <p className="text-sm font-medium">Quais são as formas de pagamento disponíveis?</p>
                </div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-md mt-6">
                <h4 className="text-sm font-medium mb-2">Sobre o assistente</h4>
                <p className="text-xs text-muted-foreground">
                  O assistente virtual da IPT Teixeira utiliza inteligência artificial para fornecer informações precisas sobre nossa linha completa de produtos. Ele pode ajudar com especificações técnicas, recomendações de uso e criação de orçamentos personalizados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
