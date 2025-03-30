
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuoteItem } from '@/lib/database.types';
import { toast } from 'sonner';
import { QuoteOptions } from '@/components/quote/QuoteOptions';
import { ProductSelectionWithHelp } from '@/components/quote/ProductSelectionWithHelp';
import { ContactForm } from '@/components/quote/ContactForm';

export default function CreateQuote() {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<QuoteItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectManual = () => {
    setShowOptions(false);
    setShowManualForm(true);
  };

  const handleSelectVendedor = () => {
    navigate('/vendedor');
  };

  const handleBack = () => {
    if (showManualForm) {
      setShowManualForm(false);
      setShowOptions(true);
    } else {
      navigate(-1);
    }
  };

  const handleProductsSelected = (products: QuoteItem[]) => {
    setSelectedProducts(products);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulação de envio
    setTimeout(() => {
      toast.success("Orçamento enviado com sucesso!");
      setIsSubmitting(false);
      navigate('/historico-orcamentos');
    }, 1500);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Criar Orçamento</h1>
          <p className="text-muted-foreground">
            Selecione a forma como deseja criar seu orçamento
          </p>
        </div>

        {showOptions && (
          <QuoteOptions 
            onSelectManual={handleSelectManual} 
            onSelectVendedor={handleSelectVendedor} 
          />
        )}

        {showManualForm && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductSelectionWithHelp 
                selectedProducts={selectedProducts}
                onProductsSelected={handleProductsSelected}
              />
            </div>

            <div>
              <ContactForm 
                selectedProducts={selectedProducts}
                isSubmitting={isSubmitting}
                onSubmit={handleManualSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
