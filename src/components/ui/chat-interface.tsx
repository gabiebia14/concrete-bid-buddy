
import React from 'react';
import { Card } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';

interface ChatInterfaceProps {
  clientId?: string;
  onQuoteRequest?: (quoteData: any) => void;
}

export function ChatInterface({ clientId, onQuoteRequest }: ChatInterfaceProps) {
  const { 
    message, 
    setMessage, 
    messages, 
    isLoading, 
    handleSendMessage 
  } = useChat({ clientId, onQuoteRequest });

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden border">
      <ChatHeader />
      <ChatMessages messages={messages} />
      <ChatInput 
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </Card>
  );
}
