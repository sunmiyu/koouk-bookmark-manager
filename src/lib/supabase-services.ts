import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Tables = Database['public']['Tables']

// Links Services
export const linksService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(link: Tables['links']['Insert']) {
    const { data, error } = await supabase
      .from('links')
      .insert(link)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['links']['Update']) {
    const { data, error } = await supabase
      .from('links')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Videos Services
export const videosService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(video: Tables['videos']['Insert']) {
    const { data, error } = await supabase
      .from('videos')
      .insert(video)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['videos']['Update']) {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Images Services with Storage support
export const imagesService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async uploadImage(file: File, userId: string): Promise<{ url: string; path: string }> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)
    
    return { url: publicUrl, path: fileName }
  },

  async create(image: Tables['images']['Insert']) {
    const { data, error } = await supabase
      .from('images')
      .insert(image)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createWithUpload(file: File, userId: string, metadata: { title?: string; description?: string; tags?: string[] }) {
    try {
      // Upload image to storage
      const { url, path } = await this.uploadImage(file, userId)
      
      // Create database record
      const imageData: Tables['images']['Insert'] = {
        user_id: userId,
        title: metadata.title || file.name,
        url: url, // Store the public URL in the url field
        file_path: path,
        file_size: file.size,
        mime_type: file.type
      }
      
      return await this.create(imageData)
    } catch (error) {
      console.error('Failed to create image with upload:', error)
      throw error
    }
  },

  async update(id: string, updates: Tables['images']['Update']) {
    const { data, error } = await supabase
      .from('images')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    try {
      // Get image data to find file path
      const { data: image, error: fetchError } = await supabase
        .from('images')
        .select('file_path')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      // Delete from storage if file path exists
      if (image?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([image.file_path])
        
        if (storageError) {
          console.warn('Failed to delete image from storage:', storageError)
        }
      }
      
      // Delete from database
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to delete image:', error)
      throw error
    }
  },

  async deleteImageFile(filePath: string) {
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])
    
    if (error) throw error
  }
}

// Notes Services
export const notesService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(note: Tables['notes']['Insert']) {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['notes']['Update']) {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Expenses Services
export const expensesService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByDate(userId: string, date: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(expense: Tables['expenses']['Insert']) {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['expenses']['Update']) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Diary Entries Services
export const diaryService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(entry: Tables['diary_entries']['Insert']) {
    const { data, error } = await supabase
      .from('diary_entries')
      .insert(entry)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['diary_entries']['Update']) {
    const { data, error } = await supabase
      .from('diary_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Alarms Services
export const alarmsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('alarms')
      .select('*')
      .eq('user_id', userId)
      .order('time', { ascending: true })
    
    if (error) throw error
    return data
  },

  async create(alarm: Tables['alarms']['Insert']) {
    const { data, error } = await supabase
      .from('alarms')
      .insert(alarm)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['alarms']['Update']) {
    const { data, error } = await supabase
      .from('alarms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('alarms')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// D-Day Events Services
export const ddayService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('dday_events')
      .select('*')
      .eq('user_id', userId)
      .order('target_date', { ascending: true })
    
    if (error) throw error
    return data
  },

  async create(event: Tables['dday_events']['Insert']) {
    const { data, error } = await supabase
      .from('dday_events')
      .insert(event)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['dday_events']['Update']) {
    const { data, error } = await supabase
      .from('dday_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('dday_events')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Stock Watchlist Services
export const stocksService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('stock_watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(stock: Tables['stock_watchlist']['Insert']) {
    const { data, error } = await supabase
      .from('stock_watchlist')
      .insert(stock)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['stock_watchlist']['Update']) {
    const { data, error } = await supabase
      .from('stock_watchlist')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('stock_watchlist')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Commute Routes Services
export const commuteService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('commute_routes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(route: Tables['commute_routes']['Insert']) {
    const { data, error } = await supabase
      .from('commute_routes')
      .insert(route)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['commute_routes']['Update']) {
    const { data, error } = await supabase
      .from('commute_routes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('commute_routes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Enhanced Todo Items Services (with new columns)
export const todosService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getByDate(userId: string, date: string) {
    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getRecurring(userId: string) {
    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('user_id', userId)
      .neq('repeat_type', 'none')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getCompleted(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  async create(todo: Tables['todo_items']['Insert']) {
    const { data, error } = await supabase
      .from('todo_items')
      .insert(todo)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['todo_items']['Update']) {
    const { data, error } = await supabase
      .from('todo_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('todo_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async markCompleted(id: string) {
    const { data, error } = await supabase
      .from('todo_items')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async markIncomplete(id: string) {
    const { data, error } = await supabase
      .from('todo_items')
      .update({
        completed: false,
        completed_at: null
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Generate recurring todo instances for a date range
  async generateRecurringTodos(userId: string, startDate: string, endDate: string) {
    try {
      const recurringTodos = await this.getRecurring(userId)
      const generatedTodos: Tables['todo_items']['Insert'][] = []
      
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      for (const template of recurringTodos) {
        const current = new Date(start)
        
        while (current <= end) {
          let shouldGenerate = false
          
          if (template.repeat_type === 'weekly' && template.day_of_week !== null) {
            shouldGenerate = current.getDay() === template.day_of_week
          } else if (template.repeat_type === 'monthly' && template.day_of_month !== null) {
            shouldGenerate = current.getDate() === template.day_of_month
          } else if (template.repeat_type === 'yearly' && template.day_of_year) {
            const dayOfYear = template.day_of_year as { month: number; day: number }
            shouldGenerate = 
              current.getMonth() + 1 === dayOfYear.month && 
              current.getDate() === dayOfYear.day
          }
          
          if (shouldGenerate) {
            const dateStr = current.toISOString().split('T')[0]
            
            // Check if todo already exists for this date
            const existing = await this.getByDate(userId, dateStr)
            const alreadyExists = existing.some(todo => 
              todo.title === template.title && 
              todo.repeat_type === template.repeat_type
            )
            
            if (!alreadyExists) {
              generatedTodos.push({
                user_id: userId,
                title: template.title,
                completed: false,
                date: dateStr,
                repeat_type: template.repeat_type,
                day_of_week: template.day_of_week,
                day_of_month: template.day_of_month,
                day_of_year: template.day_of_year
              })
            }
          }
          
          current.setDate(current.getDate() + 1)
        }
      }
      
      if (generatedTodos.length > 0) {
        const { data, error } = await supabase
          .from('todo_items')
          .insert(generatedTodos)
          .select()
        
        if (error) throw error
        return data
      }
      
      return []
    } catch (error) {
      console.error('Failed to generate recurring todos:', error)
      throw error
    }
  }
}