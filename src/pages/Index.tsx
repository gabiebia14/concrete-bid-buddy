import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { FileText, ArrowRight, MessageSquare, Calculator, Clock, PieChart, CheckSquare, Truck, Phone, Mail, MapPin, ArrowDown, Award, Shield } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const products = [
    {
      title: "Postes",
      image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
      description: "Postes de concreto para diversas aplicações"
    },
    {
      title: "Blocos e Meio Blocos",
      image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
      description: "Blocos estruturais de concreto"
    },
    {
      title: "Tubos e Aduelas",
      image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
      description: "Tubos de concreto para infraestrutura"
    },
    {
      title: "Pavimentos e Mini Guias",
      image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
      description: "Soluções para pavimentação"
    }
  ];

  const news = [
    {
      date: "01 AGO",
      year: "2023",
      title: "Colaboradores Administrativos em Agenda de FT"
    },
    {
      date: "31 JUL",
      year: "2023",
      title: "Conferência dos pré-V-home de 8.5 - 35 de julho/2023 da IPT Teixeira"
    },
    {
      date: "09 JUL",
      year: "2023",
      title: "Conferência dos pré-V-home de 8.5 - 35 de julho/2023 da IPT Teixeira"
    }
  ];

  return (
    <Layout hideHeader={false} hideFooter={false} hideSidebar>
      {/* Hero Section */}
      <div 
        className="min-h-screen bg-gradient-to-b from-gray-200 to-gray-300 bg-opacity-90"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E"),
          linear-gradient(to bottom, #e6e9f0 0%, #eef1f5 100%)`,
          backgroundBlendMode: 'overlay',
        }}
      >
        {/* Top Banner with Certifications */}
        <div className="bg-lime-600 text-white py-1">
          <div className="container mx-auto px-4 flex justify-end items-center text-xs">
            <div className="flex items-center mr-4">
              <Award size={14} className="mr-1" />
              <span>ISO 13001</span>
            </div>
            <div className="flex items-center">
              <Shield size={14} className="mr-1" />
              <span>ISO 9001</span>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 min-h-[calc(100vh-10rem)]">
            {/* Left Column - Hero Content */}
            <div className="w-full lg:w-1/2 bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <div className="mb-8">
                <img src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" alt="IPT Teixeira Logo" className="h-32 mb-6 object-scale-down" />
                <h1 className="text-3xl font-bold mb-4 text-gray-800">
                  Produtos de concreto<br />com qualidade e resistência
                </h1>
                <div className="flex items-center text-xl text-primary font-semibold mb-4">
                  <Phone className="mr-2" size={20} />
                  <span>(17) 3827-9100</span>
                </div>
                <p className="text-lg text-muted-foreground max-w-lg mb-4">
                  A IPT Teixeira representa para nossos colaboradores e principalmente para você, cliente, o que fazemos com excelência.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary my-6">
                  <h3 className="font-semibold mb-2">Nossa Missão</h3>
                  <p className="text-sm text-muted-foreground">
                    "Atender às necessidades de nossos clientes e o mercado em geral com eficiência e transparência, para atender as necessidades do mercado."
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button onClick={() => {
                  setIsLoginMode(true);
                  setShowAuthForm(true);
                }} size="lg" className="gap-2">
                  Solicitar Orçamento
                  <ArrowRight size={18} />
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link to="/catalogo" className="gap-2">
                    Ver Produtos
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="lg">
                  <Link to="/chat-assistant" className="gap-2">
                    <MessageSquare size={18} />
                    Falar com Assistente
                  </Link>
                </Button>
              </div>

              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold mb-4">Certificações e Qualidade</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="font-medium text-green-800 mb-2">ISO 13001</h3>
                    <p className="text-sm text-muted-foreground">Certificação internacional que atesta nossos padrões de gestão ambiental</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="font-medium text-green-800 mb-2">ISO 9001</h3>
                    <p className="text-sm text-muted-foreground">Certificação internacional que atesta nossos padrões de gestão de qualidade</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Auth Form or Product Highlights */}
            <div className="w-full lg:w-1/2 max-w-xl">
              {showAuthForm ? (
                <Card className="border-t-4 border-t-primary shadow-lg py-0 my-[4px] bg-white/90 backdrop-blur-sm">
                  <AuthForm 
                    isManager={false} 
                    initialTab={isLoginMode ? "entrar" : "cadastrar"}
                  />
                  <div className="p-4 text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowAuthForm(false)}
                    >
                      Voltar
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-6 bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg">
                  <h2 className="text-2xl font-semibold text-primary border-b pb-2">Acesse Nossa Plataforma</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-primary/10 p-2 rounded-full">
                        <FileText size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Orçamentos simplificados</h3>
                        <p className="text-muted-foreground text-sm">
                          Crie e gerencie orçamentos em poucos cliques
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-primary/10 p-2 rounded-full">
                        <Calculator size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Cálculos automáticos</h3>
                        <p className="text-muted-foreground text-sm">
                          Preços calculados com base nas suas especificações
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-primary/10 p-2 rounded-full">
                        <Clock size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Histórico completo</h3>
                        <p className="text-muted-foreground text-sm">
                          Acesso ao histórico de todos seus orçamentos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-primary/10 p-2 rounded-full">
                        <PieChart size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Dashboard personalizado</h3>
                        <p className="text-muted-foreground text-sm">
                          Visualize estatísticas dos seus pedidos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => {
                        setIsLoginMode(true);
                        setShowAuthForm(true);
                      }} 
                      size="lg" 
                      className="w-full sm:w-auto"
                    >
                      Fazer Login
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        setIsLoginMode(false);
                        setShowAuthForm(true);
                      }} 
                      variant="outline" 
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Cadastrar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="text-center mt-8 animate-bounce">
            <Button variant="ghost" size="sm" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
              <ArrowDown />
              <span className="sr-only">Rolar para baixo</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Nossos Produtos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div key={index} className="group bg-white border rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="object-cover w-full h-full transition-transform group-hover:scale-105" 
                  />
                </div>
                <div className="p-5 border-t">
                  <h3 className="font-semibold text-lg mb-2 text-primary">{product.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/catalogo">Ver Detalhes</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link to="/catalogo" className="gap-2">
                Ver todos os produtos
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About and News Section with Tabs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="about" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="about" className="text-lg px-6">A Empresa</TabsTrigger>
                <TabsTrigger value="news" className="text-lg px-6">Informativos</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="about" className="bg-white p-6 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-semibold mb-4 text-primary">Sobre a IPT Teixeira</h3>
                  <p className="text-muted-foreground mb-4">
                    A empresa IPT Postes Teixeira, situada no estado de São Paulo, destaca-se como uma referência na fabricação de produtos de concreto para a construção e infraestrutura.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Desde 1994, a empresa vem desenvolvendo e aprimorando a tecnologia utilizada na fabricação de seus produtos. A IPT Teixeira tem como compromisso a qualidade, com elevação da durabilidade e menor custo operacional.
                  </p>
                  <p className="text-muted-foreground">
                    Nossa filosofia de qualidade nos impulsiona a continuar aprimorando e expandindo nossa linha de produtos para atender às crescentes demandas do mercado.
                  </p>
                </div>
                <div className="flex flex-col justify-between bg-green-50 p-6 rounded-lg border border-green-100">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-green-800">Visite nossa fábrica</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Conheça nosso processo de fabricação e veja de perto a qualidade dos nossos produtos.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm">
                        Av. Antonio Donato Sanfelice, 520<br />
                        Jardim Industrial / Potirendaba-SP<br />
                        15105-000
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-primary" />
                      <p className="text-sm">(17) 3827-9100</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-primary" />
                      <p className="text-sm">contato@iptteixeira.com.br</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="news" className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold mb-6 text-primary">Últimas Notícias</h3>
              <div className="space-y-6">
                {news.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-white min-w-16 h-16 flex flex-col items-center justify-center rounded-md">
                        <span className="font-bold">{item.date.split(' ')[0]}</span>
                        <span className="text-xs">{item.date.split(' ')[1]}</span>
                        <span className="text-xs">{item.year}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>
                        <Button variant="ghost" size="sm" className="text-primary">
                          Leia mais
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline">Ver todas as notícias</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para solicitar seu orçamento?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Entre em contato conosco para obter um orçamento personalizado para seu projeto ou tire suas dúvidas com nosso assistente virtual.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => {
                setIsLoginMode(true);
                setShowAuthForm(true);
                window.scrollTo({top: 0, behavior: 'smooth'});
              }} 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
            >
              Solicitar Orçamento
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
              <Link to="/chat-assistant">
                <MessageSquare className="mr-2" size={18} />
                Falar com Assistente
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer is provided by Layout */}
    </Layout>
  );
};

export default Index;
