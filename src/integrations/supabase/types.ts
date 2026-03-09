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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          admin_id: number
          admin_level: string
          assigned_at: string
          user_id: number
        }
        Insert: {
          admin_id?: number
          admin_level?: string
          assigned_at?: string
          user_id: number
        }
        Update: {
          admin_id?: number
          admin_level?: string
          assigned_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_admin_user"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_admin_user"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      analytics: {
        Row: {
          analytics_id: number
          prompt_id: number
          purchases_count: number
          recorded_date: string
          revenue_total: number
          views_count: number
        }
        Insert: {
          analytics_id?: number
          prompt_id: number
          purchases_count?: number
          recorded_date: string
          revenue_total?: number
          views_count?: number
        }
        Update: {
          analytics_id?: number
          prompt_id?: number
          purchases_count?: number
          recorded_date?: string
          revenue_total?: number
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_analytics_prompt"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      categories: {
        Row: {
          category_id: number
          description: string | null
          icon_url: string | null
          name: string
          parent_category_id: number | null
        }
        Insert: {
          category_id?: number
          description?: string | null
          icon_url?: string | null
          name: string
          parent_category_id?: number | null
        }
        Update: {
          category_id?: number
          description?: string | null
          icon_url?: string | null
          name?: string
          parent_category_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_parent_category"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      moderation_log: {
        Row: {
          action_type: string
          actioned_at: string
          admin_id: number
          log_id: number
          reason: string | null
          target_id: number
          target_type: string
        }
        Insert: {
          action_type: string
          actioned_at?: string
          admin_id: number
          log_id?: number
          reason?: string | null
          target_id: number
          target_type: string
        }
        Update: {
          action_type?: string
          actioned_at?: string
          admin_id?: number
          log_id?: number
          reason?: string | null
          target_id?: number
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_modlog_admin"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["admin_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      prompt_tags: {
        Row: {
          prompt_id: number
          tag_id: number
        }
        Insert: {
          prompt_id: number
          tag_id: number
        }
        Update: {
          prompt_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_pt_prompt"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "fk_pt_tag"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      prompt_versions: {
        Row: {
          change_notes: string | null
          content: string
          created_at: string
          prompt_id: number
          version_id: number
          version_number: number
        }
        Insert: {
          change_notes?: string | null
          content: string
          created_at?: string
          prompt_id: number
          version_id?: number
          version_number?: number
        }
        Update: {
          change_notes?: string | null
          content?: string
          created_at?: string
          prompt_id?: number
          version_id?: number
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_version_prompt"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      prompts: {
        Row: {
          ai_model_target: string | null
          category_id: number
          created_at: string
          creator_id: number
          description: string | null
          price: number
          prompt_id: number
          status: string
          suggested_category: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_model_target?: string | null
          category_id: number
          created_at?: string
          creator_id: number
          description?: string | null
          price?: number
          prompt_id?: number
          status?: string
          suggested_category?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_model_target?: string | null
          category_id?: number
          created_at?: string
          creator_id?: number
          description?: string | null
          price?: number
          prompt_id?: number
          status?: string
          suggested_category?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_prompt_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "fk_prompt_creator"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_prompt_creator"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_paid: number
          buyer_id: number
          payment_status: string
          prompt_id: number
          purchase_id: number
          purchased_at: string
        }
        Insert: {
          amount_paid: number
          buyer_id: number
          payment_status?: string
          prompt_id: number
          purchase_id?: number
          purchased_at?: string
        }
        Update: {
          amount_paid?: number
          buyer_id?: number
          payment_status?: string
          prompt_id?: number
          purchase_id?: number
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_purchase_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_purchase_prompt"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      reviews: {
        Row: {
          buyer_id: number
          comment: string | null
          created_at: string
          is_verified: boolean
          prompt_id: number
          rating: number
          review_id: number
        }
        Insert: {
          buyer_id: number
          comment?: string | null
          created_at?: string
          is_verified?: boolean
          prompt_id: number
          rating: number
          review_id?: number
        }
        Update: {
          buyer_id?: number
          comment?: string | null
          created_at?: string
          is_verified?: boolean
          prompt_id?: number
          rating?: number
          review_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_review_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_review_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_review_prompt"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      tags: {
        Row: {
          name: string
          slug: string
          tag_id: number
        }
        Insert: {
          name: string
          slug: string
          tag_id?: number
        }
        Update: {
          name?: string
          slug?: string
          tag_id?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          is_active: boolean
          profile_bio: string | null
          role: string
          user_id: number
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          is_active?: boolean
          profile_bio?: string | null
          role?: string
          user_id?: number
          username: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          is_active?: boolean
          profile_bio?: string | null
          role?: string
          user_id?: number
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          created_at: string | null
          profile_bio: string | null
          user_id: number | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          profile_bio?: string | null
          user_id?: number | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          profile_bio?: string | null
          user_id?: number | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_approve_review: {
        Args: { p_review_id: number }
        Returns: undefined
      }
      admin_get_analytics: {
        Args: never
        Returns: {
          recorded_date: string
          total_purchases: number
          total_revenue: number
          total_views: number
        }[]
      }
      admin_get_pending_reviews: {
        Args: never
        Returns: {
          buyer_id: number
          buyer_username: string
          comment: string
          created_at: string
          prompt_id: number
          prompt_title: string
          rating: number
          review_id: number
        }[]
      }
      admin_get_prompts: {
        Args: never
        Returns: {
          ai_model_target: string
          created_at: string
          creator_username: string
          description: string
          price: number
          prompt_id: number
          status: string
          title: string
        }[]
      }
      admin_get_summary: {
        Args: never
        Returns: {
          pending_reviews: number
          total_prompts: number
          total_purchases: number
          total_revenue: number
          total_users: number
        }[]
      }
      admin_reject_review: { Args: { p_review_id: number }; Returns: undefined }
      admin_update_prompt_status: {
        Args: { p_prompt_id: number; p_status: string }
        Returns: undefined
      }
      create_prompt:
        | {
            Args: {
              p_ai_model_target: string
              p_category_id: number
              p_content: string
              p_description: string
              p_price: number
              p_title: string
            }
            Returns: number
          }
        | {
            Args: {
              p_ai_model_target: string
              p_category_id: number
              p_content: string
              p_description: string
              p_price: number
              p_suggested_category?: string
              p_title: string
            }
            Returns: number
          }
      get_my_prompts: {
        Args: never
        Returns: {
          ai_model_target: string
          created_at: string
          description: string
          price: number
          prompt_id: number
          status: string
          title: string
        }[]
      }
      get_my_purchases: {
        Args: never
        Returns: {
          amount_paid: number
          payment_status: string
          prompt_id: number
          prompt_title: string
          purchase_id: number
          purchased_at: string
        }[]
      }
      has_purchased: { Args: { p_prompt_id: number }; Returns: boolean }
      has_reviewed: { Args: { p_prompt_id: number }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      purchase_prompt: { Args: { p_prompt_id: number }; Returns: number }
      submit_review: {
        Args: { p_comment: string; p_prompt_id: number; p_rating: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
