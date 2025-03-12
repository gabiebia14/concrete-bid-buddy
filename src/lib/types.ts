
import { Database } from './database.types';

// Reexportando os tipos da database para uso nos componentes
export type ChatMessage = {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  timestamp?: string; // Adicionado para compatibilidade
};

export type ChatSession = Database['public']['Tables']['chat_sessions']['Row'] & {
  chat_messages?: ChatMessage[];
};

export type QuoteItem = {
  product_id: string;
  product_name: string;
  dimensions: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
};

export type ClientData = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
};

export type QuoteData = {
  id?: string;
  client_id: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  items: QuoteItem[];
  total_value?: number;
  created_at?: string;
  updated_at?: string;
};

export type Quote = QuoteData & {
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  delivery_location?: string;
  delivery_deadline?: string;
  payment_method?: string;
  notes?: string;
  total_amount?: number;
};

export type QuoteStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'sent' | 'completed';
