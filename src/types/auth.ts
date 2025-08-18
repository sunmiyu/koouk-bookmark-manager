export interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export interface AuthState {
  user: User | null
  loading: boolean
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}

export interface AuthContextType extends AuthState {
  signIn: () => void
  signOut: () => void
  userSettings: UserSettings | null
  setUserSettings: (settings: UserSettings) => void
}

export interface UserSettings {
  id: string
  user_id: string
  last_active_tab: string
  selected_folder_id: string | null
  view_mode: 'grid' | 'list'
  sort_by: 'recent' | 'name' | 'type'
  theme: 'light' | 'dark'
  language: string
  pwa_install_dismissed_at: string | null
  visit_count: number
  cross_platform_state: Record<string, any>
  created_at: string
  updated_at: string
}