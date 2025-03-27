
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function ChatAssistant() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Assistente Virtual</h1>
          <p className="text-muted-foreground">
            Converse com nosso assistente para obter informações e orçamentos
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Como posso ajudar?</h3>
                    <p className="text-sm text-muted-foreground">
                      Nosso assistente virtual está pronto para atender suas necessidades.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <SuggestionButton 
                      text="Conhecer produtos" 
                      description="Quais produtos vocês oferecem?"
                    />
                    <SuggestionButton 
                      text="Solicitar orçamento" 
                      description="Preciso de um orçamento para blocos de concreto"
                    />
                    <SuggestionButton 
                      text="Prazo de entrega" 
                      description="Qual o prazo para entrega na minha região?"
                    />
                    <SuggestionButton 
                      text="Falar com atendente" 
                      description="Gostaria de falar com um atendente humano"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Componente para botões de sugestão
interface SuggestionButtonProps {
  text: string;
  description: string;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ text, description }) => {
  return (
    <Button 
      variant="outline" 
      className="w-full justify-start h-auto py-3 px-4 text-left"
      onClick={() => {
        // Aqui poderíamos integrar com o useChat, mas é mais simples apenas
        // permitir que o usuário copie e cole a sugestão
        navigator.clipboard.writeText(description)
          .then(() => {
            console.log('Texto copiado para a área de transferência');
          })
          .catch(err => {
            console.error('Erro ao copiar texto: ', err);
          });
      }}
    >
      <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
      <span>{text}</span>
    </Button>
  );
};
