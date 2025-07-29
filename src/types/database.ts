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
          date: string | null
          completed_at: string | null
          repeat_type: 'none' | 'weekly' | 'monthly' | 'yearly'
          day_of_week: number | null
          day_of_month: number | null
          day_of_year: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          completed?: boolean
          date?: string | null
          completed_at?: string | null
          repeat_type?: 'none' | 'weekly' | 'monthly' | 'yearly'
          day_of_week?: number | null
          day_of_month?: number | null
          day_of_year?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          completed?: boolean
          date?: string | null
          completed_at?: string | null
          repeat_type?: 'none' | 'weekly' | 'monthly' | 'yearly'
          day_of_week?: number | null
          day_of_month?: number | null
          day_of_year?: Json | null
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
      links: {
        Row: {
          id: string
          user_id: string
          title: string
          url: string
          description: string | null
          favicon_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          url: string
          description?: string | null
          favicon_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          url?: string
          description?: string | null
          favicon_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          user_id: string
          title: string
          url: string
          thumbnail_url: string | null
          duration: string | null
          platform: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          url: string
          thumbnail_url?: string | null
          duration?: string | null
          platform?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          url?: string
          thumbnail_url?: string | null
          duration?: string | null
          platform?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          user_id: string
          title: string | null
          url: string
          file_path: string | null
          file_size: number | null
          mime_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          url: string
          file_path?: string | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          url?: string
          file_path?: string | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          category: string | null
          type: 'expense' | 'income'
          date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          category?: string | null
          type?: 'expense' | 'income'
          date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          category?: string | null
          type?: 'expense' | 'income'
          date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      diary_entries: {
        Row: {
          id: string
          user_id: string
          content: string
          mood: string | null
          date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          mood?: string | null
          date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          mood?: string | null
          date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      alarms: {
        Row: {
          id: string
          user_id: string
          time: string
          label: string
          enabled: boolean
          repeat_days: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          time: string
          label: string
          enabled?: boolean
          repeat_days?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          time?: string
          label?: string
          enabled?: boolean
          repeat_days?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      dday_events: {
        Row: {
          id: string
          user_id: string
          name: string
          target_date: string
          category: string | null
          is_important: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_date: string
          category?: string | null
          is_important?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_date?: string
          category?: string | null
          is_important?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stock_watchlist: {
        Row: {
          id: string
          user_id: string
          symbol: string
          name: string
          market: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          name: string
          market?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          name?: string
          market?: string | null
          created_at?: string
        }
      }
      commute_routes: {
        Row: {
          id: string
          user_id: string
          name: string
          origin: string
          destination: string
          duration: number | null
          distance: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          origin: string
          destination: string
          duration?: number | null
          distance?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          origin?: string
          destination?: string
          duration?: number | null
          distance?: number | null
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