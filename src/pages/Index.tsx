
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">IPT Teixeira - Produtos de Concreto</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema de orçamentos e gerenciamento de vendas para produtos de concreto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Criar Orçamento</CardTitle>
              <CardDescription>
                Crie orçamentos personalizados para seus clientes com nossos produtos de concreto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Com nossa ferramenta de orçamentos, você pode:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Selecionar produtos do catálogo</li>
                <li>Especificar dimensões e quantidades</li>
                <li>Calcular preços automaticamente</li>
                <li>Incluir informações de entrega</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/create-quote">Criar Orçamento</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Orçamentos</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os orçamentos criados anteriormente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                No histórico de orçamentos, você pode:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Verificar o status de cada orçamento</li>
                <li>Buscar orçamentos por cliente</li>
                <li>Revisar detalhes de orçamentos anteriores</li>
                <li>Atualizar o status dos orçamentos</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link to="/quote-history">Ver Histórico</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-muted rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Precisando de ajuda?</h2>
          <p className="mb-6">
            Nosso assistente virtual está pronto para ajudar com dúvidas sobre produtos, 
            orçamentos e prazos de entrega.
          </p>
          <Button size="lg">
            Iniciar Chat com Assistente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
