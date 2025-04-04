
import { createClient } from '@supabase/supabase-js';
import type { Database, Product, Quote, Client } from './database.types';

// Estas variáveis viriam de variáveis de ambiente em um app real
const supabaseUrl = 'https://ehrerbpblmensiodhgka.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocmVyYnBibG1lbnNpb2RoZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTM2NzgsImV4cCI6MjA1NzMyOTY3OH0.Ppae9xwONU2Uy8__0v28OlyFGI6JXBFkMib8AJDwAn8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções auxiliares para trabalhar com o Supabase

// Produtos
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) throw error;
  return data;
}

export async function fetchProductsByCategory(category: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category);
  
  if (error) throw error;
  return data;
}

export async function fetchProductCategories() {
  const { data, error } = await supabase
    .from('products')
    .select('category');
  
  if (error) throw error;
  
  // Extrair categorias únicas
  const categories = [...new Set(data.map(item => item.category))];
  return categories;
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
  try {
    console.log("Iniciando fetchQuotes...");
    
    // Obter usuário atual
    const { data: clientData, error: clientError } = await supabase.auth.getUser();
    
    if (clientError || !clientData.user) {
      console.error("Erro ao obter usuário autenticado:", clientError);
      return null;
    }
    
    const userId = clientData.user.id;
    const userEmail = clientData.user.email;
    
    console.log("Usuário autenticado:", {
      id: userId,
      email: userEmail
    });
    
    // Primeiro, encontre o client_id do usuário na tabela clients
    const { data: clientRecord, error: clientRecordError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();
    
    if (clientRecordError) {
      console.error("Erro ao buscar cliente:", clientRecordError);
      return null;
    }
    
    // Se não encontramos o cliente, podemos tentar criá-lo automaticamente
    if (!clientRecord) {
      console.log("Cliente não encontrado para o usuário:", userEmail);
      console.log("Tentando criar o registro de cliente...");
      
      try {
        // Obter mais dados do usuário se disponíveis
        const displayName = clientData.user.user_metadata?.full_name || userEmail?.split('@')[0] || 'Usuário';
        const phone = clientData.user.phone || '';
        
        // Criar o registro de cliente
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            name: displayName,
            email: userEmail || '',
            phone: phone,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          console.error("Erro ao criar registro de cliente:", createError);
          return [];
        }
        
        console.log("Registro de cliente criado com sucesso:", newClient);
        
        // Continuar a busca com o novo cliente
        const { data: newQuotes, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('client_id', newClient.id)
          .order('created_at', { ascending: false });
        
        if (quotesError) {
          console.error("Erro ao buscar orçamentos para o novo cliente:", quotesError);
          return [];
        }
        
        console.log(`Encontrados ${newQuotes?.length || 0} orçamentos para o novo cliente ID:`, newClient.id);
        return newQuotes || [];
      } catch (error) {
        console.error("Erro ao tentar criar cliente:", error);
        return [];
      }
    }
    
    // Depois, busque todos os orçamentos para esse client_id
    console.log("Cliente encontrado, ID:", clientRecord.id);
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('client_id', clientRecord.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar orçamentos:", error);
      throw error;
    }
    
    // Verificação de dados
    if (!data || !Array.isArray(data)) {
      console.warn("Dados de orçamentos inválidos retornados:", data);
      return [];
    }
    
    // Verificar e corrigir itens para garantir que são válidos
    const sanitizedData = data.map(quote => {
      if (!quote.items || !Array.isArray(quote.items)) {
        console.warn(`Orçamento ${quote.id} tem itens inválidos, corrigindo para array vazio`);
        return { ...quote, items: [] };
      }
      return quote;
    });
    
    console.log(`Encontrados ${sanitizedData.length} orçamentos para o cliente ID:`, clientRecord.id);
    
    if (sanitizedData.length > 0) {
      console.log("Primeiro orçamento:", {
        id: sanitizedData[0].id,
        status: sanitizedData[0].status,
        itemCount: sanitizedData[0].items?.length || 0,
        created_at: sanitizedData[0].created_at
      });
    }
    
    return sanitizedData;
  } catch (error) {
    console.error("Erro crítico na função fetchQuotes:", error);
    throw error;
  }
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

export async function createQuote(quote: Database['public']['Tables']['quotes']['Insert']) {
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateQuote(id: string, updates: Database['public']['Tables']['quotes']['Update']) {
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

export async function fetchClientByPhone(phone: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// Renomeado de createClient para addClient para evitar conflito com o import
export async function addClient(client: Database['public']['Tables']['clients']['Insert']) {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
