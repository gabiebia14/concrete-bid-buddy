
import { v4 as uuidv4 } from 'uuid';

/**
 * Gera um ID de sessão único para o chat
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Verifica se uma sessão de chat existe no localStorage
 */
export function chatSessionExists(): boolean {
  return !!localStorage.getItem('chatSessionId');
}

/**
 * Obtém o ID da sessão atual ou cria um novo
 */
export function getOrCreateSessionId(): string {
  const existingId = localStorage.getItem('chatSessionId');
  if (existingId) return existingId;
  
  const newId = uuidv4();
  localStorage.setItem('chatSessionId', newId);
  return newId;
}
