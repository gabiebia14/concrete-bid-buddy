
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/lib/types';
import { toast } from 'sonner';

class ChatService {
  private sessionId: string;
  private messages: ChatMessage[] = [];
  private webhookUrl: string;
  
  constructor(webhookUrl: string) {
    // Verificar se já existe um session ID no localStorage
    const storedSessionId = localStorage.getItem('chatSessionId');
    
    if (storedSessionId) {
      this.sessionId = storedSessionId;
    } else {
      // Criar novo session ID
      this.sessionId = uuidv4();
      localStorage.setItem('chatSessionId', this.sessionId);
    }
    
    // Configurar URL da função Edge
    this.webhookUrl = webhookUrl || "";
    console.log("ChatService inicializado com URL:", this.webhookUrl);
  }
  
  async loadMessages(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', this.sessionId)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        this.messages = data;
        console.log(`${data.length} mensagens carregadas para a sessão ${this.sessionId}`);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }
  
  async sendMessage(message: string, userData: any): Promise<any> {
    if (!message.trim()) return null;
    
    // Criar objeto de mensagem com timestamp atual
    const now = new Date().toISOString();
    
    // Adicionar mensagem do usuário à lista
    const userMessage: ChatMessage = {
      id: uuidv4(),
      session_id: this.sessionId,
      content: message,
      role: 'user',
      created_at: now
    };
    
    // Salvar mensagem no Supabase
    try {
      await supabase.from('chat_messages').insert(userMessage);
      console.log("Mensagem do usuário salva com sucesso");
    } catch (dbError) {
      console.error("Erro ao salvar mensagem do usuário:", dbError);
      // Continuar mesmo se falhar o salvamento no banco
    }
    
    this.messages.push(userMessage);
    
    // Preparar payload para a função Edge
    const payload = {
      message: message,
      sessionId: this.sessionId,
      source: userData.source || 'web',
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      clientId: userData.clientId || null
    };
    
    console.log('Enviando mensagem para função Edge');
    console.log('Payload:', payload);
    
    // Chamar a função Edge do Supabase
    try {
      const response = await supabase.functions.invoke('chat-assistant', {
        body: payload
      });
      
      if (response.error) {
        throw new Error(`Erro na função Edge: ${response.error.message}`);
      }
      
      return this.processResponse(response.data);
    } catch (error) {
      console.error('Erro ao chamar função Edge:', error);
      
      // Mensagem de erro
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        session_id: this.sessionId,
        content: 'Desculpe, estou enfrentando problemas técnicos no momento. Nossa equipe já foi notificada. Por favor, tente novamente em instantes.',
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      
      // Salvar mensagem de erro no Supabase
      try {
        await supabase.from('chat_messages').insert(errorMessage);
      } catch (dbError) {
        console.error("Erro ao salvar mensagem de erro:", dbError);
      }
      
      this.messages.push(errorMessage);
      
      // Mostrar notificação de erro
      toast.error("Não foi possível conectar ao serviço de assistente");
      
      return {
        message: errorMessage.content,
        error: error.message
      };
    }
  }
  
  private async processResponse(responseData: any): Promise<any> {
    console.log('Resposta da função Edge:', responseData);
    
    // Verificar se há dados de orçamento na resposta
    if (responseData.quoteData || responseData.quote_data) {
      return responseData;
    }
    
    // Adicionar resposta do assistente à lista
    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      session_id: this.sessionId,
      content: responseData.message || responseData.reply || responseData.response || 'Desculpe, ocorreu um erro ao processar sua mensagem.',
      role: 'assistant',
      created_at: new Date().toISOString()
    };
    
    // Salvar resposta no Supabase
    try {
      await supabase.from('chat_messages').insert(assistantMessage);
    } catch (dbError) {
      console.error("Erro ao salvar resposta do assistente:", dbError);
    }
    
    this.messages.push(assistantMessage);
    
    return responseData;
  }
  
  getMessages(): ChatMessage[] {
    return this.messages;
  }
  
  getSessionId(): string {
    return this.sessionId;
  }
}

export default ChatService;
