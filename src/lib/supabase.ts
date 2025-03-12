
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These would come from environment variables in a real app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Placeholder for Database type
// This would be generated from your Supabase schema
export type Database = any; 

// Helper functions for working with Supabase

// Products
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

// Quotes
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

export async function createQuote(quote: Omit<any, 'id'>) {
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateQuote(id: string, updates: Partial<any>) {
  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Clients
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

// Chat Sessions
export async function createChatSession(session: Omit<any, 'id'>) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert(session)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function saveChatMessage(message: Omit<any, 'id'>) {
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
