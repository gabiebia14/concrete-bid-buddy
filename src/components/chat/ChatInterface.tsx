
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

// Exemplo de respostas predefinidas para demonstração
const demoResponses: Record<string, string> = {
  "bloco": "Temos diversos tipos de blocos estruturais. Você está procurando blocos para muro, construção ou algum outro uso específico?",
  "tijolo": "Na verdade, produzimos blocos de concreto, que são diferentes dos tijolos cerâmicos. Nossos blocos de concreto têm excelente resistência e são ideais para construções.",
  "laje": "Fabricamos lajes pré-moldadas de alta qualidade. Você já tem as medidas da área onde precisará instalar a laje?",
  "tubo": "Nossos tubos de concreto são disponíveis em diversos diâmetros. Para que tipo de drenagem ou instalação você precisa?",
  "preço": "Para fornecer um orçamento preciso, precisarei saber quais produtos, quantidades e especificações você necessita. Posso te ajudar a selecionar os produtos ideais para seu projeto.",
  "piso": "Temos pisos intertravados em diversos formatos e cores. Eles são excelentes para calçadas, estacionamentos e áreas externas em geral.",
  "entrega": "Realizamos entregas em toda a região do ABC Paulista. O prazo de entrega depende da disponibilidade dos produtos e da sua localização.",
  "orçamento": "Para montar seu orçamento, precisamos saber quais produtos você necessita. Você pode selecionar os produtos na tela ao lado e adicionar as quantidades."
};

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

  // Função para simular respostas (em uma implementação real, isso seria substituído pela chamada à API)
  const getAssistantResponse = async (message: string): Promise<string> => {
    // Se houver uma função onSendMessage passada como prop, use-a
    if (onSendMessage) {
      return await onSendMessage(message);
    }
    
    // Caso contrário, use as respostas demo
    const lowerMessage = message.toLowerCase();
    
    // Verificar palavras-chave nas respostas predefinidas
    for (const [keyword, response] of Object.entries(demoResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    // Resposta padrão se nenhuma palavra-chave for encontrada
    return "Entendi sua mensagem. Para ajudar melhor com seu orçamento, poderia fornecer mais detalhes sobre o que você precisa? Por exemplo, quais produtos, quantidades ou dimensões específicas?";
  };

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
      // Obter resposta do assistente (simulada ou via API)
      const response = await getAssistantResponse(input);
      
      // Adicionar mensagem do assistente após um pequeno delay para simular digitação
      setTimeout(() => {
        const assistantMessage: ChatMessageProps = {
          content: response,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setIsTyping(false);
      toast.error("Erro ao obter resposta do assistente");
      console.error("Erro na resposta do assistente:", error);
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
