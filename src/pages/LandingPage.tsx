import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, MessageSquare, Calculator, Clock, Phone, Mail, MapPin, Award, Shield, User, Check, Truck, PieChart, ArrowDown } from "lucide-react";
import { Logos3Demo } from "@/components/ui/demo";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("empresa");
  
  const bannerSlides = [
    {
      image: "/lovable-uploads/cdce80b2-38fa-4d29-b1ea-c253d79cb9c2.png",
      title: "Soluções em concreto para sua obra",
      description: "Qualidade e resistência em produtos que fazem a diferença",
      gradient: "from-gray-900/80 to-transparent"
    },
    {
      image: "/lovable-uploads/1d414f0e-f876-49aa-a541-4d4879b1ba06.png",
      title: "Produtos certificados",
      description: "Tecnologia e controle de qualidade em cada peça",
      gradient: "from-gray-900/80 to-transparent"
    },
    {
      image: "/lovable-uploads/9ebb2850-3258-48aa-82a6-a586c7e2fa30.png",
      title: "Concreto para infraestrutura",
      description: "Tubos, postes e blocos de alta resistência",
      gradient: "from-gray-900/80 to-transparent"
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
  
  const vantagens = [
    {
      icon: <Award className="w-12 h-12 text-lime-600" />,
      title: "Qualidade Certificada",
      description: "Produtos certificados com rigoroso controle de qualidade seguindo normas técnicas"
    },
    {
      icon: <Truck className="w-12 h-12 text-lime-600" />,
      title: "Entrega em Todo Estado",
      description: "Logística própria para atendimento em todo o estado de São Paulo"
    },
    {
      icon: <Shield className="w-12 h-12 text-lime-600" />,
      title: "Garantia Total",
      description: "Todos os nossos produtos possuem garantia e suporte técnico especializado"
    },
    {
      icon: <PieChart className="w-12 h-12 text-lime-600" />,
      title: "Inovação Contínua",
      description: "Investimento constante em tecnologia e processos de fabricação"
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-lime-600 text-white py-1">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs">
          <div className="md:flex items-center space-x-4 hidden">
            <div className="flex items-center">
              <Phone size={14} className="mr-1" />
              <span>(17) 3827-9100</span>
            </div>
            <div className="flex items-center">
              <Mail size={14} className="mr-1" />
              <span>contato@iptteixeira.com.br</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center">
              <Award size={14} className="mr-1" />
              <span className="hidden sm:inline">ISO</span> 13001
            </div>
            <div className="flex items-center">
              <Shield size={14} className="mr-1" />
              <span className="hidden sm:inline">ISO</span> 9001
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white py-4 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" 
                alt="IPT Teixeira Logo" 
                className="h-12 sm:h-16 mr-2 sm:mr-3" 
              />
              <div className="hidden sm:block">
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
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <a href="tel:1738279100" className="flex items-center gap-2">
                  <Phone size={16} />
                  <span className="hidden sm:inline">(17) 3827-9100</span>
                </a>
              </Button>
              
              <Button asChild size="sm" className="bg-lime-600 hover:bg-lime-700">
                <Link to="/login" className="flex items-center gap-2">
                  <User size={16} />
                  <span className="hidden sm:inline">Área do Cliente</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Estático */}
      <section className="relative">
        <div className="relative h-[75vh] w-full overflow-hidden">
          <img 
            src="/lovable-uploads/cdce80b2-38fa-4d29-b1ea-c253d79cb9c2.png" 
            alt="Soluções em concreto para sua obra" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl p-6 sm:p-8 backdrop-blur-sm bg-black/20 rounded-lg border border-white/10">
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6">
                  Soluções em concreto para sua obra
                </h1>
                <p className="text-xl sm:text-2xl text-white/90 mb-6 sm:mb-8">
                  Qualidade e resistência em produtos que fazem a diferença
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-lime-600 hover:bg-lime-700 text-lg py-6">
                    <Link to="/login">
                      Solicitar Orçamento
                      <ArrowRight className="ml-2" size={20} />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20 text-lg py-6">
                    <a href="#produtos">
                      Conheça Nossos Produtos
                      <ArrowDown className="ml-2" size={20} />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-lime-100 text-lime-800 rounded-full text-sm font-medium mb-4">
              Por que escolher a IPT Teixeira?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Excelência em Produtos de Concreto
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Há mais de 25 anos entregando soluções em concreto com qualidade e tecnologia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vantagens.map((vantagem, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/50 backdrop-blur-sm border-t-4 border-lime-500">
                <div className="mb-4 p-4 rounded-full bg-lime-50 inline-block">
                  {vantagem.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{vantagem.title}</h3>
                <p className="text-gray-600">{vantagem.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="produtos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-lime-100 text-lime-800 rounded-full text-sm font-medium mb-4">
              NOSSOS PRODUTOS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Soluções Completas em Concreto
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Produtos de alta qualidade para diversos segmentos da construção civil e infraestrutura
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-500 border-t-2 border-lime-500">
                <div className="aspect-[4/3] bg-lime-50 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                    <div className="p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-lg font-medium">{product.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-4 text-lime-700">
                    {product.title}
                  </h3>
                  <Button asChild className="w-full bg-lime-600 hover:bg-lime-700 group">
                    <Link to="/login" className="flex items-center justify-center">
                      Solicitar Orçamento
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-lime-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-lime-700/80 to-lime-600/80 backdrop-blur"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">
            Pronto para começar seu projeto?
          </h2>
          <p className="text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Entre em contato conosco para obter um orçamento personalizado ou acesse nossa área do cliente.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="bg-white text-lime-600 hover:bg-gray-100 text-lg py-6">
              <Link to="/login">
                Acessar Área do Cliente
                <User className="ml-2" size={20} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20 text-lg py-6">
              <a href="tel:1738279100">
                Falar com Consultor
                <Phone className="ml-2" size={20} />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Logos3Demo />

      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <img src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" alt="IPT Teixeira Logo" className="h-16 mb-6" />
              <p className="text-gray-400 mb-6">
                Qualidade e resistência em produtos de concreto desde 1994.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-6">Contato</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-lime-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-400">
                    Av. Antonio Donato Sanfelice, 520<br />
                    Jardim Industrial / Potirendaba-SP<br />
                    15105-000
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-lime-400" />
                  <p className="text-gray-400">(17) 3827-9100</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-lime-400" />
                  <p className="text-gray-400">contato@iptteixeira.com.br</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-6">Links Rápidos</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#inicio" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRight size={16} />
                    Início
                  </a>
                </li>
                <li>
                  <a href="#produtos" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRight size={16} />
                    Produtos
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRight size={16} />
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRight size={16} />
                    Área do Cliente
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} IPT Teixeira. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
