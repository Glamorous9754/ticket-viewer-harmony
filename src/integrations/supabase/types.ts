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
      dashboard_data: {
        Row: {
          created_at: string | null
          db: Json | null
          id: string
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          db?: Json | null
          id?: string
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          db?: Json | null
          id?: string
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_data_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_data_duplicate: {
        Row: {
          business_intelligence_metrics: Json | null
          created_at: string | null
          customer_intelligence_data: Json | null
          feature_requests: Json | null
          id: string
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          business_intelligence_metrics?: Json | null
          created_at?: string | null
          customer_intelligence_data?: Json | null
          feature_requests?: Json | null
          id?: string
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          business_intelligence_metrics?: Json | null
          created_at?: string | null
          customer_intelligence_data?: Json | null
          feature_requests?: Json | null
          id?: string
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_data_duplicate_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gmail_credentials: {
        Row: {
          access_token: string | null
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          profile_id: string
          refresh_token: string | null
          status: Database["public"]["Enums"]["gmail_connection_status"] | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          profile_id: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["gmail_connection_status"] | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          profile_id?: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["gmail_connection_status"] | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gmail_credentials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gmail_tickets: {
        Row: {
          body: string | null
          created_at: string | null
          date: string | null
          from_email: string | null
          id: string
          last_fetched_at: string | null
          profile_id: string
          snippet: string | null
          subject: string | null
          summary: string | null
          thread_id: string
          to_email: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          date?: string | null
          from_email?: string | null
          id?: string
          last_fetched_at?: string | null
          profile_id: string
          snippet?: string | null
          subject?: string | null
          summary?: string | null
          thread_id: string
          to_email?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          date?: string | null
          from_email?: string | null
          id?: string
          last_fetched_at?: string | null
          profile_id?: string
          snippet?: string | null
          subject?: string | null
          summary?: string | null
          thread_id?: string
          to_email?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gmail_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          platform_type: Database["public"]["Enums"]["platform_type"]
          profile_id: string
          state: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          platform_type: Database["public"]["Enums"]["platform_type"]
          profile_id: string
          state: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          platform_type?: Database["public"]["Enums"]["platform_type"]
          profile_id?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_states_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_connections: {
        Row: {
          auth_tokens: Json
          created_at: string
          id: string
          is_active: boolean
          last_fetched_at: string
          platform_name: string
          platform_type: Database["public"]["Enums"]["platform_type"]
          profile_id: string
          updated_at: string
        }
        Insert: {
          auth_tokens: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_fetched_at?: string
          platform_name: string
          platform_type?: Database["public"]["Enums"]["platform_type"]
          profile_id: string
          updated_at?: string
        }
        Update: {
          auth_tokens?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_fetched_at?: string
          platform_name?: string
          platform_type?: Database["public"]["Enums"]["platform_type"]
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_connections_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_connections_profile_id_fkey1"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          agent_id: string | null
          created_at: string
          created_date: string
          customer_id: string | null
          external_ticket_id: string
          id: string
          last_fetched_at: string
          platform_connection_id: string | null
          profile_id: string
          resolved_date: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subjects: Json | null
          summary: string | null
          thread: string | null
          updated_at: string
          web_url: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          created_date: string
          customer_id?: string | null
          external_ticket_id: string
          id?: string
          last_fetched_at?: string
          platform_connection_id?: string | null
          profile_id: string
          resolved_date?: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subjects?: Json | null
          summary?: string | null
          thread?: string | null
          updated_at?: string
          web_url?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          created_date?: string
          customer_id?: string | null
          external_ticket_id?: string
          id?: string
          last_fetched_at?: string
          platform_connection_id?: string | null
          profile_id?: string
          resolved_date?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subjects?: Json | null
          summary?: string | null
          thread?: string | null
          updated_at?: string
          web_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_platform_connection_id_fkey"
            columns: ["platform_connection_id"]
            isOneToOne: false
            referencedRelation: "platform_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zendesk_credentials: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          profile_id: string | null
          refresh_token: string | null
          status:
            | Database["public"]["Enums"]["zendesk_connection_status"]
            | null
          subdomain: string | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          profile_id?: string | null
          refresh_token?: string | null
          status?:
            | Database["public"]["Enums"]["zendesk_connection_status"]
            | null
          subdomain?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          profile_id?: string | null
          refresh_token?: string | null
          status?:
            | Database["public"]["Enums"]["zendesk_connection_status"]
            | null
          subdomain?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zendesk_credentials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zoho_credentials: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          org_id: string | null
          profile_id: string
          refresh_token: string | null
          status: Database["public"]["Enums"]["zoho_connection_status"] | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          org_id?: string | null
          profile_id: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["zoho_connection_status"] | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          org_id?: string | null
          profile_id?: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["zoho_connection_status"] | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zoho_credentials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gmail_connection_status:
        | "active"
        | "inactive"
        | "expired"
        | "pending"
        | "connected"
      platform_type: "freshdesk" | "zoho_desk" | "zendesk" | "gmail"
      ticket_status:
        | "Open"
        | "Closed"
        | "In_Progress"
        | "open"
        | "pending"
        | "hold"
        | "solved"
        | "closed"
        | "Resolved"
        | '"On Hold"'
        | "On Hold"
      zendesk_connection_status:
        | "active"
        | "inactive"
        | "expired"
        | "pending"
        | "connected"
      zoho_connection_status:
        | "active"
        | "expired"
        | "invalid"
        | "pending"
        | "connected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
