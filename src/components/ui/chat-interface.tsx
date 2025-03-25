import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';

interface ChatInterfaceProps {
  clientId?: string;
  title?: string;
  description?: string;
  showBailey?: boolean;
}

export function ChatInterface({ clientId, title = "Assistente IPT Teixeira", description = "Assistente de Vendas", showBailey = false }: ChatInterfaceProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  
  // Carregar URL do webhook do localStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem('chatWebhookUrl');
    if (savedUrl) {
      setWebhookUrl(savedUrl);
    } else {
      // Define a URL padrão correta
      const defaultUrl = 'https://gbservin8n.sevirenostrinta.com.br/webhook-test/chat-assistant';
      setWebhookUrl(defaultUrl);
      localStorage.setItem('chatWebhookUrl', defaultUrl);
    }
  }, []);
  
  const saveConfig = () => {
    localStorage.setItem('chatWebhookUrl', webhookUrl);
    setConfigOpen(false);
  };
  
  const { message, setMessage, messages, isLoading, handleSendMessage } = useChat({
    clientId,
    source: 'web',
    webhookUrl
  });

  return (
    <Card className="h-full flex flex-col">
      <ChatHeader />
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
              <Input id="webhookUrl" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="col-span-3" />
            </div>
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
