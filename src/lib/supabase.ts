
import { createClient } from '@supabase/supabase-js';
import type { Database, Product, Quote, Client, ChatSession, ChatMessage, QuoteItem } from './database.types';

// Estas variáveis viriam de variáveis de ambiente em um app real
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Funções auxiliares para trabalhar com o Supabase

// Produtos
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) throw error;
  return data;
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// Orçamentos
export async function fetchQuotes() {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function fetchQuoteById(id: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createQuote(quote: Omit<Quote, 'id'>) {
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateQuote(id: string, updates: Partial<Quote>) {
  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Clientes
export async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function fetchClientById(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// Sessões de Chat
export async function createChatSession(session: Omit<ChatSession, 'id'>) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert(session)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function saveChatMessage(message: Omit<ChatMessage, 'id'>) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(message)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function fetchChatSessionById(id: string) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*, chat_messages(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}
