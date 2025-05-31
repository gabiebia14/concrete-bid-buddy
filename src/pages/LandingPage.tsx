
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, MessageSquare, Calculator, Clock, Phone, Mail, MapPin, Award, Shield, User, Check, Truck, PieChart, ArrowDown, ExternalLink, Star } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { FadeInSection } from "@/components/ui/fade-in-section";

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("empresa");
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const products = [{
    title: "Postes",
    image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
    description: "Postes de concreto para diversas aplicações",
    features: ["Alta resistência", "Durabilidade", "Certificado"]
  }, {
    title: "Blocos e Meio Blocos",
    image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
    description: "Blocos estruturais de concreto",
    features: ["Estrutural", "Vedação", "Modular"]
  }, {
    title: "Tubos e Aduelas",
    image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
    description: "Tubos de concreto para infraestrutura",
    features: ["Drenagem", "Esgoto", "Águas pluviais"]
  }, {
    title: "Pavimentos e Mini Guias",
    image: "/lovable-uploads/0a6452e7-c06e-4b40-a69f-43ebfc9d7e28.png",
    description: "Soluções para pavimentação",
    features: ["Tráfego leve", "Tráfego pesado", "Decorativos"]
  }];
  
  const vantagens = [
    {
      icon: <Award className="w-12 h-12 text-lime-600" />,
      title: "Qualidade Certificada",
      description: "Produtos certificados com rigoroso controle de qualidade seguindo normas técnicas",
      stats: "ISO 9001 + 13001"
    },
    {
      icon: <Truck className="w-12 h-12 text-lime-600" />,
      title: "Entrega em Todo Estado",
      description: "Logística própria para atendimento em todo o estado de São Paulo",
      stats: "100% SP"
    },
    {
      icon: <Shield className="w-12 h-12 text-lime-600" />,
      title: "Garantia Total",
      description: "Todos os nossos produtos possuem garantia e suporte técnico especializado",
      stats: "5 anos"
    },
    {
      icon: <PieChart className="w-12 h-12 text-lime-600" />,
      title: "Inovação Contínua",
      description: "Investimento constante em tecnologia e processos de fabricação",
      stats: "25+ anos"
    }
  ];

  const stats = [
    { label: "Anos de Experiência", value: 30, suffix: "+" },
    { label: "Produtos Entregues", value: 50000, suffix: "+" },
    { label: "Clientes Satisfeitos", value: 2500, suffix: "+" },
    { label: "Cidades Atendidas", value: 200, suffix: "+" }
  ];
  
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Top Bar com Certificações */}
      <div className="bg-gradient-to-r from-lime-600 to-lime-700 text-white py-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <div className="container mx-auto px-4 flex justify-between items-center text-xs relative z-10">
          <div className="md:flex items-center space-x-6 hidden">
            <div className="flex items-center group hover:text-lime-200 transition-colors">
              <Phone size={14} className="mr-2 group-hover:animate-pulse" />
              <span>(17) 3827-9100</span>
            </div>
            <div className="flex items-center group hover:text-lime-200 transition-colors">
              <Mail size={14} className="mr-2 group-hover:animate-pulse" />
              <span>contato@iptteixeira.com.br</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              <Award size={14} className="mr-1" />
              <span className="hidden sm:inline">ISO</span> 13001
            </div>
            <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              <Shield size={14} className="mr-1" />
              <span className="hidden sm:inline">ISO</span> 9001
            </div>
          </div>
        </div>
      </div>

      {/* Header Dinâmico */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center group">
              <img 
                src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" 
                alt="IPT Teixeira Logo" 
                className="h-14 sm:h-16 mr-3 transition-transform group-hover:scale-105" 
              />
              <div className="hidden sm:block">
                <h1 className="font-bold text-lime-600 text-xl bg-gradient-to-r from-lime-600 to-lime-800 bg-clip-text text-transparent">
                  IPT TEIXEIRA
                </h1>
                <p className="text-sm text-gray-500">Produtos de Concreto</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8 text-gray-700">
              {['Início', 'Produtos', 'Empresa', 'Contato'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="relative hover:text-lime-600 transition-all duration-300 group py-2"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lime-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </nav>
            
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex group">
                <a href="tel:1738279100" className="flex items-center gap-2">
                  <Phone size={16} className="group-hover:animate-pulse" />
                  <span className="hidden lg:inline">(17) 3827-9100</span>
                </a>
              </Button>
              
              <Button asChild size="sm" className="bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/login" className="flex items-center gap-2">
                  <User size={16} />
                  <span className="hidden sm:inline">Área do Cliente</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section com Parallax */}
      <ParallaxSection>
        <section className="relative h-screen overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="/lovable-uploads/cdce80b2-38fa-4d29-b1ea-c253d79cb9c2.png" 
              alt="Soluções em concreto para sua obra" 
              className="h-full w-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <FadeInSection delay={0.2}>
              <div className="max-w-4xl">
                <div className="mb-8 space-y-6">
                  <div className="inline-flex items-center bg-lime-600/20 backdrop-blur-sm border border-lime-400/30 rounded-full px-6 py-2 text-lime-200 text-sm">
                    <Star className="w-4 h-4 mr-2" />
                    Mais de 30 anos de excelência
                  </div>
                  
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                    <span className="bg-gradient-to-r from-white via-lime-100 to-white bg-clip-text text-transparent">
                      Soluções em concreto
                    </span>
                    <br />
                    <span className="text-lime-400">para sua obra</span>
                  </h1>
                  
                  <p className="text-xl sm:text-2xl text-white/90 max-w-2xl leading-relaxed">
                    Qualidade, resistência e inovação em produtos que fazem a diferença em cada projeto
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {stats.map((stat, index) => (
                    <FadeInSection key={stat.label} delay={0.4 + index * 0.1}>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-lime-400">
                          <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                        </div>
                        <div className="text-sm text-white/80">{stat.label}</div>
                      </div>
                    </FadeInSection>
                  ))}
                </div>
                
                <FadeInSection delay={0.8}>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button asChild size="lg" className="bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 text-lg py-6 px-8 shadow-2xl hover:shadow-lime-500/25 transition-all duration-300 group">
                      <Link to="/login">
                        Solicitar Orçamento
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg py-6 px-8 backdrop-blur-sm transition-all duration-300">
                      <a href="#produtos">
                        Conheça Nossos Produtos
                        <ArrowDown className="ml-2" size={20} />
                      </a>
                    </Button>
                  </div>
                </FadeInSection>
              </div>
            </FadeInSection>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* Vantagens Section */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-100/20 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <FadeInSection>
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-3 bg-lime-100 text-lime-800 rounded-full text-sm font-medium mb-6">
                Por que escolher a IPT Teixeira?
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Excelência em Produtos de Concreto
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Há mais de 30 anos entregando soluções em concreto com qualidade, tecnologia e sustentabilidade
              </p>
            </div>
          </FadeInSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vantagens.map((vantagem, index) => (
              <FadeInSection key={index} delay={index * 0.15}>
                <Card className="relative p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-lime-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-lime-600"></div>
                  
                  <div className="relative z-10">
                    <div className="mb-6 p-4 rounded-2xl bg-lime-50 inline-block group-hover:scale-110 transition-transform duration-300">
                      {vantagem.icon}
                    </div>
                    <div className="text-sm text-lime-600 font-semibold mb-2">{vantagem.stats}</div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">{vantagem.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{vantagem.description}</p>
                  </div>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produtos" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-3 bg-lime-100 text-lime-800 rounded-full text-sm font-medium mb-6">
                NOSSOS PRODUTOS
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Soluções Completas em Concreto
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Produtos de alta qualidade para diversos segmentos da construção civil e infraestrutura
              </p>
            </div>
          </FadeInSection>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-700 border-0 shadow-lg bg-white">
                  <div className="aspect-[4/3] bg-gradient-to-br from-lime-50 to-lime-100 relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="space-y-2">
                          {product.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <Check size={14} className="mr-2 text-lime-400" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-xl mb-3 text-lime-700 group-hover:text-lime-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{product.description}</p>
                    <Button asChild className="w-full bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800 group/btn">
                      <Link to="/login" className="flex items-center justify-center">
                        Solicitar Orçamento
                        <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section com Parallax */}
      <ParallaxSection speed={0.5}>
        <section className="py-24 bg-gradient-to-r from-lime-600 via-lime-700 to-lime-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-lime-600/50 to-lime-900/30"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <FadeInSection>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
                Pronto para começar seu projeto?
              </h2>
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
                Entre em contato conosco para obter um orçamento personalizado ou acesse nossa área do cliente.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button asChild size="lg" variant="secondary" className="bg-white text-lime-600 hover:bg-gray-100 text-lg py-6 px-8 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <Link to="/login">
                    Acessar Área do Cliente
                    <User className="ml-2 group-hover:scale-110 transition-transform" size={20} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-lime-600 text-lg py-6 px-8 backdrop-blur-sm transition-all duration-300 group">
                  <a href="tel:1738279100">
                    Falar com Consultor
                    <Phone className="ml-2 group-hover:animate-pulse" size={20} />
                  </a>
                </Button>
              </div>
            </FadeInSection>
          </div>
        </section>
      </ParallaxSection>

      {/* Footer Moderno */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 mb-12">
            <FadeInSection>
              <div>
                <img src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" alt="IPT Teixeira Logo" className="h-16 mb-6" />
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Qualidade e resistência em produtos de concreto desde 1994. Comprometidos com a excelência e inovação.
                </p>
                <div className="flex space-x-4">
                  {['facebook', 'instagram', 'linkedin'].map((social) => (
                    <Button key={social} variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300">
                      <div className="w-5 h-5 rounded bg-current"></div>
                    </Button>
                  ))}
                </div>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.2}>
              <div>
                <h3 className="font-bold text-xl mb-6">Contato</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group hover:text-lime-400 transition-colors">
                    <MapPin size={20} className="text-lime-400 mt-1 flex-shrink-0" />
                    <p className="text-gray-400 group-hover:text-white transition-colors">
                      Av. Antonio Donato Sanfelice, 520<br />
                      Jardim Industrial / Potirendaba-SP<br />
                      15105-000
                    </p>
                  </div>
                  <div className="flex items-center gap-3 group hover:text-lime-400 transition-colors">
                    <Phone size={20} className="text-lime-400" />
                    <p className="text-gray-400 group-hover:text-white transition-colors">(17) 3827-9100</p>
                  </div>
                  <div className="flex items-center gap-3 group hover:text-lime-400 transition-colors">
                    <Mail size={20} className="text-lime-400" />
                    <p className="text-gray-400 group-hover:text-white transition-colors">contato@iptteixeira.com.br</p>
                  </div>
                </div>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.4}>
              <div>
                <h3 className="font-bold text-xl mb-6">Links Rápidos</h3>
                <ul className="space-y-3">
                  {[
                    { name: 'Início', href: '#inicio' },
                    { name: 'Produtos', href: '#produtos' },
                    { name: 'Sobre Nós', href: '#sobre' },
                    { name: 'Área do Cliente', href: '/login' }
                  ].map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
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
