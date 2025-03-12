
import { Database } from './database.types';

// Reexportando os tipos da database para uso nos componentes
export type ChatMessage = {
  id: string;
  session_id: string;
  client_id?: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
};

export type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];

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
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  items: QuoteItem[];
  total_value?: number;
  created_at?: string;
  updated_at?: string;
};
