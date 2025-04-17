export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          avatar: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          avatar?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          avatar?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      financial_summaries: {
        Row: {
          id: string
          user_id: string
          current_balance: number
          health_status: string
          monthly_income: number
          monthly_expenses: number
          recurring_payments: number
          daily_budget_remaining: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          current_balance?: number
          health_status?: string
          monthly_income?: number
          monthly_expenses?: number
          recurring_payments?: number
          daily_budget_remaining?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          current_balance?: number
          health_status?: string
          monthly_income?: number
          monthly_expenses?: number
          recurring_payments?: number
          daily_budget_remaining?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          date: string
          description: string
          category: string
          is_recurring: boolean | null
          transaction_type: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          date: string
          description: string
          category: string
          is_recurring?: boolean | null
          transaction_type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          date?: string
          description?: string
          category?: string
          is_recurring?: boolean | null
          transaction_type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      recurring_payments: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          date: number
          category: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          date: number
          category: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          date?: number
          category?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      financial_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string
          category: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date: string
          category: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string
          category?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          notifications_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string | null
          notifications_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string | null
          notifications_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
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
  }
}
