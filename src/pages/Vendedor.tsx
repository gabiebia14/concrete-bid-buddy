
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useVendedorChat } from '@/hooks/useVendedorChat';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Vendedor() {
  const { messages, isLoading, handleSendMessage, clearSession } = useVendedorChat();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClearChat = () => {
    clearSession();
    setDialogOpen(false);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Assistente de Vendas IPT Teixeira</h1>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Chat
            </Button>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Limpar conversa</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja apagar todo o histórico de conversa? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleClearChat}>Limpar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <ChatInterface 
            title="Assistente de Vendas" 
            description="Nosso assistente especializado está pronto para ajudar com seu orçamento"
            onSendMessage={handleSendMessage}
            showReset={false}
            isLoading={isLoading}
            initialMessages={messages}
          />
        </div>
      </div>
    </Layout>
  );
}
