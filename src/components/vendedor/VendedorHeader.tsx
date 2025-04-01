
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VendedorHeader() {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <h1 className="text-2xl font-bold text-gray-900">Fale com um Vendedor</h1>
      <p className="text-muted-foreground">
        Converse com nossa equipe especializada para tirar dúvidas e obter recomendações personalizadas sobre nossos produtos de concreto
      </p>
    </div>
  );
}
