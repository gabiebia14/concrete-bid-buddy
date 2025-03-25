import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '@/lib/types';
import { MessageItem } from './ChatMessage';
import { Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  showBailey?: boolean;
}

export function ChatMessages({ messages, isTyping = false, showBailey = false }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [baileyStatus, setBaileyStatus] = useState<string>('disconnected');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (showBailey) {
      checkBaileyStatus();
      const interval = setInterval(checkBaileyStatus, 10000); // Verificar a cada 10 segundos
      return () => clearInterval(interval);
    }
  }, [showBailey]);

  const checkBaileyStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("baileys-whatsapp/status");
      if (error) throw error;
      
      setBaileyStatus(data.status);
      
      if (data.status === 'waiting_for_qr') {
        fetchQrCode();
      } else if (data.status === 'connected') {
        setQrCode(null);
      }
    } catch (error) {
      console.error("Erro ao verificar status do Baileys:", error);
    }
  };

  const fetchQrCode = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("baileys-whatsapp/qr");
      if (error) throw error;
      
      if (data.qr) {
        setQrCode(data.qr);
      }
    } catch (error) {
      console.error("Erro ao buscar QR Code:", error);
    }
  };

  const startBaileyService = async () => {
    try {
      setIsLoading(true);
      await supabase.functions.invoke("baileys-whatsapp/start", {
        method: 'POST'
      });
      await checkBaileyStatus();
    } catch (error) {
      console.error("Erro ao iniciar serviço Baileys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {showBailey && baileyStatus !== 'connected' && (
        <Card className="p-4 mb-4 bg-orange-50 border-orange-200">
          <div className="flex flex-col items-center space-y-3">
            <h3 className="text-lg font-medium text-orange-700">
              {baileyStatus === 'waiting_for_qr' 
                ? 'Escaneie o QR Code para conectar o WhatsApp' 
                : 'WhatsApp não conectado'}
            </h3>
            
            {qrCode ? (
              <div className="bg-white p-3 rounded-lg">
                <img 
                  src={`data:image/png;base64,${qrCode}`} 
                  alt="QR Code WhatsApp" 
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <QrCode className="w-16 h-16 text-orange-400" />
            )}
            
            <p className="text-sm text-orange-600 text-center">
              {baileyStatus === 'waiting_for_qr'
                ? 'Abra seu WhatsApp, vá em Configurações > Aparelhos > Parear dispositivo e escaneie o QR code acima'
                : 'É necessário conectar com WhatsApp para receber mensagens diretamente no aplicativo'}
            </p>
            
            <Button 
              onClick={startBaileyService} 
              disabled={isLoading} 
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                baileyStatus === 'waiting_for_qr' ? 'Gerar novo QR Code' : 'Conectar WhatsApp'
              )}
            </Button>
          </div>
        </Card>
      )}

      {showBailey && baileyStatus === 'connected' && (
        <Card className="p-3 mb-4 bg-green-50 border-green-200">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <p className="text-sm text-green-700">
              WhatsApp conectado e pronto para receber mensagens
            </p>
          </div>
        </Card>
      )}
      
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      
      {isTyping && (
        <div className="flex items-start gap-2">
          <div className="h-8 w-8 mt-0.5 flex items-center justify-center bg-primary/10 text-primary rounded-full">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div className="bg-muted px-4 py-2 rounded-lg">
            <p className="text-sm">Digitando<span className="animate-pulse">...</span></p>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
