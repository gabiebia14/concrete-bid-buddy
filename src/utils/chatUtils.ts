
import { v4 as uuidv4 } from 'uuid';

/**
 * Gera um ID de sessão único para o chat
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Formata a URL do webhook para garantir que seja válida
 */
export function formatWebhookUrl(url?: string): string {
  if (!url) {
    return "https://gbservin8n.sevirenostrinta.com.br/webhook-test/chat-assistant";
  }
  
  // Verifica se a URL tem o protocolo
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}

/**
 * Obtém a URL final com base na configuração de proxy
 */
export function getFinalWebhookUrl(webhookUrl?: string, useProxy: boolean = true): string {
  if (webhookUrl) {
    return webhookUrl;
  }
  
  return useProxy 
    ? `/api/n8n/chat-assistant` 
    : formatWebhookUrl(localStorage.getItem('chatWebhookUrl') || undefined);
}

/**
 * Formata o payload para o formato esperado pelo n8n
 */
export function formatPayloadForN8n(data: any): any {
  // O n8n espera que os dados estejam dentro de um objeto "body"
  return {
    body: data
  };
}
