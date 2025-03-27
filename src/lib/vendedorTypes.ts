
// Tipos para o chat do vendedor
export interface VendedorChatMessage {
  id?: string;
  session_id?: string;
  remetente: 'cliente' | 'vendedor';
  conteudo: string;
  created_at?: string;
}

export interface VendedorChatSession {
  id: string;
  cliente_id?: string;
  status: 'ativo' | 'encerrado' | 'aguardando';
  created_at: string;
  updated_at: string;
}

export interface VendedorChatState {
  messages: VendedorChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}
