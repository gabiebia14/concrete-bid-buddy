
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
  
  // Verificar se temos informações do usuário salvas
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('chatUserInfo');
    if (savedUserInfo) {
      try {
        const parsedInfo = JSON.parse(savedUserInfo);
        setUserInfo(parsedInfo);
      } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
      }
    } else if (!clientId) {
      // Se não temos informações do usuário e não é um cliente logado, mostrar diálogo
      setUserInfoDialogOpen(true);
    }
  }, [clientId]);
  
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
  
  const saveUserInfo = () => {
    localStorage.setItem('chatUserInfo', JSON.stringify(userInfo));
    
    // Verificar se temos informações básicas
    if (!userInfo.name.trim()) {
      toast.error('Por favor, informe pelo menos seu nome para continuar.');
      return;
    }
    
    toast.success('Informações salvas com sucesso!');
    setUserInfoDialogOpen(false);
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
    userInfo: clientId ? undefined : userInfo
  });

  return (
    <Card className="h-full flex flex-col">
      <ChatHeader 
        title={title}
        description={description}
        actions={
          <div className="flex items-center space-x-1">
            {!clientId && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setUserInfoDialogOpen(true)}
                title="Suas informações"
              >
                <User className="h-4 w-4" />
              </Button>
            )}
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
      
      <Dialog open={userInfoDialogOpen} onOpenChange={setUserInfoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Suas Informações</DialogTitle>
            <DialogDescription>
              Para melhor atendimento, informe seus dados de contato.
              Isso nos ajudará a personalizar seu atendimento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userName" className="text-right">
                Nome *
              </Label>
              <Input 
                id="userName" 
                value={userInfo.name} 
                onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} 
                className="col-span-3" 
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userEmail" className="text-right">
                Email
              </Label>
              <Input 
                id="userEmail" 
                type="email"
                value={userInfo.email} 
                onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userPhone" className="text-right">
                Telefone
              </Label>
              <Input 
                id="userPhone" 
                value={userInfo.phone} 
                onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})} 
                className="col-span-3" 
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              * Campos obrigatórios
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={saveUserInfo}>
              Salvar Informações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </Card>
  );
}
