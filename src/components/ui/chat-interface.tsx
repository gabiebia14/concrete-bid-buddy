
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { saveChatMessage, createChatSession } from '@/lib/supabase';
import { ChatMessage, ChatSession } from '@/lib/types';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ChatInterfaceProps {
  clientId?: string;
  onQuoteRequest?: (quoteData: any) => void;
}

export function ChatInterface({ clientId, onQuoteRequest }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create or retrieve chat session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // In a real app, we would check for existing active sessions first
        const session: ChatSession = await createChatSession({
          client_id: clientId,
          status: 'active',
          created_at: new Date().toISOString()
        });
        
        setSessionId(session.id);
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          session_id: session.id,
          content: 'Olá, sou o assistente de vendas da IPT Teixeira, especialista em produtos de concreto. Como posso te ajudar hoje?',
          role: 'assistant',
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };
        
        setMessages([welcomeMessage]);
        await saveChatMessage({
          session_id: welcomeMessage.session_id,
          content: welcomeMessage.content,
          role: welcomeMessage.role,
          created_at: welcomeMessage.created_at
        });
        
      } catch (error) {
        console.error('Error initializing chat session:', error);
        toast.error('Erro ao iniciar o chat. Por favor, tente novamente.');
      }
    };
    
    initSession();
  }, [clientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Save user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        session_id: sessionId,
        content: message,
        role: 'user',
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      
      // Add to UI immediately
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      // Save to database
      await saveChatMessage({
        session_id: userMessage.session_id,
        content: userMessage.content,
        role: userMessage.role,
        created_at: userMessage.created_at
      });
      
      // Call the LangChain Edge Function
      try {
        const { data, error } = await supabase.functions.invoke("chat-assistant", {
          body: {
            messages: [...messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            sessionId: sessionId
          }
        });
        
        if (error) {
          throw new Error(`Erro na função de borda: ${error.message}`);
        }
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          session_id: sessionId,
          content: data?.message || "Desculpe, estou tendo dificuldades para processar sua solicitação no momento.",
          role: 'assistant',
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };
        
        // Add to UI
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save to database
        await saveChatMessage({
          session_id: assistantMessage.session_id,
          content: assistantMessage.content,
          role: assistantMessage.role,
          created_at: assistantMessage.created_at
        });
        
        // Check if quote request was detected
        if (data?.quoteData) {
          console.log("Quote data detected:", data.quoteData);
          onQuoteRequest?.(data.quoteData);
        }
      } catch (error) {
        console.error("Error calling edge function:", error);
        
        // Fallback message if edge function fails
        const fallbackMessage: ChatMessage = {
          id: `assistant-fallback-${Date.now()}`,
          session_id: sessionId,
          content: "Desculpe, estou enfrentando problemas técnicos no momento. Nossa equipe já foi notificada. Por favor, tente novamente em instantes.",
          role: 'assistant',
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
        
        await saveChatMessage({
          session_id: fallbackMessage.session_id,
          content: fallbackMessage.content,
          role: fallbackMessage.role,
          created_at: fallbackMessage.created_at
        });
        
        toast.error('Erro ao processar mensagem. Nossa equipe já foi notificada do problema.');
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden border">
      <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">Assistente IPT Teixeira</h3>
            <p className="text-xs text-muted-foreground">Especialista em produtos de concreto</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2 animate-slide-in`}
          >
            {msg.role === 'assistant' && (
              <Avatar className="h-8 w-8 mt-0.5 bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </Avatar>
            )}
            
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            
            {msg.role === 'user' && (
              <Avatar className="h-8 w-8 mt-0.5 bg-secondary text-secondary-foreground">
                <User className="h-4 w-4" />
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t bg-background">
        <div className="flex items-center space-x-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="min-h-[40px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Nosso assistente virtual irá ajudá-lo a encontrar os produtos ideais e criar um orçamento personalizado.
        </p>
      </div>
    </Card>
  );
}
