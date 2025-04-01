
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Painel do Cliente</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.email || 'Cliente'}! O que você deseja fazer hoje?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card className="bg-white border-lime-200 hover:border-lime-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-lime-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-lime-600" />
              </div>
              <CardTitle>Criar Orçamento</CardTitle>
              <CardDescription>
                Selecione produtos, quantidades e crie seu orçamento personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500">
                Nosso sistema permite criar orçamentos detalhados com todos os produtos de que você precisa.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/criar-orcamento" className="w-full">
                <Button className="w-full bg-lime-600 hover:bg-lime-700">
                  Criar Orçamento <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="bg-white border-blue-200 hover:border-blue-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Falar com Vendedor</CardTitle>
              <CardDescription>
                Converse com um de nossos vendedores especializados
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500">
                Tire dúvidas, peça recomendações e obtenha ajuda personalizada com nosso vendedor virtual.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/vendedor" className="w-full">
                <Button className="w-full" variant="outline">
                  Iniciar Conversa <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="bg-white border-purple-200 hover:border-purple-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Ver Catálogo</CardTitle>
              <CardDescription>
                Explore nossa variedade de produtos disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500">
                Conheça todos os produtos que oferecemos para atender às suas necessidades.
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/catalogo" className="w-full">
                <Button className="w-full" variant="outline">
                  Ver Produtos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Meus Orçamentos</CardTitle>
              <CardDescription>
                Acesse e acompanhe seus orçamentos anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Sem orçamentos recentes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Você ainda não possui orçamentos. Que tal criar um agora?
                    </p>
                    <Link to="/criar-orcamento">
                      <Button variant="outline" size="sm">
                        Criar Primeiro Orçamento
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 flex justify-between">
              <p className="text-sm text-muted-foreground">
                Visualize todo o histórico de orçamentos
              </p>
              <Link to="/historico-orcamentos">
                <Button variant="ghost" size="sm">
                  Ver Histórico <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
