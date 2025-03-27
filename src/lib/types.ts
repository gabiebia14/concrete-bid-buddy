
import { Database } from './database.types';

// Reexportando os tipos da database para uso nos componentes
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

export type QuoteStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'sent' | 'completed';

export type QuoteData = {
  id?: string;
  client_id: string;
  status: QuoteStatus;
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

// Tipos adicionais para dashboards
export type DashboardStats = {
  activeQuotes: number;
  approvedQuotes: number;
  totalSavings: number;
  activeChange: string;
  approvedChange: string;
  savingsChange: string;
};

export type TransactionItem = {
  id: string;
  product: string;
  date: string;
  value: number;
  status: QuoteStatus;
};

export type CategoryData = {
  category: string;
  value: number;
  change: string;
};
