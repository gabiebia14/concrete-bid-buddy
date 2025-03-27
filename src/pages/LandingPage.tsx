
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, MessageSquare, Calculator, Clock, Phone, Mail, MapPin, ArrowDown, Award, Shield, User, Check, Truck, PieChart } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("empresa");
  
  // Dados do banner para o carrossel
  const bannerSlides = [
    {
      image: "/lovable-uploads/cdce80b2-38fa-4d29-b1ea-c253d79cb9c2.png",
      title: "Soluções em concreto para sua obra",
      description: "Qualidade e resistência em produtos que fazem a diferença"
    },
    {
      image: "/lovable-uploads/1d414f0e-f876-49aa-a541-4d4879b1ba06.png",
      title: "Produtos certificados",
      description: "Tecnologia e controle de qualidade em cada peça"
    },
    {
      image: "/lovable-uploads/9ebb2850-3258-48aa-82a6-a586c7e2fa30.png",
      title: "Concreto para infraestrutura",
      description: "Tubos, postes e blocos de alta resistência"
    }
  ];
  
  const products = [{
    title: "Postes",
    image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
    description: "Postes de concreto para diversas aplicações"
  }, {
    title: "Blocos e Meio Blocos",
    image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
    description: "Blocos estruturais de concreto"
  }, {
    title: "Tubos e Aduelas",
    image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
    description: "Tubos de concreto para infraestrutura"
  }, {
    title: "Pavimentos e Mini Guias",
    image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
    description: "Soluções para pavimentação"
  }];
  
  const vantagens = [{
    icon: <Check className="w-5 h-5 text-lime-600" />,
    title: "Qualidade Superior",
    description: "Produtos certificados com rigoroso controle de qualidade"
  }, {
    icon: <Truck className="w-5 h-5 text-lime-600" />,
    title: "Entrega em Todo o Estado",
    description: "Logística própria para atendimento em todo o estado de São Paulo"
  }, {
    icon: <Calculator className="w-5 h-5 text-lime-600" />,
    title: "Orçamentos Personalizados",
    description: "Soluções dimensionadas de acordo com as necessidades do cliente"
  }, {
    icon: <PieChart className="w-5 h-5 text-lime-600" />,
    title: "Inovação Contínua",
    description: "Investimento constante em tecnologia e processos"
  }];
  
  return <div className="flex flex-col min-h-screen">
      {/* Topo com certificações */}
      <div className="bg-lime-600 text-white py-1">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs">
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center">
              <Phone size={14} className="mr-1" />
              <span>(17) 3827-9100</span>
            </div>
            <div className="flex items-center">
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

      {/* Cabeçalho */}
      <header className="bg-white py-4 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" alt="IPT Teixeira Logo" className="h-16 mr-3" />
              <div className="hidden md:block">
                <h1 className="font-bold text-lime-600 text-xl">IPT TEIXEIRA</h1>
                <p className="text-sm text-gray-500">Produtos de Concreto</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-6 text-gray-700">
              <a href="#inicio" className="hover:text-lime-600 transition-colors">Início</a>
              <a href="#produtos" className="hover:text-lime-600 transition-colors">Produtos</a>
              <a href="#sobre" className="hover:text-lime-600 transition-colors">Empresa</a>
              <a href="#contato" className="hover:text-lime-600 transition-colors">Contato</a>
            </nav>
            
            <div className="flex items-center space-x-3">
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <a href="tel:1738279100" className="flex items-center gap-2">
                  <Phone size={16} />
                  (17) 3827-9100
                </a>
              </Button>
              
              <Button asChild size="sm" className="bg-lime-600 hover:bg-lime-700">
                <Link to="/login" className="flex items-center gap-2">
                  <User size={16} />
                  Área do Cliente
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Carrossel */}
      <section id="inicio" className="relative">
        <Carousel className="w-full" autoplay={true} loop={true}>
          <CarouselContent>
            {bannerSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[60vh] w-full">
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                    <div className="container mx-auto px-6">
                      <div className="max-w-lg p-6 backdrop-blur-sm bg-black/20 rounded-lg border border-white/10">
                        <h2 className="text-4xl font-bold text-white mb-4">
                          {slide.title}
                        </h2>
                        <p className="text-xl text-white/90 mb-6">
                          {slide.description}
                        </p>
                        <div className="flex gap-4">
                          <Button asChild size="lg" className="bg-lime-600 hover:bg-lime-700">
                            <Link to="/login">
                              Solicitar Orçamento
                              <ArrowRight className="ml-2" size={18} />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                            <a href="#produtos">
                              Ver Produtos
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            <CarouselPrevious className="bg-white/30 hover:bg-white/50 border-none backdrop-blur-sm" />
            <CarouselNext className="bg-white/30 hover:bg-white/50 border-none backdrop-blur-sm" />
          </div>
        </Carousel>
      </section>

      {/* Seção de Vantagens */}
      <section id="vantagens" className="py-16 bg-lime-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Por que escolher a IPT Teixeira?</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Entregamos muito mais do que produtos de concreto. Oferecemos soluções completas para sua obra.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vantagens.map((vantagem, index) => <Card key={index} className="border-t-4 border-lime-500">
                <div className="p-6">
                  <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center mb-4">
                    {vantagem.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{vantagem.title}</h3>
                  <p className="text-gray-600 text-sm">{vantagem.description}</p>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Seção de Produtos com fundo texturizado */}
      <section id="produtos" className="py-16 relative">
        <div className="absolute inset-0 bg-concrete-texture opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Conheça Nossos Produtos</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Soluções em concreto para diversos segmentos da construção civil
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => <div key={index} className="group bg-white border rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img src={product.image} alt={product.title} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                </div>
                <div className="p-5 border-t">
                  <h3 className="font-semibold text-lg mb-2 text-lime-700">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  <Button asChild variant="outline" size="sm" className="w-full hover:bg-lime-50">
                    <Link to="/login">Solicitar Orçamento</Link>
                  </Button>
                </div>
              </div>)}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild size="lg" className="bg-lime-600 hover:bg-lime-700">
              <Link to="/login" className="gap-2">
                Ver catálogo completo
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Seção Sobre e Notícias */}
      <section id="sobre" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="empresa" className="text-lg px-6">A Empresa</TabsTrigger>
                <TabsTrigger value="noticias" className="text-lg px-6">Informativos</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="empresa" className="bg-white p-6 rounded-lg shadow-sm">
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
                <div className="flex flex-col justify-between bg-lime-50 p-6 rounded-lg border border-lime-100">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-lime-700">Visite nossa fábrica</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Conheça nosso processo de fabricação e veja de perto a qualidade dos nossos produtos.
                    </p>
                  </div>
                  <div className="space-y-4" id="contato">
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
            
            <TabsContent value="noticias" className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold mb-6 text-lime-700">Últimas Notícias</h3>
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-lime-600 text-white min-w-16 h-16 flex flex-col items-center justify-center rounded-md">
                      <span className="font-bold">01</span>
                      <span className="text-xs">AGO</span>
                      <span className="text-xs">2023</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Colaboradores Administrativos em Agenda de FT</h4>
                      <Button variant="ghost" size="sm" className="text-lime-600">
                        Leia mais
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-lime-600 text-white min-w-16 h-16 flex flex-col items-center justify-center rounded-md">
                      <span className="font-bold">31</span>
                      <span className="text-xs">JUL</span>
                      <span className="text-xs">2023</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Conferência dos pré-V-home de 8.5 - 35 de julho/2023 da IPT Teixeira</h4>
                      <Button variant="ghost" size="sm" className="text-lime-600">
                        Leia mais
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start gap-4">
                    <div className="bg-lime-600 text-white min-w-16 h-16 flex flex-col items-center justify-center rounded-md">
                      <span className="font-bold">09</span>
                      <span className="text-xs">JUL</span>
                      <span className="text-xs">2023</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Conferência dos pré-V-home de 8.5 - 35 de julho/2023 da IPT Teixeira</h4>
                      <Button variant="ghost" size="sm" className="text-lime-600">
                        Leia mais
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lime-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para solicitar seu orçamento?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Entre em contato conosco para obter um orçamento personalizado para seu projeto ou acesse nossa área do cliente.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="bg-white text-lime-600 hover:bg-gray-100">
              <Link to="/login">
                Acessar Área do Cliente
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
              <a href="tel:1738279100">
                <Phone className="mr-2" size={18} />
                (17) 3827-9100
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" alt="IPT Teixeira Logo" className="h-16 mb-4" />
              <p className="text-sm text-gray-400 mb-4">
                Qualidade e resistência em produtos de concreto desde 1994.
              </p>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="text-lime-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-400">
                    Av. Antonio Donato Sanfelice, 520<br />
                    Jardim Industrial / Potirendaba-SP<br />
                    15105-000
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-lime-400" />
                  <p className="text-sm text-gray-400">(17) 3827-9100</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-lime-400" />
                  <p className="text-sm text-gray-400">contato@iptteixeira.com.br</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#inicio" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Início
                  </a>
                </li>
                <li>
                  <a href="#produtos" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Produtos
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Área do Cliente
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} IPT Teixeira. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;
