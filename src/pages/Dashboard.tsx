
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-lime-50 to-white hover:shadow-xl transition-all duration-300 border-lime-200 hover:border-lime-500">
                <span className="absolute top-0 left-0 w-full h-1 bg-lime-500"></span>
                <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-lime-100/50 group-hover:bg-lime-100 transition-colors"></div>
                <CardHeader className="pb-2 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-lime-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-7 w-7 text-lime-600" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-lime-700 transition-colors">Criar Orçamento</CardTitle>
                  <CardDescription className="text-base">
                    Selecione produtos e obtenha seu orçamento personalizado
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 relative z-10">
                  <p className="text-gray-500">
                    Configure seu orçamento com facilidade, de acordo com suas necessidades específicas.
                  </p>
                  <div className="mt-4 rounded-lg overflow-hidden shadow-md">
                    <img 
                      src="/lovable-uploads/9ebb2850-3258-48aa-82a6-a586c7e2fa30.png" 
                      alt="Exemplo de orçamento" 
                      className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Button className="w-full bg-lime-600 hover:bg-lime-700 group-hover:translate-x-1 transition-transform">
                    Começar agora <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Como deseja criar seu orçamento?</DialogTitle>
                <DialogDescription>
                  Escolha o método que preferir para elaborar seu orçamento
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Link to="/criar-orcamento" className="w-full">
                  <Card className="h-full hover:border-lime-500 hover:shadow-md transition-all cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Selecionar Produtos</CardTitle>
                      <CardDescription>
                        Crie seu orçamento manualmente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Escolha você mesmo os produtos e quantidades para seu orçamento personalizado.
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/vendedor" className="w-full">
                  <Card className="h-full hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Falar com Vendedor</CardTitle>
                      <CardDescription>
                        Deixe nosso assistente ajudar você
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Converse com nosso vendedor virtual para receber recomendações e criar seu orçamento.
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
          
          <Link to="/catalogo" className="block">
            <Card className="h-full group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all duration-300 border-purple-200 hover:border-purple-500">
              <span className="absolute top-0 left-0 w-full h-1 bg-purple-500"></span>
              <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-purple-100/50 group-hover:bg-purple-100 transition-colors"></div>
              <CardHeader className="pb-2 relative z-10">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Package className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-2xl group-hover:text-purple-700 transition-colors">Ver Catálogo</CardTitle>
                <CardDescription className="text-base">
                  Explore nossa variedade de produtos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 relative z-10">
                <p className="text-gray-500">
                  Conheça todos os produtos que oferecemos, com especificações técnicas e informações detalhadas.
                </p>
                <div className="mt-4 rounded-lg overflow-hidden shadow-md">
                  <img 
                    src="/lovable-uploads/1d414f0e-f876-49aa-a541-4d4879b1ba06.png" 
                    alt="Catálogo de produtos" 
                    className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </CardContent>
              <CardFooter className="relative z-10">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 group-hover:translate-x-1 transition-transform" variant="outline">
                  Explorar produtos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
