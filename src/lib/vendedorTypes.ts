
// Tipos para o chat
export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
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
