export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_categories: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          is_system: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_system?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_system?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      account_transactions: {
        Row: {
          account_category_id: string
          amount_cents: number
          checking_account_id: string
          created_at: string
          description: string
          id: string
          occurred_on: string
          transaction_type: Database["public"]["Enums"]["account_transaction_type"]
          user_id: string
        }
        Insert: {
          account_category_id: string
          amount_cents: number
          checking_account_id: string
          created_at?: string
          description: string
          id?: string
          occurred_on: string
          transaction_type: Database["public"]["Enums"]["account_transaction_type"]
          user_id: string
        }
        Update: {
          account_category_id?: string
          amount_cents?: number
          checking_account_id?: string
          created_at?: string
          description?: string
          id?: string
          occurred_on?: string
          transaction_type?: Database["public"]["Enums"]["account_transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_transactions_account_category_id_user_id_fkey"
            columns: ["account_category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "account_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "account_transactions_checking_account_id_user_id_fkey"
            columns: ["checking_account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "checking_accounts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      card_categories: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      card_events: {
        Row: {
          amount_cents: number
          brl_per_usd_snapshot: number
          card_category_id: string
          card_statement_id: string
          created_at: string
          credit_card_id: string
          description: string
          event_type: Database["public"]["Enums"]["card_event_type"]
          id: string
          occurred_on: string
          parent_card_event_id: string | null
          points_per_usd_snapshot: number
          user_id: string
        }
        Insert: {
          amount_cents: number
          brl_per_usd_snapshot: number
          card_category_id: string
          card_statement_id: string
          created_at?: string
          credit_card_id: string
          description: string
          event_type: Database["public"]["Enums"]["card_event_type"]
          id?: string
          occurred_on: string
          parent_card_event_id?: string | null
          points_per_usd_snapshot: number
          user_id: string
        }
        Update: {
          amount_cents?: number
          brl_per_usd_snapshot?: number
          card_category_id?: string
          card_statement_id?: string
          created_at?: string
          credit_card_id?: string
          description?: string
          event_type?: Database["public"]["Enums"]["card_event_type"]
          id?: string
          occurred_on?: string
          parent_card_event_id?: string | null
          points_per_usd_snapshot?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_events_card_category_id_user_id_fkey"
            columns: ["card_category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "card_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "card_events_card_statement_id_user_id_fkey"
            columns: ["card_statement_id", "user_id"]
            isOneToOne: false
            referencedRelation: "card_statements"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "card_events_credit_card_id_user_id_fkey"
            columns: ["credit_card_id", "user_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "card_events_parent_card_event_id_user_id_fkey"
            columns: ["parent_card_event_id", "user_id"]
            isOneToOne: false
            referencedRelation: "card_events"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      card_statements: {
        Row: {
          closing_date: string
          created_at: string
          credit_card_id: string
          due_date: string
          id: string
          paid_at: string | null
          statement_month: string
          status: Database["public"]["Enums"]["card_statement_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          closing_date: string
          created_at?: string
          credit_card_id: string
          due_date: string
          id?: string
          paid_at?: string | null
          statement_month: string
          status?: Database["public"]["Enums"]["card_statement_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          closing_date?: string
          created_at?: string
          credit_card_id?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          statement_month?: string
          status?: Database["public"]["Enums"]["card_statement_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_statements_credit_card_id_user_id_fkey"
            columns: ["credit_card_id", "user_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      checking_accounts: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          institution: string | null
          name: string
          opening_balance_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          name: string
          opening_balance_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          name?: string
          opening_balance_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          archived_at: string | null
          brl_per_usd: number
          closing_day: number
          created_at: string
          credit_limit_cents: number
          due_day: number
          id: string
          issuer: string | null
          name: string
          points_per_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          brl_per_usd: number
          closing_day: number
          created_at?: string
          credit_limit_cents: number
          due_day: number
          id?: string
          issuer?: string | null
          name: string
          points_per_usd: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          brl_per_usd?: number
          closing_day?: number
          created_at?: string
          credit_limit_cents?: number
          due_day?: number
          id?: string
          issuer?: string | null
          name?: string
          points_per_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_payments: {
        Row: {
          account_transaction_id: string
          amount_cents: number
          card_statement_id: string
          checking_account_id: string
          created_at: string
          id: string
          paid_on: string
          user_id: string
        }
        Insert: {
          account_transaction_id: string
          amount_cents: number
          card_statement_id: string
          checking_account_id: string
          created_at?: string
          id?: string
          paid_on: string
          user_id: string
        }
        Update: {
          account_transaction_id?: string
          amount_cents?: number
          card_statement_id?: string
          checking_account_id?: string
          created_at?: string
          id?: string
          paid_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_account_transaction_id_user_id_fkey"
            columns: ["account_transaction_id", "user_id"]
            isOneToOne: false
            referencedRelation: "account_transactions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "invoice_payments_card_statement_id_user_id_fkey"
            columns: ["card_statement_id", "user_id"]
            isOneToOne: false
            referencedRelation: "card_statements"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "invoice_payments_checking_account_id_user_id_fkey"
            columns: ["checking_account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "checking_accounts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      recurring_bill_occurrences: {
        Row: {
          account_transaction_id: string | null
          created_at: string
          due_date: string
          id: string
          occurrence_month: string
          recurring_bill_id: string
          status: Database["public"]["Enums"]["recurring_occurrence_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_transaction_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          occurrence_month: string
          recurring_bill_id: string
          status?: Database["public"]["Enums"]["recurring_occurrence_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_transaction_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          occurrence_month?: string
          recurring_bill_id?: string
          status?: Database["public"]["Enums"]["recurring_occurrence_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_bill_occurrences_account_transaction_id_user_id_fkey"
            columns: ["account_transaction_id", "user_id"]
            isOneToOne: false
            referencedRelation: "account_transactions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "recurring_bill_occurrences_recurring_bill_id_user_id_fkey"
            columns: ["recurring_bill_id", "user_id"]
            isOneToOne: false
            referencedRelation: "recurring_bills"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      recurring_bills: {
        Row: {
          account_category_id: string
          amount_cents: number
          archived_at: string | null
          checking_account_id: string
          created_at: string
          description: string
          due_day: number
          id: string
          paused_at: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_category_id: string
          amount_cents: number
          archived_at?: string | null
          checking_account_id: string
          created_at?: string
          description: string
          due_day: number
          id?: string
          paused_at?: string | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_category_id?: string
          amount_cents?: number
          archived_at?: string | null
          checking_account_id?: string
          created_at?: string
          description?: string
          due_day?: number
          id?: string
          paused_at?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_bills_account_category_id_user_id_fkey"
            columns: ["account_category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "account_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "recurring_bills_checking_account_id_user_id_fkey"
            columns: ["checking_account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "checking_accounts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      close_due_card_statements: { Args: { p_as_of?: string }; Returns: number }
      create_card_purchase: {
        Args: {
          p_amount_cents: number
          p_card_category_id: string
          p_credit_card_id: string
          p_description: string
          p_occurred_on: string
        }
        Returns: string
      }
      create_chargeback: {
        Args: {
          p_amount_cents: number
          p_card_category_id: string
          p_credit_card_id: string
          p_description: string
          p_occurred_on: string
          p_parent_card_event_id?: string
        }
        Returns: string
      }
      create_installment_purchase: {
        Args: {
          p_card_category_id: string
          p_credit_card_id: string
          p_description: string
          p_installment_count: number
          p_occurred_on: string
          p_total_cents: number
        }
        Returns: string[]
      }
      ensure_recurring_bill_occurrences: {
        Args: { p_through_month: string }
        Returns: number
      }
      get_checking_account_balances: {
        Args: never
        Returns: {
          balance_cents: number
          id: string
          institution: string
          name: string
          opening_balance_cents: number
        }[]
      }
      mark_recurring_bill_paid: {
        Args: { p_occurrence_id: string; p_paid_on: string }
        Returns: string
      }
      pay_card_statement: {
        Args: {
          p_checking_account_id: string
          p_paid_on: string
          p_statement_id: string
        }
        Returns: string
      }
      skip_recurring_bill_occurrence: {
        Args: { p_occurrence_id: string }
        Returns: undefined
      }
    }
    Enums: {
      account_transaction_type:
        | "income"
        | "expense"
        | "recurring_bill_payment"
        | "invoice_payment"
      card_event_type: "purchase" | "installment" | "chargeback"
      card_statement_status: "open" | "closed" | "paid"
      recurring_occurrence_status: "pending" | "paid" | "skipped"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_transaction_type: [
        "income",
        "expense",
        "recurring_bill_payment",
        "invoice_payment",
      ],
      card_event_type: ["purchase", "installment", "chargeback"],
      card_statement_status: ["open", "closed", "paid"],
      recurring_occurrence_status: ["pending", "paid", "skipped"],
    },
  },
} as const

