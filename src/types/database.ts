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
      users: {
        Row: {
          id: string
          email: string | null
          plan: 'free' | 'pro' | 'premium'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          plan?: 'free' | 'pro' | 'premium'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          plan?: 'free' | 'pro' | 'premium'
          created_at?: string
          updated_at?: string
        }
      }
      content_items: {
        Row: {
          id: string
          user_id: string
          type: 'video' | 'link' | 'image' | 'note'
          title: string
          url: string | null
          content: string | null
          thumbnail: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'video' | 'link' | 'image' | 'note'
          title: string
          url?: string | null
          content?: string | null
          thumbnail?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'video' | 'link' | 'image' | 'note'
          title?: string
          url?: string | null
          content?: string | null
          thumbnail?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mini_functions: {
        Row: {
          id: string
          user_id: string
          function_type: 'news' | 'music' | 'alarm' | 'expense' | 'diary' | 'stocks' | 'commute' | 'food' | 'dday'
          is_enabled: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          function_type: 'news' | 'music' | 'alarm' | 'expense' | 'diary' | 'stocks' | 'commute' | 'food' | 'dday'
          is_enabled?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          function_type?: 'news' | 'music' | 'alarm' | 'expense' | 'diary' | 'stocks' | 'commute' | 'food' | 'dday'
          is_enabled?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      todo_items: {
        Row: {
          id: string
          user_id: string
          title: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_data: {
        Row: {
          id: string
          user_id: string
          data_type: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data_type: string
          data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data_type?: string
          data?: Json
          created_at?: string
          updated_at?: string
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