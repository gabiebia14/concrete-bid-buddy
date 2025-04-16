
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function Vendedor() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSendMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    console.log("Enviando mensagem para webhook:", message);

    try {
      const { data, error } = await supabase.functions.invoke('vendedor-openai-assistant', {
        body: {
          message,
          user_email: user?.email || null,
          user_name: user?.full_name || null
        }
      });

      if (error) {
        console.error("Erro na Edge Function:", error);
        toast.error("Erro ao processar mensagem. Tente novamente.");
        return "Desculpe, ocorreu um erro ao processar sua mensagem.";
      }

      console.log("Dados recebidos do webhook:", data);
      return data.response || "Desculpe, não consegui processar sua mensagem.";
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao processar mensagem. Tente novamente.");
      return "Desculpe, ocorreu um erro ao processar sua mensagem.";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Assistente de Vendas IPT Teixeira</h1>
          
          <ChatInterface 
            title="Assistente de Vendas" 
            description="Nosso assistente especializado está pronto para ajudar com seu orçamento"
            onSendMessage={handleSendMessage}
            showReset={true}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
}
