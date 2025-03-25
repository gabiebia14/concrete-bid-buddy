import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageItem } from '@/components/chat/ChatMessage';
import { Send, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

// URL do webhook corrigida
const WEBHOOK_URL = "https://gbservin8n.sevirenostrinta.com.br/webhook-test/chat-assistant";

const ChatAssistant = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showUserInfoForm, setShowUserInfoForm] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const { toast } = useToast();
  
  // Carregar ou criar ID de sessão ao montar o componente
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      
      // Carregar mensagens anteriores se houver uma sessão existente
      loadPreviousMessages(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    }
    
    // Verificar se já temos informações do usuário salvas
    const storedUserInfo = localStorage.getItem('chatUserInfo');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
        setShowUserInfoForm(false);
      } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
      }
    }
    
    // Verificar se o usuário está autenticado
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        // Se o usuário estiver autenticado, use as informações dele
        const userMetadata = data.user.user_metadata || {};
        setUserInfo({
          name: userMetadata.full_name || data.user.email?.split('@')[0] || '',
          email: data.user.email || '',
          phone: userMetadata.phone || ''
        });
        setShowUserInfoForm(false);
        
        // Salvar as informações no localStorage
        localStorage.setItem('chatUserInfo', JSON.stringify({
          name: userMetadata.full_name || data.user.email?.split('@')[0] || '',
          email: data.user.email || '',
          phone: userMetadata.phone || ''
        }));
      }
    };
    
    checkAuth();
  }, []);
  
  // Função para carregar mensagens anteriores
  const loadPreviousMessages = async (sid: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sid)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens anteriores:', error);
    }
  };
  
  // Função para salvar informações do usuário
  const handleSaveUserInfo = () => {
    // Validar se temos pelo menos nome e email ou telefone
    if (!userInfo.name || (!userInfo.email && !userInfo.phone)) {
      toast({
        variant: 'destructive',
        title: 'Informações incompletas',
        description: 'Por favor, informe seu nome e pelo menos um contato (email ou telefone).'
      });
      return;
    }
    
    // Salvar no localStorage
    localStorage.setItem('chatUserInfo', JSON.stringify(userInfo));
    setShowUserInfoForm(false);
    
    // Mensagem de boas-vindas
    const welcomeMessage = {
      id: uuidv4(),
      content: 'Olá! Sou o assistente da IPT Teixeira. Como posso ajudá-lo hoje?',
      role: 'assistant',
      created_at: new Date().toISOString(),
      session_id: sessionId
    };
    
    setMessages([welcomeMessage]);
  };
  
  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Criar objeto de mensagem do usuário
      const userMessage = {
        id: uuidv4(),
        content: inputMessage,
        role: 'user',
        created_at: new Date().toISOString(),
        session_id: sessionId
      };
      
      // Adicionar mensagem do usuário à lista
      setMessages(prev => [...prev, userMessage]);
      
      // Preparar payload para o webhook
      const payload = {
        body: {
          message: inputMessage,
          sessionId: sessionId,
          source: 'web',
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone
        }
      };
      
      console.log('Enviando mensagem para webhook:', payload);
      
      // Enviar mensagem para webhook
      const response = await fetch(WEBHOOK_URL, {
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
      
      // Adicionar resposta do assistente à lista
      const assistantMessage = {
        id: uuidv4(),
        content: responseData.message || 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        role: 'assistant',
        created_at: new Date().toISOString(),
        session_id: sessionId
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Limpar a mensagem de entrada
      setInputMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível conectar ao serviço de assistente.'
      });
      
      // Mensagem de erro
      const errorMessage = {
        id: uuidv4(),
        content: 'Desculpe, estou enfrentando problemas técnicos no momento. Nossa equipe já foi notificada. Por favor, tente novamente em instantes.',
        role: 'assistant',
        created_at: new Date().toISOString(),
        session_id: sessionId
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Lidar com tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Rolar para a mensagem mais recente
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <Card className="h-[70vh] flex flex-col">
          <CardHeader>
            <CardTitle>Assistente IPT Teixeira</CardTitle>
            <CardDescription>Tire suas dúvidas e solicite orçamentos</CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden">
            {showUserInfoForm ? (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-medium">Antes de começarmos, por favor informe seus dados:</h3>
                <div className="space-y-2">
                  <Input 
                    placeholder="Seu nome"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input 
                    placeholder="Seu e-mail"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input 
                    placeholder="Seu telefone"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Button onClick={handleSaveUserInfo} className="w-full">
                    Começar conversa
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <p>Faça uma pergunta para começar a conversa</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <MessageItem key={msg.id} message={msg} />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </CardContent>
          
          {!showUserInfoForm && (
            <CardFooter className="border-t p-4">
              <div className="flex w-full space-x-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ChatAssistant;
