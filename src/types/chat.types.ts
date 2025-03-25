
import { ChatMessage } from '@/lib/types';

export interface ChatProps {
  clientId?: string;
  source?: string;
  webhookUrl?: string;
  onQuoteRequest?: (quoteData: any) => void;
  userInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface ChatState {
  message: string;
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string;
}

export interface ChatService {
  sendMessage: (message: string, userData: any) => Promise<void>;
  getMessages: () => ChatMessage[];
  getSessionId: () => string;
}
