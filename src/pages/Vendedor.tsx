
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClienteFormData } from '@/lib/vendedorTypes';
import { toast } from 'sonner';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function Vendedor() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [clienteData, setClienteData] = useState<ClienteFormData>({
    tipoPessoa: 'fisica',
    nome: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
  });

  useEffect(() => {
    // Limpar o formulário ao montar o componente
    setClienteData({
      tipoPessoa: 'fisica',
      nome: '',
      cpfCnpj: '',
      email: '',
      telefone: '',
    });
  }, []);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChatInterface 
              title="Conversa com Vendedor Especializado" 
              description="Nossos vendedores estão disponíveis para auxiliar em sua compra"
              initialMessages={[
                {
                  content: "Olá! Sou um assistente virtual da IPT Teixeira. Nossos vendedores estão ocupados no momento, mas eu posso te ajudar com informações sobre nossos produtos e serviços. Para um atendimento personalizado, por favor deixe seus dados de contato e um vendedor entrará em contato em breve.",
                  role: "assistant",
                  timestamp: new Date()
                }
              ]}
              onSendMessage={async (message) => {
                // Após algumas mensagens, sugerir deixar contato
                if (!showForm && Math.random() > 0.5) {
                  setShowForm(true);
                  return "Para que um vendedor possa entrar em contato e oferecer um atendimento mais personalizado, que tal deixar seus dados de contato? Assim podemos dar continuidade ao seu orçamento com todas as suas necessidades.";
                }
                
                // Resposta padrão
                return "Compreendo sua necessidade. Um vendedor especializado poderá te oferecer mais detalhes e condições especiais. Deixe seus dados para que possamos entrar em contato.";
              }}
            />
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-lime-600" />
                  Seus Dados para Contato
                </CardTitle>
                <CardDescription>
                  Preencha suas informações para que um vendedor entre em contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Pessoa</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={clienteData.tipoPessoa === 'fisica'}
                          onChange={() => setClienteData({...clienteData, tipoPessoa: 'fisica'})}
                          className="h-4 w-4 text-lime-600"
                        />
                        <span>Física</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={clienteData.tipoPessoa === 'juridica'}
                          onChange={() => setClienteData({...clienteData, tipoPessoa: 'juridica'})}
                          className="h-4 w-4 text-lime-600"
                        />
                        <span>Jurídica</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="nome" className="text-sm font-medium">Nome {clienteData.tipoPessoa === 'juridica' ? 'da Empresa' : 'Completo'}</label>
                    <input
                      id="nome"
                      type="text"
                      value={clienteData.nome}
                      onChange={(e) => setClienteData({...clienteData, nome: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder={clienteData.tipoPessoa === 'juridica' ? 'Nome da empresa' : 'Seu nome completo'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="cpfCnpj" className="text-sm font-medium">{clienteData.tipoPessoa === 'juridica' ? 'CNPJ' : 'CPF'}</label>
                    <input
                      id="cpfCnpj"
                      type="text"
                      value={clienteData.cpfCnpj}
                      onChange={(e) => setClienteData({...clienteData, cpfCnpj: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder={clienteData.tipoPessoa === 'juridica' ? '00.000.000/0000-00' : '000.000.000-00'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">E-mail</label>
                    <input
                      id="email"
                      type="email"
                      value={clienteData.email}
                      onChange={(e) => setClienteData({...clienteData, email: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="telefone" className="text-sm font-medium">Telefone</label>
                    <input
                      id="telefone"
                      type="tel"
                      value={clienteData.telefone}
                      onChange={(e) => setClienteData({...clienteData, telefone: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  
                  <Button 
                    type="button"
                    className="w-full bg-lime-600 hover:bg-lime-700 flex items-center gap-2"
                    onClick={handleEnviarParaVendedor}
                  >
                    <Send className="h-4 w-4" />
                    Solicitar Contato
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
