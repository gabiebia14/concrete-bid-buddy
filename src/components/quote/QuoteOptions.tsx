
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface QuoteOptionsProps {
  onSelectManual: () => void;
  onSelectVendedor: () => void;
}

export function QuoteOptions({ onSelectManual, onSelectVendedor }: QuoteOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <Card className="hover:border-lime-500 hover:shadow-md transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-lime-600" />
            </div>
          </div>
          <CardTitle className="text-center">Orçamento Manual</CardTitle>
          <CardDescription className="text-center">
            Selecione produtos, quantidades e especificações manualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Ideal para quando você já sabe exatamente o que precisa</p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-lime-600 hover:bg-lime-700" 
            onClick={onSelectManual}
          >
            Selecionar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-center">Falar com Vendedor</CardTitle>
          <CardDescription className="text-center">
            Converse com um de nossos vendedores especializados
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Tire dúvidas, peça recomendações e obtenha ajuda personalizada</p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={onSelectVendedor}
          >
            Iniciar Conversa <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
