
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useVendedorChat } from '@/hooks/useVendedorChat';
import { VendedorHeader } from '@/components/vendedor/VendedorHeader';
import { LoadingIndicator } from '@/components/vendedor/LoadingIndicator';
import { EnviarOrcamentoButton } from '@/components/vendedor/EnviarOrcamentoButton';
import { EmailSender } from '@/components/vendedor/EmailSender';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function Vendedor() {
  const {
    messages,
    isLoading,
    isSavingQuote,
    orcamentoConcluido,
    handleSendMessage,
    handleEnviarParaVendedor
  } = useVendedorChat();
  
  const [showEmailSender, setShowEmailSender] = useState(false);

  // Extrair informações do orçamento das mensagens para incluir no email
  const getOrcamentoInfo = () => {
    if (!messages || messages.length === 0) return null;
    
    // Encontrar o último orçamento gerado pelo assistente
    const orcamentoMessages = messages
      .filter(msg => msg.role === 'assistant' && msg.content.includes('Orçamento'))
      .reverse();
    
    if (orcamentoMessages.length === 0) return null;
    
    // Pegar o último email do cliente mencionado
    const emailMatches = messages.join(' ').match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/g);
    const clienteEmail = emailMatches ? emailMatches[0] : '';
    
    // Procurar pelo nome do cliente nas mensagens
    const nameMatches = messages.join(' ').match(/(?:nome|cliente)[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:,|\.|$)/i);
    const clienteNome = nameMatches ? nameMatches[1].trim() : '';
    
    return {
      clienteNome,
      clienteEmail,
      detalhes: orcamentoMessages[0].content
    };
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <VendedorHeader />

        <div className="grid grid-cols-1 gap-6">
          <div>
            <ChatInterface 
              title="Assistente de Vendas IPT Teixeira" 
              description="Nosso assistente especializado OpenAI está pronto para ajudar com suas dúvidas sobre produtos de concreto"
              initialMessages={messages}
              onSendMessage={handleSendMessage}
              onConfirmOrder={handleEnviarParaVendedor}
            />
            
            <LoadingIndicator isLoading={isLoading} />
            
            <div className="flex flex-wrap gap-3 mt-4">
              <EnviarOrcamentoButton 
                onClick={handleEnviarParaVendedor}
                isSaving={isSavingQuote}
                orcamentoConcluido={orcamentoConcluido}
              />
              
              {orcamentoConcluido && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowEmailSender(!showEmailSender)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {showEmailSender ? 'Fechar' : 'Enviar Por Email'}
                </Button>
              )}
            </div>
            
            {showEmailSender && orcamentoConcluido && (
              <div className="mt-4">
                <EmailSender orcamento={getOrcamentoInfo()} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
