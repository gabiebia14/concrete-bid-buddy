
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, FileText, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { ProductSelector } from '@/components/ui/product-selector';
import { QuoteItem } from '@/lib/database.types';
import { toast } from 'sonner';

export default function CreateQuote() {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Estados para o formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
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
      navigate('/historico');
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
                  onClick={handleSelectManual}
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
                <CardTitle className="text-center">Contato direto</CardTitle>
                <CardDescription className="text-center">
                  Entre em contato direto com nossa equipe de vendas
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                <p>Tire dúvidas, peça recomendações e obtenha ajuda personalizada</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleSelectVendedor}
                >
                  Entrar em contato <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {showManualForm && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle>Selecione os Produtos</CardTitle>
                  <CardDescription>
                    Escolha os produtos que você deseja incluir no seu orçamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductSelector onProductsSelected={handleProductsSelected} initialProducts={selectedProducts} />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Dados para Contato</CardTitle>
                  <CardDescription>
                    Preencha suas informações para receber o orçamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Seu nome completo" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="seu@email.com" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="(00) 00000-0000" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Local de Entrega</Label>
                      <Input 
                        id="location" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        placeholder="Endereço de entrega" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Prazo Desejado</Label>
                      <Input 
                        id="deadline" 
                        value={deadline} 
                        onChange={(e) => setDeadline(e.target.value)} 
                        placeholder="Ex: 15 dias" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment">Forma de Pagamento</Label>
                      <Input 
                        id="payment" 
                        value={paymentMethod} 
                        onChange={(e) => setPaymentMethod(e.target.value)} 
                        placeholder="Ex: À vista, 30/60/90 dias" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea 
                        id="notes" 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        placeholder="Informações adicionais..." 
                        rows={3} 
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting || selectedProducts.length === 0}
                    >
                      {isSubmitting ? 'Enviando...' : 'Solicitar Orçamento'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
