export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          amount: number | null
          assigned_broker_id: string | null
          completed_at: string | null
          created_at: string
          developer_id: string
          financial_statements: Json | null
          funding_requirements: Json | null
          id: string
          project_details: Json | null
          status: Database["public"]["Enums"]["application_status"]
          status_timeline: Json | null
          submitted_at: string | null
          tenant_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          assigned_broker_id?: string | null
          completed_at?: string | null
          created_at?: string
          developer_id: string
          financial_statements?: Json | null
          funding_requirements?: Json | null
          id?: string
          project_details?: Json | null
          status?: Database["public"]["Enums"]["application_status"]
          status_timeline?: Json | null
          submitted_at?: string | null
          tenant_id?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          assigned_broker_id?: string | null
          completed_at?: string | null
          created_at?: string
          developer_id?: string
          financial_statements?: Json | null
          funding_requirements?: Json | null
          id?: string
          project_details?: Json | null
          status?: Database["public"]["Enums"]["application_status"]
          status_timeline?: Json | null
          submitted_at?: string | null
          tenant_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      developer_profiles: {
        Row: {
          company_address: string | null
          company_name: string | null
          company_registration_number: string | null
          consent_captured_at: string | null
          created_at: string
          credas_entity_id: string | null
          credas_journey_id: string | null
          credas_process_id: string | null
          id: string
          kyc_checked_at: string | null
          kyc_status: Database["public"]["Enums"]["verification_status"]
          project_history: Json | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
          verification_completed_at: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          years_experience: number | null
        }
        Insert: {
          company_address?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          consent_captured_at?: string | null
          created_at?: string
          credas_entity_id?: string | null
          credas_journey_id?: string | null
          credas_process_id?: string | null
          id?: string
          kyc_checked_at?: string | null
          kyc_status?: Database["public"]["Enums"]["verification_status"]
          project_history?: Json | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
          verification_completed_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Update: {
          company_address?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          consent_captured_at?: string | null
          created_at?: string
          credas_entity_id?: string | null
          credas_journey_id?: string | null
          credas_process_id?: string | null
          id?: string
          kyc_checked_at?: string | null
          kyc_status?: Database["public"]["Enums"]["verification_status"]
          project_history?: Json | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
          verification_completed_at?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          application_id: string | null
          created_at: string
          document_type: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_encrypted: boolean
          owner_id: string
          profile_link: boolean | null
          storage_path: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          document_type?: string
          file_name: string
          file_size?: number
          file_type: string
          id?: string
          is_encrypted?: boolean
          owner_id: string
          profile_link?: boolean | null
          storage_path: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_encrypted?: boolean
          owner_id?: string
          profile_link?: boolean | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      integration_events: {
        Row: {
          application_id: string
          created_at: string
          id: string
          last_attempted_at: string | null
          payload: Json | null
          response: Json | null
          retry_count: number | null
          status: Database["public"]["Enums"]["integration_status"]
          target: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          last_attempted_at?: string | null
          payload?: Json | null
          response?: Json | null
          retry_count?: number | null
          status?: Database["public"]["Enums"]["integration_status"]
          target?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          last_attempted_at?: string | null
          payload?: Json | null
          response?: Json | null
          retry_count?: number | null
          status?: Database["public"]["Enums"]["integration_status"]
          target?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      message_thread_participants: {
        Row: {
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          tenant_id: string | null
          updated_at: string
          visibility: string
          watermark_enabled: boolean | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          tenant_id?: string | null
          updated_at?: string
          visibility?: string
          watermark_enabled?: boolean | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          tenant_id?: string | null
          updated_at?: string
          visibility?: string
          watermark_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          application_template: Json | null
          created_at: string
          email_template_branding: Json | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          portal_name: string | null
          primary_color: string
          secondary_color: string
          slug: string
          updated_at: string
          verification_requirements: Json | null
        }
        Insert: {
          application_template?: Json | null
          created_at?: string
          email_template_branding?: Json | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          portal_name?: string | null
          primary_color?: string
          secondary_color?: string
          slug: string
          updated_at?: string
          verification_requirements?: Json | null
        }
        Update: {
          application_template?: Json | null
          created_at?: string
          email_template_branding?: Json | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          portal_name?: string | null
          primary_color?: string
          secondary_color?: string
          slug?: string
          updated_at?: string
          verification_requirements?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "central_admin" | "developer" | "broker"
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "info_requested"
        | "approved"
        | "declined"
        | "completed"
      integration_status: "queued" | "sent" | "failed" | "resent"
      verification_status:
        | "not_started"
        | "in_progress"
        | "passed"
        | "failed"
        | "manual_review"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "central_admin", "developer", "broker"],
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "info_requested",
        "approved",
        "declined",
        "completed",
      ],
      integration_status: ["queued", "sent", "failed", "resent"],
      verification_status: [
        "not_started",
        "in_progress",
        "passed",
        "failed",
        "manual_review",
      ],
    },
  },
} as const
