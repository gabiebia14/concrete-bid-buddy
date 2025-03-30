
// Tipos para o cliente
export interface ClienteFormData {
  tipoPessoa: 'fisica' | 'juridica';
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  representanteNome?: string;
  representanteCpf?: string;
}

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
