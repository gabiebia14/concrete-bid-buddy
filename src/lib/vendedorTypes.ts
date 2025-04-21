
// Tipos para o chat
export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
}

// Tipos para a sessão de chat
export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
}

// Tipos para orçamentos
export interface ManualQuoteFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  deadline?: string;
  paymentMethod?: string;
  notes?: string;
}
