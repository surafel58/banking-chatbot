export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Utility type to get table row types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          ended_at: string | null
          id: string
          metadata: Json
          session_id: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          metadata?: Json
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          metadata?: Json
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      data_sources: {
        Row: {
          chunk_count: number | null
          created_at: string | null
          error_message: string | null
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          status: string | null
          type: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          chunk_count?: number | null
          created_at?: string | null
          error_message?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          status?: string | null
          type: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          chunk_count?: number | null
          created_at?: string | null
          error_message?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json
          source: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      handoff_queue: {
        Row: {
          assigned_agent_id: string | null
          conversation_id: string | null
          created_at: string | null
          handled_at: string | null
          id: string
          priority: string | null
          reason: string | null
          status: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          handled_at?: string | null
          id?: string
          priority?: string | null
          reason?: string | null
          status?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          handled_at?: string | null
          id?: string
          priority?: string | null
          reason?: string | null
          status?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          confidence: number | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          intent: string | null
          role: string
          tools_used: Json | null
        }
        Insert: {
          confidence?: number | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          role: string
          tools_used?: Json | null
        }
        Update: {
          confidence?: number | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          role?: string
          tools_used?: Json | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          result: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          result: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          result?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      // New banking tables
      demo_accounts: {
        Row: {
          id: string
          user_id: string
          type: 'checking' | 'savings' | 'credit'
          account_number: string
          current_balance: number
          available_balance: number
          pending_amount: number
          currency: string
          credit_limit: number | null
          status: 'active' | 'frozen' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'checking' | 'savings' | 'credit'
          account_number: string
          current_balance?: number
          available_balance?: number
          pending_amount?: number
          currency?: string
          credit_limit?: number | null
          status?: 'active' | 'frozen' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'checking' | 'savings' | 'credit'
          account_number?: string
          current_balance?: number
          available_balance?: number
          pending_amount?: number
          currency?: string
          credit_limit?: number | null
          status?: 'active' | 'frozen' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      demo_transactions: {
        Row: {
          id: string
          account_id: string
          type: 'debit' | 'credit'
          amount: number
          description: string
          category: string | null
          merchant_name: string | null
          status: 'pending' | 'completed' | 'declined'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          type: 'debit' | 'credit'
          amount: number
          description: string
          category?: string | null
          merchant_name?: string | null
          status?: 'pending' | 'completed' | 'declined'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          type?: 'debit' | 'credit'
          amount?: number
          description?: string
          category?: string | null
          merchant_name?: string | null
          status?: 'pending' | 'completed' | 'declined'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_transactions_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "demo_accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      demo_cards: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          card_type: 'debit' | 'credit'
          card_name: string
          last_four: string
          expiry_month: number
          expiry_year: number
          status: 'active' | 'frozen' | 'lost' | 'expired' | 'cancelled'
          daily_limit: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          card_type: 'debit' | 'credit'
          card_name: string
          last_four: string
          expiry_month: number
          expiry_year: number
          status?: 'active' | 'frozen' | 'lost' | 'expired' | 'cancelled'
          daily_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          card_type?: 'debit' | 'credit'
          card_name?: string
          last_four?: string
          expiry_month?: number
          expiry_year?: number
          status?: 'active' | 'frozen' | 'lost' | 'expired' | 'cancelled'
          daily_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_cards_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "demo_accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          date_of_birth: string | null
          is_demo_seeded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          date_of_birth?: string | null
          is_demo_seeded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          date_of_birth?: string | null
          is_demo_seeded?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
