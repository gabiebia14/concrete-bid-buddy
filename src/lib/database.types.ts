
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          type: string | null
          dimensions: string | string[]
          image_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          type?: string | null
          dimensions: string | string[]
          image_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          type?: string | null
          dimensions?: string | string[]
          image_url?: string
          created_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          client_id: string
          status: 'draft' | 'pending' | 'approved' | 'rejected'
          items: QuoteItem[]
          created_at: string
          updated_at: string
          total_value?: number
        }
        Insert: {
          id?: string
          client_id: string
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          items: QuoteItem[]
          created_at?: string
          updated_at?: string
          total_value?: number
        }
        Update: {
          id?: string
          client_id?: string
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          items?: QuoteItem[]
          created_at?: string
          updated_at?: string
          total_value?: number
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address?: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          created_at?: string
        }
      }
      agent_configs: {
        Row: {
          id: string
          title: string
          sistema_principal: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          sistema_principal: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          sistema_principal?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
  }
}

// Tipos adicionais para o aplicativo
export type Product = Database['public']['Tables']['products']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Quote = Database['public']['Tables']['quotes']['Row']
export type AgentConfig = Database['public']['Tables']['agent_configs']['Row']

export type QuoteItem = {
  product_id: string
  product_name: string
  dimensions: string
  quantity: number
  unit_price?: number
  total_price?: number
}
