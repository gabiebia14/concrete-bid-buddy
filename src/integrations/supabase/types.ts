export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_responses: {
        Row: {
          client_id: string
          conversation_id: string | null
          created_at: string
          id: string
          processed: boolean | null
          quote_id: string | null
          response_json: Json
        }
        Insert: {
          client_id: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          processed?: boolean | null
          quote_id?: string | null
          response_json: Json
        }
        Update: {
          client_id?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          processed?: boolean | null
          quote_id?: string | null
          response_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "agent_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_responses_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
          representante_cpf: string | null
          representante_nome: string | null
          tipo_pessoa: string
        }
        Insert: {
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          representante_cpf?: string | null
          representante_nome?: string | null
          tipo_pessoa?: string
        }
        Update: {
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          representante_cpf?: string | null
          representante_nome?: string | null
          tipo_pessoa?: string
        }
        Relationships: []
      }
      config: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          message_content: string
          metadata: Json | null
          related_quote_id: string | null
          role: string
          session_id: string
          thread_id: string | null
          timestamp: string
          user_email: string | null
          user_id: string | null
          user_phone: string | null
        }
        Insert: {
          id?: string
          message_content: string
          metadata?: Json | null
          related_quote_id?: string | null
          role: string
          session_id: string
          thread_id?: string | null
          timestamp?: string
          user_email?: string | null
          user_id?: string | null
          user_phone?: string | null
        }
        Update: {
          id?: string
          message_content?: string
          metadata?: Json | null
          related_quote_id?: string | null
          role?: string
          session_id?: string
          thread_id?: string | null
          timestamp?: string
          user_email?: string | null
          user_id?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string
          dimensions: string[]
          id: string
          image_url: string | null
          name: string
          type: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          dimensions: string[]
          id?: string
          image_url?: string | null
          name: string
          type?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          dimensions?: string[]
          id?: string
          image_url?: string | null
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      produtos_postes: {
        Row: {
          Modelo: string | null
          Padrao: string | null
          Produto: string | null
          Tamanho: string | null
        }
        Insert: {
          Modelo?: string | null
          Padrao?: string | null
          Produto?: string | null
          Tamanho?: string | null
        }
        Update: {
          Modelo?: string | null
          Padrao?: string | null
          Produto?: string | null
          Tamanho?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          items: Json
          status: string
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          items: Json
          status: string
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          items?: Json
          status?: string
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
