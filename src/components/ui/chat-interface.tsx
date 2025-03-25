import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { Layout } from '@/components/layout/Layout';
import { Bot, MessageSquare, CheckCircle2, ClipboardList, MessageCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  clientId?: string;
  onQuoteRequest?: (quoteData: any) => void;
}

export function ChatInterface({ clientId, onQuoteRequest }: ChatInterfaceProps) {
  const navigate = useNavigate();
  const [enableBailey, setEnableBailey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  
  useEffect(() => {
    // Carregar URL do webhook do localStorage se existir
    const savedUrl = localStorage.getItem('chatWebhookUrl');
    if (savedUrl) {
      setWebhookUrl(savedUrl);
    } else {
      // Define a URL padrão correta
      const defaultUrl = '/api/n8n/chat-assistant';
      setWebhookUrl(defaultUrl);
      localStorage.setItem('chatWebhookUrl', defaultUrl);
    }
  }, []);
  
  const { 
    message, 
    setMessage, 
    messages, 
    isLoading, 
    handleSendMessage,
    quoteData,
    quoteId
  } = useChat({ clientId, onQuoteRequest, source: 'web', webhookUrl });

  const [showQuoteSummary, setShowQuoteSummary] = useState(false);

  // Exibir resumo do orçamento quando disponível
  useEffect(() => {
    if (quoteData && quoteId) {
      setShowQuoteSummary(true);
    }
  }, [quoteData, quoteId]);

  const handleViewQuote = () => {
    if (quoteId) {
      navigate(`/quotes/${quoteId}`);
    }
  };
  
  const saveWebhookUrl = () => {
    localStorage.setItem('chatWebhookUrl', webhookUrl);
    toast.success('URL do webhook salvo com sucesso!');
    setShowSettings(false);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Vendas Online</h1>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-muted-foreground">Tire suas dúvidas e solicite orçamentos a qualquer hora do dia</p>
        </div>
        
        {showSettings && (
          <Card className="mb-6 border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Configurações do Chat</CardTitle>
              <CardDescription>Configure os endpoints do assistente de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="webhook-url">URL do Webhook N8N</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook-url"
                      placeholder="https://seu-n8n.dominio.com/webhook-test/chat-assistant"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <Button onClick={saveWebhookUrl}>Salvar</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se nenhum URL for fornecido, o chat usará o proxy local ou a função Edge do Supabase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Vendedor Online IPT Teixeira
                </CardTitle>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="bailey-mode" className="text-sm cursor-pointer">
                    Modo WhatsApp
                  </Label>
                  <Switch
                    id="bailey-mode"
                    checked={enableBailey}
                    onCheckedChange={setEnableBailey}
                  />
                </div>
              </div>
              <CardDescription>
                {enableBailey 
                  ? "Conecte seu WhatsApp para receber mensagens diretamente no aplicativo"
                  : "Atendimento 24h para orçamentos rápidos"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[600px] overflow-hidden">
                {messages.length === 0 && !enableBailey ? (
                  <div className="flex-1 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md">
                      <Bot className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Como posso ajudar?</h3>
                      <p className="text-muted-foreground text-sm">
                        Envie uma mensagem para iniciar seu atendimento. Informe os produtos desejados 
                        e solicite um orçamento sem precisar aguardar o horário comercial.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ChatMessages 
                    messages={messages} 
                    isTyping={isLoading} 
                    showBailey={enableBailey}
                  />
                )}
                <ChatInput 
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
            
            {showQuoteSummary && quoteData && (
              <CardFooter className="border-t p-4 bg-green-50">
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-green-800">Orçamento Registrado com Sucesso!</h3>
                  </div>
                  
                  <div className="bg-white rounded-md p-3 border border-green-200 mb-3">
                    <h4 className="font-medium text-sm mb-2">Resumo do Pedido:</h4>
                    <ul className="text-sm space-y-1">
                      {quoteData.produtos?.map((produto, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{produto.quantidade}x {produto.nome}</span>
                          <span className="text-gray-500">{produto.especificacoes}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {quoteData.entrega?.local && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-sm">
                        <p><strong>Local de entrega:</strong> {quoteData.entrega.local}</p>
                        {quoteData.entrega.prazo && (
                          <p><strong>Prazo:</strong> {quoteData.entrega.prazo}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleViewQuote}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Ver Detalhes do Orçamento
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Solicite seu orçamento
              </CardTitle>
              <CardDescription>
                Perguntas frequentes
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
              
              {enableBailey && (
                <div className="bg-primary/10 p-4 rounded-md mt-6 flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Modo WhatsApp</h4>
                    <p className="text-xs text-muted-foreground">
                      Conecte sua conta do WhatsApp para receber e responder mensagens diretamente pelo aplicativo sem precisar de integração com Facebook.
                    </p>
                  </div>
                </div>
              )}
              
              {!enableBailey && (
                <div className="bg-primary/10 p-4 rounded-md mt-6">
                  <h4 className="text-sm font-medium mb-2">Sobre o atendimento</h4>
                  <p className="text-xs text-muted-foreground">
                    Nosso vendedor online está disponível 24 horas por dia para agilizar o processo de orçamento. Informe os produtos, quantidades e local de entrega para receber um orçamento personalizado da nossa equipe comercial o mais rápido possível.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
