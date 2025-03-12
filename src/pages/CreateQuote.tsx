import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChatInterface } from '@/components/ui/chat-interface';
import { ProductSelector } from '@/components/ui/product-selector';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QuoteItem } from '@/lib/types';
import { toast } from 'sonner';
import { createQuote, addClient } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function CreateQuote() {
  const [activeTab, setActiveTab] = useState('manual');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<QuoteItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleProductsSelected = (products: QuoteItem[]) => {
    setSelectedProducts(products);
  };

  const handleQuoteRequest = (quoteData: any) => {
    console.log('Quote data from AI:', quoteData);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !location || selectedProducts.length === 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios e selecione pelo menos um produto.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const clientData = {
        name,
        email,
        phone,
        address: location
      };
      
      const client = await addClient(clientData);
      
      const quoteData = {
        client_id: client.id,
        status: 'pending' as const,
        items: selectedProducts,
        total_value: selectedProducts.reduce((sum, item) => sum + (item.total_price || 0), 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await createQuote(quoteData);
      
      toast.success('Orçamento enviado com sucesso! Em breve entraremos em contato.');
      navigate('/quote-history');
      
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error('Erro ao enviar orçamento. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <div className="page-container max-w-6xl">
          <h1 className="page-title">Criar Orçamento</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="manual">Seleção Manual</TabsTrigger>
              <TabsTrigger value="assistant">Assistente Virtual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Selecione os Produtos</CardTitle>
                      <CardDescription>
                        Escolha os produtos que você deseja incluir no seu orçamento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProductSelector onProductsSelected={handleProductsSelected} />
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações de Contato</CardTitle>
                      <CardDescription>
                        Preencha seus dados para receber o orçamento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="location">Local de Entrega *</Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="deadline">Prazo Desejado</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="payment">Forma de Pagamento</Label>
                          <Input
                            id="payment"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="notes">Observações</Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px]"
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
                    <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
                      <p>* Campos obrigatórios</p>
                      <p className="mt-2">
                        Ao enviar este formulário, você concorda com nossa política de privacidade
                        e termos de uso.
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="assistant" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Assistente Virtual</CardTitle>
                  <CardDescription>
                    Converse com nosso assistente para criar um orçamento personalizado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <ChatInterface onQuoteRequest={handleQuoteRequest} />
                    </div>
                    <div className="md:w-1/3">
                      <div className="bg-muted/50 rounded-lg p-4 border">
                        <h3 className="font-medium mb-3">Como funciona:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Converse com nosso assistente sobre suas necessidades</li>
                          <li>Informe os produtos, dimensões e quantidades desejadas</li>
                          <li>Forneça detalhes de entrega e contato</li>
                          <li>Receberá um orçamento personalizado em seu email</li>
                        </ol>
                        
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="font-medium mb-2 text-sm">Pergunte sobre:</h4>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="text-xs">
                              Tipos de blocos
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              Dimensões disponíveis
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              Prazos de entrega
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              Formas de pagamento
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
