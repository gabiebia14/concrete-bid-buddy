
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSmitheryEmail } from '@/hooks/useSmitheryEmail';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmailSenderProps {
  orcamento?: {
    clienteNome: string;
    clienteEmail: string;
    detalhes: string;
  };
}

export function EmailSender({ orcamento }: EmailSenderProps) {
  const [to, setTo] = useState(orcamento?.clienteEmail || '');
  const [subject, setSubject] = useState('Orçamento IPT Teixeira');
  const [message, setMessage] = useState(orcamento?.detalhes || '');
  const { sendEmail, isSending } = useSmitheryEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!to || !subject || !message) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      await sendEmail({
        from: 'noreply@iptteixeira.com.br',
        to,
        subject,
        html: `
          <h1>Orçamento IPT Teixeira</h1>
          <p>Prezado(a) cliente,</p>
          <p>Segue o orçamento solicitado:</p>
          <div style="padding: 15px; border: 1px solid #ddd; background-color: #f9f9f9; border-radius: 5px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <p>Em caso de dúvidas, estamos à disposição.</p>
          <p>Atenciosamente,<br/>Equipe IPT Teixeira</p>
        `,
      });
      
      toast.success('Email enviado com sucesso!');
      
      // Limpar campos após envio
      if (!orcamento) {
        setTo('');
        setSubject('Orçamento IPT Teixeira');
        setMessage('');
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast.error('Falha ao enviar email. Tente novamente.');
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Enviar Orçamento por Email</CardTitle>
        <CardDescription>
          Envie o orçamento diretamente para o cliente via email
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">Destinatário</Label>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto do email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Conteúdo do orçamento..."
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSending || !to || !subject || !message}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Orçamento'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
