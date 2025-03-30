
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductSelector } from '@/components/ui/product-selector';
import { QuoteItem } from '@/lib/database.types';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductSelectionWithHelpProps {
  selectedProducts: QuoteItem[];
  onProductsSelected: (products: QuoteItem[]) => void;
}

export function ProductSelectionWithHelp({ selectedProducts, onProductsSelected }: ProductSelectionWithHelpProps) {
  const [showChat, setShowChat] = useState(false);
  
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Selecione os Produtos</CardTitle>
            <CardDescription>
              Escolha os produtos que você deseja incluir no seu orçamento
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowChat(!showChat)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {showChat ? 'Fechar Chat' : 'Precisa de Ajuda?'}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/vendedor">
                <MessageSquare className="mr-2 h-4 w-4" />
                Falar com Vendedor
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showChat ? (
          <div className="mb-4">
            <ChatInterface
              title="Assistente de Orçamentos"
              description="Tire dúvidas sobre produtos e especificações"
              showReset={false}
            />
          </div>
        ) : (
          <ProductSelector onProductsSelected={onProductsSelected} initialProducts={selectedProducts} />
        )}
      </CardContent>
    </Card>
  );
}
