
import { Layout } from '@/components/layout/Layout';
import { VendedorChatInterface } from '@/components/vendedor/VendedorChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Vendedor() {
  const [userPhone, setUserPhone] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  // Verificar usuário atual quando o componente é montado
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Tentar pegar o telefone dos metadados, se disponível
        const phone = user.user_metadata?.phone || '';
        setUserPhone(phone);
      }
    }
    
    getUser();
  }, []);
  
  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 h-[calc(100vh-8rem)]">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <div className="w-full md:w-2/3 h-full">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-lime-600">Chat com Vendedor</h1>
                <p className="text-muted-foreground">
                  Tire dúvidas e solicite orçamentos diretamente com nossa equipe
                </p>
              </div>
              <Button variant="outline" asChild className="border-lime-600 text-lime-600 hover:bg-lime-50 hover:text-lime-700">
                <Link to="/criar-orcamento">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Orçamento
                </Link>
              </Button>
            </div>
            <div className="h-[calc(100%-4rem)]">
              <VendedorChatInterface 
                clienteId={userId}
                telefone={userPhone}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <Card className="border-t-4 border-t-lime-600">
              <CardHeader>
                <CardTitle>Guia Rápido</CardTitle>
                <CardDescription>Como usar o chat com vendedor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <MessageSquare className="h-8 w-8 text-lime-600" />
                  <div>
                    <h3 className="font-medium">Tire suas dúvidas</h3>
                    <p className="text-sm text-muted-foreground">
                      Questione sobre especificações, preços, prazos de entrega e condições.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Package className="h-8 w-8 text-lime-600" />
                  <div>
                    <h3 className="font-medium">Solicite orçamentos</h3>
                    <p className="text-sm text-muted-foreground">
                      Informe o tipo de produto, quantidade e detalhes específicos para receber um orçamento.
                    </p>
                  </div>
                </div>
                
                <div className="rounded-lg bg-lime-50 p-3 mt-6 border border-lime-100">
                  <h3 className="font-medium mb-2 text-lime-800">Dicas para orçamentos mais rápidos:</h3>
                  <ul className="text-sm space-y-2 list-disc pl-5 text-lime-700">
                    <li>Especifique a quantidade de produtos</li>
                    <li>Informe o local de entrega</li>
                    <li>Mencione o prazo desejado</li>
                    <li>Detalhe as especificações técnicas, se possível</li>
                  </ul>
                </div>
                
                <Button className="w-full bg-lime-600 hover:bg-lime-700 mt-4">
                  <Link to="/catalogo" className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    Ver Catálogo de Produtos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
