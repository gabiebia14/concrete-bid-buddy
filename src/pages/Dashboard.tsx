
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { FileText, ShoppingBag, Package, FileBarChart, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.email || 'Cliente'}! Gerencie seus orçamentos e visualize nossos produtos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-lime-500 border-t-4">
            <CardContent className="pt-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Orçamentos Ativos</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-lime-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-lime-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-500 border-t-4">
            <CardContent className="pt-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Últimos Pedidos</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-500 border-t-4">
            <CardContent className="pt-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Produtos Catalogados</p>
                  <h3 className="text-2xl font-bold">42</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-500 border-t-4">
            <CardContent className="pt-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Análises</p>
                  <h3 className="text-2xl font-bold">Ver</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileBarChart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Principais ações disponíveis para você
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/criar-orcamento" className="block">
                  <Button className="w-full justify-between bg-lime-600 hover:bg-lime-700">
                    Criar Novo Orçamento
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/catalogo" className="block">
                  <Button className="w-full justify-between" variant="outline">
                    Explorar Catálogo de Produtos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/historico" className="block">
                  <Button className="w-full justify-between" variant="outline">
                    Ver Histórico de Orçamentos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/chat-assistant" className="block">
                  <Button className="w-full justify-between" variant="outline">
                    Falar com Assistente Virtual
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Categorias de Produtos</CardTitle>
              <CardDescription>
                Conheça nossos produtos por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link to="/catalogo?category=Blocos">
                  <Badge className="px-3 py-1 text-sm bg-lime-600 hover:bg-lime-700">Blocos</Badge>
                </Link>
                <Link to="/catalogo?category=Postes">
                  <Badge className="px-3 py-1 text-sm">Postes</Badge>
                </Link>
                <Link to="/catalogo?category=Tubos">
                  <Badge className="px-3 py-1 text-sm">Tubos</Badge>
                </Link>
                <Link to="/catalogo?category=Pavimentação">
                  <Badge className="px-3 py-1 text-sm">Pavimentação</Badge>
                </Link>
                <Link to="/catalogo?category=Lajes">
                  <Badge className="px-3 py-1 text-sm">Lajes</Badge>
                </Link>
                <Link to="/catalogo?category=Concreto">
                  <Badge className="px-3 py-1 text-sm">Concreto</Badge>
                </Link>
                <Link to="/catalogo">
                  <Badge className="px-3 py-1 text-sm" variant="outline">Ver todos</Badge>
                </Link>
              </div>
              
              <div className="mt-5 border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted/30">
                  <h3 className="font-medium">Produtos em Destaque</h3>
                </div>
                <div className="divide-y">
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bloco Estrutural 14x19x39</p>
                      <p className="text-sm text-muted-foreground">Categoria: Blocos</p>
                    </div>
                    <Link to="/catalogo">
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Poste Circular 8m</p>
                      <p className="text-sm text-muted-foreground">Categoria: Postes</p>
                    </div>
                    <Link to="/catalogo">
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Piso Intertravado 20x10</p>
                      <p className="text-sm text-muted-foreground">Categoria: Pavimentação</p>
                    </div>
                    <Link to="/catalogo">
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
