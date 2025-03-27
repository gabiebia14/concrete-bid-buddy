
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';
import { AuthForm } from '@/components/auth/AuthForm';

interface ChatInterfaceProps {
  clientId?: string;
  title?: string;
  description?: string;
  showBailey?: boolean;
  onQuoteRequest?: (quoteData: any) => void;
}

export function ChatInterface({ 
  clientId, 
  title = "Assistente IPT Teixeira", 
  description = "Assistente de Vendas", 
  showBailey = false,
  onQuoteRequest 
}: ChatInterfaceProps) {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
      
      if (data.user) {
        // Usar informações do perfil do usuário
        setUserInfo({
          name: data.user.user_metadata?.full_name || '',
          email: data.user.email || '',
          phone: data.user.user_metadata?.phone || ''
        });
      }
      
      setIsAuthLoading(false);
    };
    
    checkAuth();
    
    // Ouvir mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        setUserInfo({
          name: session.user.user_metadata?.full_name || '',
          email: session.user.email || '',
          phone: session.user.user_metadata?.phone || ''
        });
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
    
  const { message, setMessage, messages, isLoading, handleSendMessage } = useChat({
    clientId,
    source: 'web',
    onQuoteRequest,
    userInfo: isAuthenticated ? userInfo : undefined
  });

  // Mostrar tela de autenticação se não estiver autenticado
  if (isAuthLoading) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Faça login ou cadastre-se</h2>
              <p className="text-muted-foreground">Para usar o assistente, é necessário entrar na sua conta</p>
            </div>
            <AuthForm />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <ChatHeader 
        title={title}
        description={description}
        actions={
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              title="Configurações"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        }
      />
      <CardContent className="p-0 flex-1">
        <ChatMessages messages={messages} isTyping={isLoading} showBailey={showBailey} />
      </CardContent>
      <CardFooter className="p-0">
        <ChatInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </CardFooter>
      
      <Toaster />
    </Card>
  );
}
