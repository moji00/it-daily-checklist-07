export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_user_data: {
        Row: {
          access_level: string | null
          assigned_tasks: string[] | null
          created_at: string
          full_name: string | null
          id: string
          permissions: string[] | null
          supervisor_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          assigned_tasks?: string[] | null
          created_at?: string
          full_name?: string | null
          id?: string
          permissions?: string[] | null
          supervisor_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          assigned_tasks?: string[] | null
          created_at?: string
          full_name?: string | null
          id?: string
          permissions?: string[] | null
          supervisor_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          daily_checklist_id: string
          description: string
          id: string
          priority: string
          remarks: string | null
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          daily_checklist_id: string
          description: string
          id?: string
          priority: string
          remarks?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          daily_checklist_id?: string
          description?: string
          id?: string
          priority?: string
          remarks?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_daily_checklist_id_fkey"
            columns: ["daily_checklist_id"]
            isOneToOne: false
            referencedRelation: "daily_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          priority: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_checklists: {
        Row: {
          created_at: string
          date: string
          id: string
          overall_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          overall_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          overall_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          checklist_item_id: string
          completed: boolean
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          checklist_item_id: string
          completed?: boolean
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          checklist_item_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          access_level: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          is_active: boolean
          password_hash: string | null
          permissions: string[] | null
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          password_hash?: string | null
          permissions?: string[] | null
          role?: string
          updated_at?: string
          username: string
        }
        Update: {
          access_level?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          password_hash?: string | null
          permissions?: string[] | null
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
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
