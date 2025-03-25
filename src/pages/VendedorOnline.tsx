
import React, { useState } from 'react';
import { ChatInterface } from '@/components/ui/chat-interface';
import { Layout } from '@/components/layout/Layout';

export default function VendedorOnline() {
  // URL correta do webhook (removendo a parte duplicada e incorreta)
  const webhookUrl = "https://gbservin8n.sevirenostrinta.com.br/webhook/chat-assistant";
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Vendedor Online</h1>
        <div className="h-[calc(100vh-12rem)]">
          <ChatInterface 
            title="Vendedor Online" 
            description="Tire suas dúvidas com nosso vendedor virtual"
            webhookUrl={webhookUrl}
          />
        </div>
      </div>
    </Layout>
  );
}
