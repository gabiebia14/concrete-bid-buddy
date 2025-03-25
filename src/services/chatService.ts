
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
    
    // Garantir que a URL do webhook é correta
    this.webhookUrl = "https://gbservin8n.sevirenostrinta.com.br/webhook-test/chat-assistant";
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
    
    // Preparar o payload exatamente como o n8n espera
    // Importante: NÃO aninhar em body.body, enviar direto
    const payload = {
      message: message,
      sessionId: this.sessionId,
      source: userData.source || 'web',
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      clientId: userData.clientId || null
    };
    
    console.log('Enviando mensagem para webhook:', this.webhookUrl);
    console.log('Payload:', payload);
    
    // Tentar usar o webhook externo com a URL corrigida
    try {
      const response = await this.callWebhook(this.webhookUrl, payload);
      return this.processWebhookResponse(response);
    } catch (webhookError) {
      console.error('Erro ao chamar webhook:', webhookError);
      
      // Tentar usar a função Edge no Supabase como plano B
      try {
        console.log('Tentando usar função Edge como alternativa');
        const edgeResponse = await supabase.functions.invoke('chat-assistant', {
          body: payload
        });
        
        if (edgeResponse.error) {
          throw new Error(`Erro na função Edge: ${edgeResponse.error.message}`);
        }
        
        return this.processWebhookResponse(edgeResponse.data);
      } catch (fallbackError) {
        console.error('Erro no backup:', fallbackError);
        
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
          error: fallbackError.message
        };
      }
    }
  }
  
  private async callWebhook(url: string, payload: any): Promise<Response> {
    const timeoutId = setTimeout(() => {
      console.log("Timeout de 10 segundos atingido");
    }, 10000);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erro na resposta do webhook: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  private async processWebhookResponse(responseData: any): Promise<any> {
    console.log('Resposta do webhook:', responseData);
    
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
