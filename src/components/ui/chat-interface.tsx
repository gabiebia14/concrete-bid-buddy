
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Server, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';

interface ChatInterfaceProps {
  clientId?: string;
  title?: string;
  description?: string;
  showBailey?: boolean;
  webhookUrl?: string;
  onQuoteRequest?: (quoteData: any) => void;
}

export function ChatInterface({ 
  clientId, 
  title = "Assistente IPT Teixeira", 
  description = "Assistente de Vendas", 
  showBailey = false,
  webhookUrl,
  onQuoteRequest 
}: ChatInterfaceProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const [localWebhookUrl, setLocalWebhookUrl] = useState<string>('');
  const [useProxy, setUseProxy] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  
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
  
  // Carregar URL do webhook e configuração de proxy do localStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem('chatWebhookUrl');
    const savedProxyConfig = localStorage.getItem('useWebhookProxy');
    
    // Se um webhookUrl foi passado como prop, use-o com prioridade
    if (webhookUrl) {
      setLocalWebhookUrl(webhookUrl);
      localStorage.setItem('chatWebhookUrl', webhookUrl);
    } else if (savedUrl) {
      setLocalWebhookUrl(savedUrl);
    } else {
      // Define a URL padrão correta
      const defaultUrl = 'https://gbservin8n.sevirenostrinta.com.br/webhook-test/chat-assistant';
      setLocalWebhookUrl(defaultUrl);
      localStorage.setItem('chatWebhookUrl', defaultUrl);
    }
    
    // Carregar configuração de proxy
    if (savedProxyConfig !== null) {
      setUseProxy(savedProxyConfig === 'true');
    }
  }, [webhookUrl]);
  
  const saveConfig = () => {
    localStorage.setItem('chatWebhookUrl', localWebhookUrl);
    localStorage.setItem('useWebhookProxy', useProxy.toString());
    
    toast.success('Configurações salvas com sucesso!');
    setConfigOpen(false);
  };
  
  // Determinar a URL final baseada na configuração de proxy e na URL externa
  const finalWebhookUrl = webhookUrl || (useProxy 
    ? `/api/n8n/chat-assistant` 
    : localWebhookUrl);
    
  const { message, setMessage, messages, isLoading, handleSendMessage } = useChat({
    clientId,
    source: 'web',
    webhookUrl: finalWebhookUrl,
    onQuoteRequest,
    userInfo: isAuthenticated ? undefined : userInfo // Usa userInfo apenas se não estiver autenticado
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
              onClick={() => setConfigOpen(true)}
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
      
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurações do Chat</DialogTitle>
            <DialogDescription>
              Ajuste as configurações do chat para personalizar sua experiência.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="webhookUrl" className="text-right">
                Webhook URL
              </Label>
              <Input id="webhookUrl" value={localWebhookUrl} onChange={(e) => setLocalWebhookUrl(e.target.value)} className="col-span-3" />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useProxy"
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="useProxy" className="text-sm text-gray-700 flex items-center">
                <Server className="h-4 w-4 mr-1" />
                Usar proxy local (recomendado)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              O proxy local ajuda a evitar problemas de CORS e conectividade. Mantenha ativado para melhor experiência.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={saveConfig}>
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </Card>
  );
}
