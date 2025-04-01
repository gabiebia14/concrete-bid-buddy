
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface EnviarOrcamentoButtonProps {
  onClick: () => void;
  isSaving: boolean;
  orcamentoConcluido: boolean;
}

export function EnviarOrcamentoButton({ 
  onClick, 
  isSaving, 
  orcamentoConcluido 
}: EnviarOrcamentoButtonProps) {
  return (
    <div className="mt-6 flex justify-center">
      <Button 
        onClick={onClick}
        className="bg-lime-600 hover:bg-lime-700 px-6 py-2 flex items-center gap-2"
        disabled={orcamentoConcluido || isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando Orçamento...
          </>
        ) : orcamentoConcluido ? (
          <>
            <Send className="h-4 w-4" />
            Orçamento Registrado!
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Solicitar Orçamento com Vendedor
          </>
        )}
      </Button>
    </div>
  );
}
