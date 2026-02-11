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
      coding_problems: {
        Row: {
          company_tags: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          id: string
          solution: Json | null
          test_cases: Json | null
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          company_tags?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty: string
          id?: string
          solution?: Json | null
          test_cases?: Json | null
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          company_tags?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          solution?: Json | null
          test_cases?: Json | null
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coding_submissions: {
        Row: {
          code: string
          id: string
          language: string
          problem_id: string
          score: number | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          code?: string
          id?: string
          language?: string
          problem_id: string
          score?: number | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          language?: string
          problem_id?: string
          score?: number | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          upvotes: number
          user_id: string
          views: number
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
          views?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          college: string | null
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
          year: string | null
        }
        Insert: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
          year?: string | null
        }
        Update: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      speech_sessions: {
        Row: {
          ai_feedback: string | null
          confidence_score: number | null
          created_at: string
          filler_count: number | null
          fluency_score: number | null
          grammar_score: number | null
          id: string
          question: string
          transcript: string | null
          user_id: string
          wpm: number | null
        }
        Insert: {
          ai_feedback?: string | null
          confidence_score?: number | null
          created_at?: string
          filler_count?: number | null
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          question: string
          transcript?: string | null
          user_id: string
          wpm?: number | null
        }
        Update: {
          ai_feedback?: string | null
          confidence_score?: number | null
          created_at?: string
          filler_count?: number | null
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          question?: string
          transcript?: string | null
          user_id?: string
          wpm?: number | null
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          score: number | null
          started_at: string
          test_id: string
          total_questions: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          test_id: string
          total_questions?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          test_id?: string
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          id: string
          questions: Json
          time_limit: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty: string
          id?: string
          questions?: Json
          time_limit?: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          questions?: Json
          time_limit?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          activity_count: number | null
          avatar_url: string | null
          department: string | null
          name: string | null
          problems_solved: number | null
          total_score: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
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
      app_role: "student" | "admin"
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
      app_role: ["student", "admin"],
    },
  },
} as const
