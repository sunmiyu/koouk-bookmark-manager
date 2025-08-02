import { supabase } from '@/lib/supabase'

export interface UploadResult {
  url: string
  path: string
  size: number
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadImage(file: File, userId: string): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Please upload images smaller than 5MB.')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error('Failed to upload image. Please try again.')
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
      size: file.size
    }
  } catch (error) {
    console.error('Image upload failed:', error)
    throw error
  }
}

export async function deleteImage(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      throw new Error('Failed to delete image.')
    }
  } catch (error) {
    console.error('Image deletion failed:', error)
    throw error
  }
}

export function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original file
          }
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}