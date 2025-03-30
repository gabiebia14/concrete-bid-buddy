
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { QuoteItem } from '@/lib/database.types';

interface ContactFormProps {
  selectedProducts: QuoteItem[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ContactForm({ selectedProducts, isSubmitting, onSubmit }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados para Contato</CardTitle>
        <CardDescription>
          Preencha suas informações para receber o orçamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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
  );
}
