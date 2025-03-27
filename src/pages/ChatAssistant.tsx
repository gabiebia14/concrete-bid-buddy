
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase'; 
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export default function ChatAssistant() {
  const { toast } = useToast();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAgentConfig = async () => {
      try {
        setIsLoading(true);
        
        // Verificar se existe configuração do agente
        const { data, error } = await supabase
          .from('agent_configs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Erro ao verificar configuração do agente:', error);
          setIsConfigured(false);
        } else {
          setIsConfigured(data && data.length > 0);
        }
      } catch (error) {
        console.error('Erro ao verificar configuração:', error);
        setIsConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAgentConfig();
  }, []);

  const setupAgent = async () => {
    try {
      setIsLoading(true);
      
      // Chamar a função Edge para configurar o agente
      const { error } = await supabase.functions.invoke('setup-agent-config');
      
      if (error) {
        console.error('Erro ao configurar agente:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao configurar assistente',
          description: 'Não foi possível configurar o assistente virtual. Tente novamente mais tarde.'
        });
        return;
      }
      
      toast({
        title: 'Assistente configurado',
        description: 'O assistente virtual foi configurado com sucesso!'
      });
      
      setIsConfigured(true);
    } catch (error) {
      console.error('Erro ao configurar agente:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao configurar assistente',
        description: 'Ocorreu um erro ao tentar configurar o assistente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 h-[calc(100vh-8rem)]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-lime-500 rounded-full border-t-transparent"></div>
          </div>
        ) : !isConfigured ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Assistente Virtual</CardTitle>
              <CardDescription>
                O assistente virtual precisa ser configurado antes de ser utilizado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={setupAgent} 
                className="w-full bg-lime-600 hover:bg-lime-700"
                disabled={isLoading}
              >
                Configurar Assistente
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col">
            <ChatInterface 
              title="Assistente Virtual IPT Teixeira" 
              description="Tire suas dúvidas sobre nossos produtos e solicite orçamentos"
              showReset={true}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
