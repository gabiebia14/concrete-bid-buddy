
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { FileText, ArrowRight, MessageSquare } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);

  return (
    <Layout hideHeader={false} hideFooter={false} hideSidebar>
      <div 
        className="min-h-screen bg-gradient-to-b from-gray-200 to-gray-300 bg-opacity-90"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E"),
          linear-gradient(to bottom, #e6e9f0 0%, #eef1f5 100%)`,
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="container mx-auto px-4 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 py-12">
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left bg-white/80 rounded-xl p-8 backdrop-blur-sm shadow-lg">
            <div className="mb-8">
              <img src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" alt="IPT Teixeira Logo" className="h-32 mb-6 object-scale-down" />
              <p className="text-xl text-muted-foreground max-w-lg">
                Orçamentos de produtos de concreto com praticidade e rapidez
              </p>
            </div>

            <div className="space-y-6 max-w-lg">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <FileText size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Orçamentos simplificados</h3>
                  <p className="text-muted-foreground text-sm">
                    Crie e gerencie orçamentos em poucos cliques, sem burocracia
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MessageSquare size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Assistente virtual</h3>
                  <p className="text-muted-foreground text-sm">
                    Converse com nosso assistente para tirar dúvidas e solicitar orçamentos
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {!user && !showAuthForm && (
                <Button onClick={() => setShowAuthForm(true)} size="lg">
                  Fazer Login
                </Button>
              )}
              
              <Button asChild variant="outline" size="lg">
                <Link to="/chat-assistant">
                  <MessageSquare className="mr-2" size={18} />
                  Falar com Assistente
                </Link>
              </Button>
              
              {user && (
                <Button asChild size="lg">
                  <Link to="/dashboard">
                    Ir para o Dashboard
                    <ArrowRight className="ml-2" size={18} />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/2 max-w-md">
            {(showAuthForm || user === null) && !user && (
              <Card className="border-t-4 border-t-primary shadow-lg py-0 my-[4px] bg-white/90 backdrop-blur-sm">
                <AuthForm isManager={false} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
