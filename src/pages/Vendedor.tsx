
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';

export default function Vendedor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleEnviarParaVendedor = () => {
    toast.success("Contato encaminhado para um vendedor. Em breve entraremos em contato!");
    // Dar um tempo para o usuário ver a mensagem antes de redirecionar
    setTimeout(() => {
      navigate('/historico-orcamentos');
    }, 2000);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Fale com um Vendedor</h1>
          <p className="text-muted-foreground">
            Converse com nossa equipe especializada para tirar dúvidas e obter recomendações personalizadas
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Chat ocupa agora toda a largura */}
          <div>
            <ChatInterface 
              title="Conversa com Vendedor Especializado" 
              description="Nossos vendedores estão disponíveis para auxiliar em sua compra"
              initialMessages={[
                {
                  content: `Olá${user ? ', ' + user.email : ''}! Sou um assistente virtual da IPT Teixeira. Nossos vendedores estão ocupados no momento, mas eu posso te ajudar com informações sobre nossos produtos e serviços. Se precisar de atendimento especializado, clique no botão "Solicitar Contato" e um vendedor entrará em contato em breve.`,
                  role: "assistant",
                  timestamp: new Date()
                }
              ]}
              onSendMessage={async (message) => {
                // Após algumas mensagens, sugerir contato direto
                if (!showConfirmation && Math.random() > 0.5) {
                  setShowConfirmation(true);
                  return "Para atendimento mais personalizado, recomendo solicitar contato direto com um vendedor. Posso fazer isso para você agora?";
                }
                
                // Resposta padrão
                return "Compreendo sua necessidade. Um vendedor especializado poderá te oferecer mais detalhes e condições especiais. Clique no botão 'Solicitar Contato' quando estiver pronto.";
              }}
            />
            
            {/* Botão para solicitar contato */}
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleEnviarParaVendedor}
                className="bg-lime-600 hover:bg-lime-700 px-6 py-2 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Solicitar Contato com Vendedor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
