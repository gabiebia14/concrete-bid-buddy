
// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  dimensions: string[];
  image_url?: string;
  technical_details?: string;
  price_range?: string;
}

// Quote types
export type QuoteStatus = 'draft' | 'pending' | 'approved' | 'sent' | 'rejected' | 'completed';

export interface QuoteItem {
  product_id: string;
  product_name: string;
  dimensions: string;
  quantity: number;
  unit_price?: number; // Optional as it will be filled by the manager
  total_price?: number; // Optional as it will be filled by the manager
}

export interface Quote {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  items: QuoteItem[];
  status: QuoteStatus;
  delivery_location: string;
  delivery_deadline?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  total_amount?: number; // Optional as it will be filled by the manager
}

// Client types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company_name?: string;
  created_at: string;
}

// Chat message types
export interface ChatMessage {
  id: string;
  client_id?: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface ChatSession {
  id: string;
  client_id?: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
  quote_id?: string;
}

// Dashboard analytics types
export interface QuoteAnalytics {
  total_quotes: number;
  quotes_by_status: Record<QuoteStatus, number>;
  average_quote_value: number;
  conversion_rate: number;
}

export interface AIAgentAnalytics {
  total_sessions: number;
  average_session_duration: number;
  conversion_rate: number;
  popular_products: {
    product_id: string;
    product_name: string;
    count: number;
  }[];
}
