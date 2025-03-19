import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { FileText, ArrowRight } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
const Index = () => {
  const {
    user
  } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);
  return <Layout hideHeader={false} hideFooter={false} hideSidebar>
      <div className="container mx-auto px-4 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 py-12">
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="mb-8">
            <img src="/lovable-uploads/c085fb11-fefa-4a52-a477-58422183e2bc.png" alt="IPT Teixeira Logo" className="h-54 mb-6 object-scale-down" />
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
                <ArrowRight size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Atendimento inteligente</h3>
                <p className="text-muted-foreground text-sm">
                  Assistente virtual disponível 24h para esclarecer suas dúvidas
                </p>
              </div>
            </div>
          </div>

          {!user && !showAuthForm && <div className="mt-8">
              <Button onClick={() => setShowAuthForm(true)} size="lg">
                Fazer Login
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                Acesse sua conta para gerenciar seus orçamentos
              </p>
            </div>}

          {user && <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Ir para o Dashboard
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
            </div>}
        </div>

        <div className="w-full lg:w-1/2 max-w-md">
          {(showAuthForm || user === null) && !user && <Card className="border-t-4 border-t-primary shadow-lg">
              <AuthForm isManager={false} />
            </Card>}
        </div>
      </div>
    </Layout>;
};
export default Index;