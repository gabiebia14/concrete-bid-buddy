
import React, { useRef, useEffect, useState } from 'react';
import { VendedorMessage } from './VendedorChatMessage';
import { VendedorChatInput } from './VendedorChatInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVendedorChat } from '@/hooks/useVendedorChat';
import { MessageSquare, ArrowDown, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ChatInterfaceProps {
  title?: string;
  description?: string;
  clienteId?: string;
  telefone?: string;
}

export function VendedorChatInterface({ 
  title = "Chat com Vendedor", 
  description = "Tire suas dúvidas e solicite orçamentos",
  clienteId,
  telefone
}: ChatInterfaceProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [phoneInput, setPhoneInput] = useState(telefone || '');
  const [phoneError, setPhoneError] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const { 
    messages, 
    isLoading, 
    error, 
    sessionId,
    enviarMensagem,
    limparErro,
    iniciarChat
  } = useVendedorChat(clienteId);

  // Rolar para o final quando novas mensagens chegarem
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (error) limparErro();
    
    // Verificar se temos telefone
    if (!phoneInput.trim() && !telefone) {
      setPhoneError('Por favor, informe seu telefone para iniciar o chat');
      return;
    }
    
    // Limpar qualquer erro de telefone
    setPhoneError('');
    
    console.log('Enviando mensagem:', message, 'Telefone:', phoneInput || telefone);
    setIsSending(true);
    
    try {
      // Enviar mensagem usando o telefone fornecido
      await enviarMensagem(message, 'cliente', phoneInput || telefone);
      
      // Indicador visual de que a mensagem foi enviada
      toast({
        title: "Mensagem enviada",
        description: "Aguardando resposta do vendedor...",
        duration: 2000,
      });
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar sua mensagem. Tente novamente.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleStartChat = async () => {
    if (!phoneInput.trim()) {
      setPhoneError('Por favor, informe seu telefone para iniciar o chat');
      return;
    }
    
    // Validar formato do telefone (básico)
    if (!/^\d{10,11}$/.test(phoneInput.replace(/\D/g, ''))) {
      setPhoneError('Por favor, informe um telefone válido com DDD');
      return;
    }
    
    setPhoneError('');
    console.log('Iniciando chat com telefone:', phoneInput);
    
    try {
      setIsSending(true);
      await iniciarChat(phoneInput);
      
      toast({
        title: "Chat iniciado",
        description: "Agora você pode conversar com nosso vendedor."
      });
    } catch (err) {
      console.error('Erro ao iniciar chat:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao iniciar chat',
        description: 'Não foi possível iniciar o chat. Tente novamente.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-muted-foreground">
              {(telefone || phoneInput || sessionId) 
                ? "Envie uma mensagem para iniciar a conversa com nosso vendedor"
                : "Informe seu telefone para iniciar o chat com nosso vendedor"}
            </p>
          </div>
        </div>
      );
    }

    return messages.map((message) => (
      <VendedorMessage key={message.id || `temp-${message.created_at}`} message={message} />
    ));
  };

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden border-lime-200">
      <CardHeader className="pb-3 pt-6 bg-gradient-to-r from-lime-50 to-white border-b border-lime-100">
        <CardTitle className="text-lime-700">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-6 px-2 text-xs hover:bg-red-100" 
              onClick={limparErro}
            >
              Limpar
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden flex flex-col">
        {/* Formulário de telefone caso não tenha sessão nem telefone */}
        {!sessionId && !telefone && (
          <div className="p-4 border-b">
            <div className="space-y-2">
              <div className="text-sm font-medium">Seu telefone com DDD</div>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Ex: 11999999999"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button 
                  onClick={handleStartChat} 
                  disabled={isLoading || isSending || !phoneInput.trim()}
                  className="bg-lime-600 hover:bg-lime-700"
                >
                  {(isLoading || isSending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Iniciar
                </Button>
              </div>
              {phoneError && (
                <div className="text-destructive text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {phoneError}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div 
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-2 space-y-4 relative"
        >
          {renderMessages()}
          
          {/* Indicador de carregamento */}
          {(isLoading || isSending) && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-lime-600" />
            </div>
          )}
          
          {/* Botão para rolar para o final */}
          {messages.length > 5 && (
            <Button
              size="sm"
              variant="outline"
              className="absolute bottom-4 right-4 rounded-full p-2 bg-white border-lime-200 text-lime-700 hover:bg-lime-50"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <VendedorChatInput
          onSendMessage={handleSendMessage}
          isDisabled={isLoading || isSending || (!sessionId && !telefone && !phoneInput)}
        />
      </CardContent>
    </Card>
  );
}
