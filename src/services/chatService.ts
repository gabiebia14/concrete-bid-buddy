
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/lib/types';

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
    
    this.webhookUrl = webhookUrl;
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
    await supabase.from('chat_messages').insert(userMessage);
    
    this.messages.push(userMessage);
    
    // Preparar o payload para o webhook
    const payload = {
      body: {
        message: message,
        sessionId: this.sessionId,
        source: userData.source || 'web',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        clientId: userData.clientId || null
      }
    };
    
    console.log('Enviando mensagem para webhook:', payload);
    
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na resposta do webhook: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Resposta do webhook:', responseData);
      
      // Verificar se há dados de orçamento na resposta
      if (responseData.quoteData) {
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
      await supabase.from('chat_messages').insert(assistantMessage);
      
      this.messages.push(assistantMessage);
      
      return responseData;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Mensagem de erro
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        session_id: this.sessionId,
        content: 'Desculpe, estou enfrentando problemas técnicos no momento. Nossa equipe já foi notificada. Por favor, tente novamente em instantes.',
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      
      // Salvar mensagem de erro no Supabase
      await supabase.from('chat_messages').insert(errorMessage);
      
      this.messages.push(errorMessage);
      
      throw error;
    }
  }
  
  getMessages(): ChatMessage[] {
    return this.messages;
  }
  
  getSessionId(): string {
    return this.sessionId;
  }
}

export default ChatService;
