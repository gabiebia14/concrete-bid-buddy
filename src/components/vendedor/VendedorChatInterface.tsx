
import React, { useRef, useEffect, useState } from 'react';
import { VendedorMessage } from './VendedorChatMessage';
import { VendedorChatInput } from './VendedorChatInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVendedorChat } from '@/hooks/useVendedorChat';
import { MessageSquare, ArrowDown, AlertCircle } from 'lucide-react';
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

  const handleSendMessage = (message: string) => {
    if (error) limparErro();
    
    // Verificar se temos telefone
    if (!phoneInput.trim() && !telefone) {
      setPhoneError('Por favor, informe seu telefone para iniciar o chat');
      return;
    }
    
    // Limpar qualquer erro de telefone
    setPhoneError('');
    
    console.log('Enviando mensagem:', message, 'Telefone:', phoneInput || telefone);
    
    // Enviar mensagem usando o telefone fornecido
    enviarMensagem(message, 'cliente', phoneInput || telefone);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleStartChat = () => {
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
    iniciarChat(phoneInput);
    
    toast({
      title: "Chat iniciado",
      description: "Agora você pode conversar com nosso vendedor."
    });
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
      <VendedorMessage key={message.id} message={message} />
    ));
  };

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden border-lime-200">
      <CardHeader className="pb-3 pt-6 bg-gradient-to-r from-lime-50 to-white border-b border-lime-100">
        <CardTitle className="text-lime-700">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
                  disabled={isLoading || !phoneInput.trim()}
                  className="bg-lime-600 hover:bg-lime-700"
                >
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
          isDisabled={isLoading || (!sessionId && !telefone && !phoneInput)}
        />
      </CardContent>
    </Card>
  );
}
