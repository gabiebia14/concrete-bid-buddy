
import { v4 as uuidv4 } from 'uuid';

/**
 * Gera um ID de sessão único para o chat
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Obtém a URL final para a função Edge do Supabase
 */
export function getFinalWebhookUrl(webhookUrl?: string): string {
  // Se um webhookUrl for fornecido, use-o
  if (webhookUrl) {
    return webhookUrl;
  }
  
  // Caso contrário, retorne vazio para usar a função Edge padrão
  return '';
}
