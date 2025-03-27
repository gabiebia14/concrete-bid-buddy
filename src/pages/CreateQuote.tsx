
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductSelector } from '@/components/ui/product-selector';
import { QuoteItem } from '@/lib/types';
import { toast } from 'sonner';
import { createQuote, addClient } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Package } from 'lucide-react';
import { ChatInterface } from '@/components/chat/ChatInterface';

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
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const handleProductsSelected = (products: QuoteItem[]) => {
    setSelectedProducts(products);
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

  return <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Criar Orçamento</h1>
          <p className="text-muted-foreground">
            Preencha as informações abaixo para solicitar seu orçamento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Selecione os Produtos</CardTitle>
                    <CardDescription>
                      Escolha os produtos que você deseja incluir no seu orçamento
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setShowChat(!showChat)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {showChat ? 'Fechar Chat' : 'Precisa de Ajuda?'}
                  </Button>
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
                  <ProductSelector onProductsSelected={handleProductsSelected} initialProducts={selectedProducts} />
                )}
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
      </div>
    </Layout>;
}
