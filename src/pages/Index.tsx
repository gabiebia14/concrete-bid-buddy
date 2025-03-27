
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { FileText, ArrowRight, MessageSquare, Calculator, Clock, PieChart, CheckSquare, Truck, Phone, Mail, MapPin, ArrowDown, Award, Shield, ExternalLink } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Index = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Efeito para detectar o scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const products = [
    {
      title: "Postes",
      image: "/lovable-uploads/9ebb2850-3258-48aa-82a6-a586c7e2fa30.png",
      description: "Postes de concreto para diversas aplicações"
    },
    {
      title: "Blocos e Meio Blocos",
      image: "/lovable-uploads/9ebb2850-3258-48aa-82a6-a586c7e2fa30.png",
      description: "Blocos estruturais de concreto"
    },
    {
      title: "Tubos e Aduelas",
      image: "/lovable-uploads/9ebb2850-3258-48aa-82a6-a586c7e2fa30.png",
      description: "Tubos de concreto para infraestrutura"
    },
    {
      title: "Pavimentos e Mini Guias",
      image: "/lovable-uploads/9ebb2850-3258-48aa-82a6-a586c7e2fa30.png",
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
      {/* Banner de certificações fixo no topo */}
      <div className="bg-lime-600 text-white py-1">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Phone size={14} className="mr-1" />
              <span>(17) 3827-9100</span>
            </div>
            <div className="hidden sm:flex items-center">
              <Mail size={14} className="mr-1" />
              <span>contato@iptteixeira.com.br</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Award size={14} className="mr-1" />
              <span>ISO 13001</span>
            </div>
            <div className="flex items-center">
              <Shield size={14} className="mr-1" />
              <span>ISO 9001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section com Carousel */}
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: `url("/lovable-uploads/cdce80b2-38fa-4d29-b1ea-c253d79cb9c2.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay escuro para melhorar a legibilidade */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 min-h-[calc(100vh-6rem)] py-16">
            {/* Left Column - Hero Content */}
            <div className="w-full lg:w-1/2 glass-panel p-8 backdrop-blur-md bg-white/10 text-white rounded-xl border border-white/20 shadow-xl animate-fade-in">
              <div className="mb-8">
                <img src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" alt="IPT Teixeira Logo" className="h-32 mb-6 object-scale-down drop-shadow-lg" />
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Produtos de concreto<br />com qualidade e resistência
                </h1>
                <div className="flex items-center text-xl font-semibold mb-4 text-white">
                  <Phone className="mr-2" size={20} />
                  <span>(17) 3827-9100</span>
                </div>
                <p className="text-lg max-w-lg mb-4 text-white/90">
                  A IPT Teixeira representa para nossos colaboradores e principalmente para você, cliente, o que fazemos com excelência.
                </p>
                <div className="bg-white/20 p-4 rounded-lg border-l-4 border-lime-500 my-6 backdrop-blur-sm">
                  <h3 className="font-semibold mb-2">Nossa Missão</h3>
                  <p className="text-sm text-white/90">
                    "Atender às necessidades de nossos clientes e o mercado em geral com eficiência e transparência, para atender as necessidades do mercado."
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button onClick={() => {
                  setIsLoginMode(true);
                  setShowAuthForm(true);
                }} size="lg" className="gap-2 bg-lime-600 hover:bg-lime-700 text-white">
                  Solicitar Orçamento
                  <ArrowRight size={18} />
                </Button>
                
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                  <Link to="/catalogo" className="gap-2">
                    Ver Produtos
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  <Link to="/chat-assistant" className="gap-2">
                    <MessageSquare size={18} />
                    Falar com Assistente
                  </Link>
                </Button>
              </div>

              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold mb-4">Certificações e Qualidade</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-lime-800/40 p-4 rounded-lg border border-lime-500/30 backdrop-blur-sm">
                    <h3 className="font-medium text-lime-300 mb-2">ISO 13001</h3>
                    <p className="text-sm text-white/80">Certificação internacional que atesta nossos padrões de gestão ambiental</p>
                  </div>
                  <div className="bg-lime-800/40 p-4 rounded-lg border border-lime-500/30 backdrop-blur-sm">
                    <h3 className="font-medium text-lime-300 mb-2">ISO 9001</h3>
                    <p className="text-sm text-white/80">Certificação internacional que atesta nossos padrões de gestão de qualidade</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Auth Form or Product Highlights */}
            <div className="w-full lg:w-1/2 max-w-xl">
              {showAuthForm ? (
                <Card className="border-t-4 border-t-lime-600 shadow-2xl py-0 my-[4px] glass-panel backdrop-blur-md bg-white/80 animate-scale-in">
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
                <div className="space-y-6 glass-panel backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 shadow-xl text-white animate-slide-in">
                  <h2 className="text-2xl font-semibold border-b pb-2 text-white">Acesse Nossa Plataforma</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-lime-600/20 p-2 rounded-full">
                        <FileText size={20} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Orçamentos simplificados</h3>
                        <p className="text-white/80 text-sm">
                          Crie e gerencie orçamentos em poucos cliques
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-lime-600/20 p-2 rounded-full">
                        <Calculator size={20} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Cálculos automáticos</h3>
                        <p className="text-white/80 text-sm">
                          Preços calculados com base nas suas especificações
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-lime-600/20 p-2 rounded-full">
                        <Clock size={20} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Histórico completo</h3>
                        <p className="text-white/80 text-sm">
                          Acesso ao histórico de todos seus orçamentos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-lime-600/20 p-2 rounded-full">
                        <PieChart size={20} className="text-lime-400" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Dashboard personalizado</h3>
                        <p className="text-white/80 text-sm">
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
                      className="w-full sm:w-auto bg-lime-600 hover:bg-lime-700"
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
                      className="w-full sm:w-auto border-white text-white hover:bg-white/20"
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
            <Button variant="ghost" size="sm" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})} className="text-white hover:bg-white/10">
              <ArrowDown />
              <span className="sr-only">Rolar para baixo</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section com Fundo de Concreto */}
      <section className="py-16 relative" style={{
        backgroundImage: `url("/lovable-uploads/1d414f0e-f876-49aa-a541-4d4879b1ba06.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Nossos Produtos</h2>
          <p className="text-center max-w-2xl mx-auto mb-12 text-gray-600">Produtos de concreto fabricados com excelência e qualidade para atender às suas necessidades em construção e infraestrutura.</p>
          
          <Carousel className="max-w-5xl mx-auto">
            <CarouselContent>
              {products.map((product, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="group h-full bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100 m-2">
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-lime-500/20 to-lime-600/40"></div>
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="object-cover w-full h-full transition-transform group-hover:scale-105" 
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="font-semibold text-lg text-white">{product.title}</h3>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                      <Button asChild variant="outline" size="sm" className="w-full hover:bg-lime-50 hover:text-lime-700 hover:border-lime-300">
                        <Link to="/catalogo" className="flex items-center justify-center gap-1">
                          Ver Detalhes
                          <ExternalLink size={14} />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </div>
          </Carousel>
          
          <div className="text-center mt-10">
            <Button asChild size="lg" className="bg-lime-600 hover:bg-lime-700">
              <Link to="/catalogo" className="gap-2">
                Ver todos os produtos
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Imagem da Fábrica */}
      <section className="py-0 overflow-hidden relative">
        <div className="h-80 md:h-96 lg:h-[500px] relative overflow-hidden">
          <img 
            src="/lovable-uploads/cdce80b2-38fa-4d29-b1ea-c253d79cb9c2.png" 
            alt="Fábrica IPT Teixeira" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-lime-800/80 to-transparent flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-lg">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md">Nossa Fábrica</h2>
                <p className="text-white/90 text-lg mb-6">Uma das mais modernas instalações do Brasil para produção de artefatos de concreto.</p>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/20">
                  <Link to="/contato">
                    Agende uma visita
                  </Link>
                </Button>
              </div>
            </div>
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
            
            <TabsContent value="about" className="bg-white p-6 rounded-xl shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-semibold mb-4 text-lime-700">Sobre a IPT Teixeira</h3>
                  <p className="text-gray-600 mb-4">
                    A empresa IPT Postes Teixeira, situada no estado de São Paulo, destaca-se como uma referência na fabricação de produtos de concreto para a construção e infraestrutura.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Desde 1994, a empresa vem desenvolvendo e aprimorando a tecnologia utilizada na fabricação de seus produtos. A IPT Teixeira tem como compromisso a qualidade, com elevação da durabilidade e menor custo operacional.
                  </p>
                  <p className="text-gray-600">
                    Nossa filosofia de qualidade nos impulsiona a continuar aprimorando e expandindo nossa linha de produtos para atender às crescentes demandas do mercado.
                  </p>
                </div>
                <div className="flex flex-col justify-between bg-lime-50 p-6 rounded-xl border border-lime-100">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-lime-800">Visite nossa fábrica</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Conheça nosso processo de fabricação e veja de perto a qualidade dos nossos produtos.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={18} className="text-lime-600 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-600">
                        Av. Antonio Donato Sanfelice, 520<br />
                        Jardim Industrial / Potirendaba-SP<br />
                        15105-000
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-lime-600" />
                      <p className="text-sm text-gray-600">(17) 3827-9100</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-lime-600" />
                      <p className="text-sm text-gray-600">contato@iptteixeira.com.br</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="news" className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold mb-6 text-lime-700">Últimas Notícias</h3>
              <div className="space-y-6">
                {news.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="bg-lime-600 text-white min-w-16 h-16 flex flex-col items-center justify-center rounded-md">
                        <span className="font-bold">{item.date.split(' ')[0]}</span>
                        <span className="text-xs">{item.date.split(' ')[1]}</span>
                        <span className="text-xs">{item.year}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>
                        <Button variant="ghost" size="sm" className="text-lime-700 hover:text-lime-800 hover:bg-lime-50">
                          Leia mais
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline" className="border-lime-500 text-lime-700 hover:bg-lime-50">Ver todas as notícias</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section com efeito de paralaxe */}
      <section className="py-16 relative">
        <div 
          className="absolute inset-0 z-0 bg-fixed" 
          style={{
            backgroundImage: `url("/lovable-uploads/9ebb2850-3258-48aa-82a6-a586c7e2fa30.png")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'brightness(0.3)'
          }}
        ></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Pronto para solicitar seu orçamento?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/80">
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
              className="bg-white text-lime-700 hover:bg-gray-100"
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
      
      {/* Botão de retorno ao topo */}
      <Button 
        variant="outline" 
        size="icon"
        className={`fixed bottom-6 right-6 z-50 rounded-full bg-lime-600 text-white hover:bg-lime-700 shadow-md transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </Layout>
  );
};

export default Index;

// Ícone ArrowUp para o botão de retorno ao topo
function ArrowUp(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}
