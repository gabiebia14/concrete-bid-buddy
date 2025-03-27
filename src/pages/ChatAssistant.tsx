
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ChatInterface } from '@/components/ui/chat-interface';

const ChatAssistant = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <ChatInterface 
          title="Assistente IPT Teixeira"
          description="Tire suas dúvidas e solicite orçamentos"
          showBailey={false}
        />
      </div>
    </Layout>
  );
};

export default ChatAssistant;
