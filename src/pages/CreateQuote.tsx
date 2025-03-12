
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChatInterface } from '@/components/ui/chat-interface';
import { ProductSelector } from '@/components/ui/product-selector';
import { QuoteItem } from '@/lib/types';
import { toast } from 'sonner';
import { createQuote, addClient } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Package } from 'lucide-react';

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
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Criar Orçamento</h1>
          <p className="text-muted-foreground">
            Preencha as informações abaixo para solicitar seu orçamento
          </p>
        </div>

        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="bg-muted/20 p-1 inline-flex w-full sm:w-auto">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Seleção Manual
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Assistente Virtual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
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
                    <ProductSelector onProductsSelected={handleProductsSelected} />
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="bg-white border-gray-200">
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
                          className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
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
                          className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Local de Entrega *</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
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
                          className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment">Forma de Pagamento</Label>
                        <Input
                          id="payment"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[100px] bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <Button 
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting || selectedProducts.length === 0}
                      >
                        {isSubmitting ? 'Enviando...' : 'Solicitar Orçamento'}
                      </Button>

                      <p className="text-xs text-gray-500 mt-4">
                        * Campos obrigatórios
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assistant">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Assistente Virtual
                </CardTitle>
                <CardDescription>
                  Converse com nosso assistente para criar um orçamento personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <ChatInterface onQuoteRequest={handleQuoteRequest} />
                  </div>
                  <div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-4">Como funciona:</h3>
                      <ol className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2">
                          <span className="font-medium">1.</span>
                          Descreva os produtos que você precisa
                        </li>
                        <li className="flex gap-2">
                          <span className="font-medium">2.</span>
                          Forneça as quantidades e dimensões
                        </li>
                        <li className="flex gap-2">
                          <span className="font-medium">3.</span>
                          Informe o local de entrega
                        </li>
                        <li className="flex gap-2">
                          <span className="font-medium">4.</span>
                          Receba seu orçamento personalizado
                        </li>
                      </ol>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="font-medium text-gray-900 mb-3">Sugestões:</p>
                        <div className="flex flex-wrap gap-2">
                          {['Blocos', 'Pisos', 'Lajes', 'Prazos', 'Pagamento'].map((tag) => (
                            <span 
                              key={tag}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
                            >
                              {tag}
                            </span>
                          ))}
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
    </Layout>
  );
}
