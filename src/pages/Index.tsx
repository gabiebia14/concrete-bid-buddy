
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, FileText, Package, History, Users, BarChart, MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/ui/chat-interface";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

const Index = () => {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">IPT Teixeira</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sistema inteligente de orçamentos e gerenciamento para produtos de concreto
            </p>
            
            {/* Botão para abrir o assistente em dispositivos móveis */}
            <div className="mt-6 md:hidden">
              <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                <DrawerTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Falar com Assistente
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[85vh]">
                  <div className="px-4 py-6 h-full">
                    <ChatInterface />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
            
            {/* Botão para abrir o assistente em desktop */}
            <div className="mt-6 hidden md:block">
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Falar com Assistente
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="end" sideOffset={10}>
                  <div className="h-[500px]">
                    <ChatInterface />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                      <FileText size={24} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Criar Orçamento</h3>
                    <p className="text-muted-foreground mb-4">
                      Solicite um orçamento personalizado para seus projetos de construção.
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Button asChild className="w-full justify-between">
                      <Link to="/criar-orcamento">
                        Iniciar <ArrowRight size={16} className="ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 mb-4">
                      <History size={24} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
                    <p className="text-muted-foreground mb-4">
                      Acesse o painel de controle com todas as suas métricas e dados.
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Button asChild variant="outline" className="w-full justify-between">
                      <Link to="/dashboard">
                        Visualizar <ArrowRight size={16} className="ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500 mb-4">
                      <Package size={24} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Catálogo</h3>
                    <p className="text-muted-foreground mb-4">
                      Explore nossa linha completa de produtos de concreto.
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Button asChild variant="outline" className="w-full justify-between">
                      <Link to="/catalogo">
                        Explorar <ArrowRight size={16} className="ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="border rounded-lg p-8 text-center bg-muted/40">
            <h2 className="text-2xl font-bold mb-4">Área do Gerente</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Acesse o painel administrativo para gerenciar orçamentos, clientes e acompanhar métricas de vendas.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild variant="default">
                <Link to="/manager/dashboard" className="flex items-center">
                  <BarChart size={18} className="mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/manager/quotes" className="flex items-center">
                  <FileText size={18} className="mr-2" />
                  Orçamentos
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/manager/clients" className="flex items-center">
                  <Users size={18} className="mr-2" />
                  Clientes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
