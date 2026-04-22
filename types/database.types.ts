
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
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'student' | 'parent'
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'student' | 'parent'
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'student' | 'parent'
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          date_of_birth: string | null
          age: number | null
          skill_level: 'beginner' | 'intermediate' | 'advanced' | 'competitive' | null
          chess_rating: number | null
          parent_id: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_email: string | null
          school: string | null
          notes: string | null
          is_active: boolean
          enrolled_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          date_of_birth?: string | null
          age?: number | null
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'competitive' | null
          chess_rating?: number | null
          parent_id?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          school?: string | null
          notes?: string | null
          is_active?: boolean
          enrolled_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          date_of_birth?: string | null
          age?: number | null
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'competitive' | null
          chess_rating?: number | null
          parent_id?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          school?: string | null
          notes?: string | null
          is_active?: boolean
          enrolled_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      fees: {
        Row: {
          id: string
          student_id: string
          month: string
          amount_due: number
          amount_paid: number
          balance: number
          status: 'paid' | 'partially_paid' | 'unpaid'
          due_date: string | null
          paid_date: string | null
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          month: string
          amount_due: number
          amount_paid?: number
          balance: number
          status?: 'paid' | 'partially_paid' | 'unpaid'
          due_date?: string | null
          paid_date?: string | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          month?: string
          amount_due?: number
          amount_paid?: number
          balance?: number
          status?: 'paid' | 'partially_paid' | 'unpaid'
          due_date?: string | null
          paid_date?: string | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          title: string
          session_date: string
          start_time: string
          end_time: string | null
          zoom_link: string | null
          zoom_password: string | null
          description: string | null
          is_recurring: boolean
          recurrence_rule: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          session_date: string
          start_time: string
          end_time?: string | null
          zoom_link?: string | null
          zoom_password?: string | null
          description?: string | null
          is_recurring?: boolean
          recurrence_rule?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          session_date?: string
          start_time?: string
          end_time?: string | null
          zoom_link?: string | null
          zoom_password?: string | null
          description?: string | null
          is_recurring?: boolean
          recurrence_rule?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      session_students: {
        Row: {
          session_id: string
          student_id: string
          created_at: string
        }
        Insert: {
          session_id: string
          student_id: string
          created_at?: string
        }
        Update: {
          session_id?: string
          student_id?: string
          created_at?: string
        }
      }
      recordings: {
        Row: {
          id: string
          session_id: string | null
          title: string
          recording_url: string
          recording_date: string | null
          duration_minutes: number | null
          description: string | null
          is_public: boolean
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          title: string
          recording_url: string
          recording_date?: string | null
          duration_minutes?: number | null
          description?: string | null
          is_public?: boolean
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          title?: string
          recording_url?: string
          recording_date?: string | null
          duration_minutes?: number | null
          description?: string | null
          is_public?: boolean
          uploaded_by?: string | null
          created_at?: string
        }
      }
      recording_access: {
        Row: {
          recording_id: string
          student_id: string
          created_at: string
        }
        Insert: {
          recording_id: string
          student_id: string
          created_at?: string
        }
        Update: {
          recording_id?: string
          student_id?: string
          created_at?: string
        }
      }
      progress_entries: {
        Row: {
          id: string
          student_id: string
          entry_date: string
          skill_level: string | null
          rating_before: number | null
          rating_after: number | null
          game_result: 'win' | 'loss' | 'draw' | 'n/a' | null
          openings_studied: string[] | null
          tactics_topics: string[] | null
          coach_remarks: string
          areas_to_improve: string | null
          homework: string | null
          coach_id: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          entry_date?: string
          skill_level?: string | null
          rating_before?: number | null
          rating_after?: number | null
          game_result?: 'win' | 'loss' | 'draw' | 'n/a' | null
          openings_studied?: string[] | null
          tactics_topics?: string[] | null
          coach_remarks: string
          areas_to_improve?: string | null
          homework?: string | null
          coach_id?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          entry_date?: string
          skill_level?: string | null
          rating_before?: number | null
          rating_after?: number | null
          game_result?: 'win' | 'loss' | 'draw' | 'n/a' | null
          openings_studied?: string[] | null
          tactics_topics?: string[] | null
          coach_remarks?: string
          areas_to_improve?: string | null
          homework?: string | null
          coach_id?: string | null
          session_id?: string | null
          created_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          organizer: string | null
          location: string | null
          tournament_date: string
          end_date: string | null
          format: string | null
          registration_url: string | null
          description: string | null
          status: 'upcoming' | 'ongoing' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          organizer?: string | null
          location?: string | null
          tournament_date: string
          end_date?: string | null
          format?: string | null
          registration_url?: string | null
          description?: string | null
          status?: 'upcoming' | 'ongoing' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          organizer?: string | null
          location?: string | null
          tournament_date?: string
          end_date?: string | null
          format?: string | null
          registration_url?: string | null
          description?: string | null
          status?: 'upcoming' | 'ongoing' | 'completed'
          created_at?: string
        }
      }
      tournament_participants: {
        Row: {
          tournament_id: string
          student_id: string
          rank: number | null
          score: number | null
          performance_rating: number | null
          medal: 'gold' | 'silver' | 'bronze' | 'none' | null
          notes: string | null
          created_at: string
        }
        Insert: {
          tournament_id: string
          student_id: string
          rank?: number | null
          score?: number | null
          performance_rating?: number | null
          medal?: 'gold' | 'silver' | 'bronze' | 'none' | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          tournament_id?: string
          student_id?: string
          rank?: number | null
          score?: number | null
          performance_rating?: number | null
          medal?: 'gold' | 'silver' | 'bronze' | 'none' | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
