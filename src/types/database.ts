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
          email: string
          name: string | null
          avatar_url: string | null
          user_plan: 'free' | 'pro' | 'premium'
          plan_expires_at: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          user_plan?: 'free' | 'pro' | 'premium'
          plan_expires_at?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          user_plan?: 'free' | 'pro' | 'premium'
          plan_expires_at?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          parent_id: string | null
          color: string
          icon: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          parent_id?: string | null
          color?: string
          icon?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          parent_id?: string | null
          color?: string
          icon?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      storage_items: {
        Row: {
          id: string
          user_id: string
          folder_id: string
          name: string
          type: 'url' | 'image' | 'video' | 'document' | 'memo'
          content: string
          url: string | null
          thumbnail: string | null
          tags: string[]
          description: string | null
          word_count: number | null
          metadata: Json
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id: string
          name: string
          type: 'url' | 'image' | 'video' | 'document' | 'memo'
          content: string
          url?: string | null
          thumbnail?: string | null
          tags?: string[]
          description?: string | null
          word_count?: number | null
          metadata?: Json
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string
          name?: string
          type?: 'url' | 'image' | 'video' | 'document' | 'memo'
          content?: string
          url?: string | null
          thumbnail?: string | null
          tags?: string[]
          description?: string | null
          word_count?: number | null
          metadata?: Json
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          title: string
          url: string
          description: string | null
          thumbnail: string | null
          category: string | null
          tags: string[]
          is_favorite: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          url: string
          description?: string | null
          thumbnail?: string | null
          category?: string | null
          tags?: string[]
          is_favorite?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          url?: string
          description?: string | null
          thumbnail?: string | null
          category?: string | null
          tags?: string[]
          is_favorite?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      shared_folders: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          title: string
          description: string
          cover_image: string | null
          category: 'tech' | 'lifestyle' | 'food' | 'travel' | 'study' | 'work' | 'entertainment' | 'health' | 'investment' | 'parenting'
          tags: string[]
          is_public: boolean
          stats: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          title: string
          description: string
          cover_image?: string | null
          category: 'tech' | 'lifestyle' | 'food' | 'travel' | 'study' | 'work' | 'entertainment' | 'health' | 'investment' | 'parenting'
          tags?: string[]
          is_public?: boolean
          stats?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          title?: string
          description?: string
          cover_image?: string | null
          category?: 'tech' | 'lifestyle' | 'food' | 'travel' | 'study' | 'work' | 'entertainment' | 'health' | 'investment' | 'parenting'
          tags?: string[]
          is_public?: boolean
          stats?: Json
          created_at?: string
          updated_at?: string
        }
      }
      folder_imports: {
        Row: {
          id: string
          user_id: string
          original_shared_folder_id: string | null
          imported_folder_id: string
          imported_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_shared_folder_id?: string | null
          imported_folder_id: string
          imported_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_shared_folder_id?: string | null
          imported_folder_id?: string
          imported_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          type: 'bug' | 'feature' | 'general' | 'complaint'
          subject: string
          message: string
          status: 'pending' | 'in_progress' | 'resolved' | 'closed'
          admin_response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: 'bug' | 'feature' | 'general' | 'complaint'
          subject: string
          message: string
          status?: 'pending' | 'in_progress' | 'resolved' | 'closed'
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: 'bug' | 'feature' | 'general' | 'complaint'
          subject?: string
          message?: string
          status?: 'pending' | 'in_progress' | 'resolved' | 'closed'
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          last_active_tab: 'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks'
          selected_folder_id: string | null
          view_mode: 'grid' | 'list'
          sort_by: 'recent' | 'name' | 'type'
          theme: 'light' | 'dark' | 'system'
          language: 'en' | 'ko'
          pwa_install_dismissed_at: string | null
          visit_count: number
          cross_platform_state: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          last_active_tab?: 'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks'
          selected_folder_id?: string | null
          view_mode?: 'grid' | 'list'
          sort_by?: 'recent' | 'name' | 'type'
          theme?: 'light' | 'dark' | 'system'
          language?: 'en' | 'ko'
          pwa_install_dismissed_at?: string | null
          visit_count?: number
          cross_platform_state?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          last_active_tab?: 'dashboard' | 'my-folder' | 'marketplace' | 'bookmarks'
          selected_folder_id?: string | null
          view_mode?: 'grid' | 'list'
          sort_by?: 'recent' | 'name' | 'type'
          theme?: 'light' | 'dark' | 'system'
          language?: 'en' | 'ko'
          pwa_install_dismissed_at?: string | null
          visit_count?: number
          cross_platform_state?: Json
          created_at?: string
          updated_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          search_query: string
          search_scope: 'my-folder' | 'marketplace' | 'bookmarks' | 'all'
          results_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          search_query: string
          search_scope: 'my-folder' | 'marketplace' | 'bookmarks' | 'all'
          results_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          search_query?: string
          search_scope?: 'my-folder' | 'marketplace' | 'bookmarks' | 'all'
          results_count?: number
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          device_info: Json
          session_data: Json
          last_active: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          device_info?: Json
          session_data?: Json
          last_active?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_info?: Json
          session_data?: Json
          last_active?: string
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}