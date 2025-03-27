
// Tipos de dados para o sistema de chat
export interface ChatMessage {
  id?: string;
  session_id?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at?: string;
}

export interface ChatSession {
  id: string;
  client_id: string;
  status: 'active' | 'closed';
  quote_id?: string;
  created_at: string;
}

export interface AgentConfig {
  id?: string;
  name: string;
  version: string;
  sistema_principal: string;
  sistema_especialista?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}
