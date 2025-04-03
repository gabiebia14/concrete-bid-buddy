
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSmitheryEmail } from '@/hooks/useSmitheryEmail';
import { Loader2 } from 'lucide-react';

export function EmailSender() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { sendEmail, isSending } = useSmitheryEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await sendEmail({
        from: 'noreply@iptteixeira.com.br',
        to,
        subject,
        html: message,
      });
      
      // Limpar formulário após envio bem-sucedido
      setTo('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enviar Email</CardTitle>
        <CardDescription>
          Envie emails para clientes usando a integração Smithery
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">Destinatário</Label>
            <Input
              id="to"
              type="email"
              placeholder="email@exemplo.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              placeholder="Assunto do email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Conteúdo do email"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSending} className="w-full">
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Email'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
