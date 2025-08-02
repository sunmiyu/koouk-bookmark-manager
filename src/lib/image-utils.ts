/**
 * Image compression and optimization utilities
 */

export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeInMB?: number
  outputFormat?: 'webp' | 'jpeg' | 'png'
}

export interface ImageValidationResult {
  isValid: boolean
  error?: string
  file?: File
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.'
    }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File too large. Maximum size is 10MB.'
    }
  }

  return { isValid: true, file }
}

/**
 * Compress image file
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeInMB = 2,
    outputFormat = 'webp'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img
        
        // Maintain aspect ratio while fitting within max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Check if compressed size meets requirements
            const sizeInMB = blob.size / (1024 * 1024)
            if (sizeInMB > maxSizeInMB) {
              // If still too large, try with lower quality
              const newQuality = Math.max(0.3, quality * 0.7)
              if (newQuality < quality) {
                // Recursive compression with lower quality
                compressImage(file, { ...options, quality: newQuality })
                  .then(resolve)
                  .catch(reject)
                return
              }
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              `${file.name.split('.')[0]}.${outputFormat}`,
              {
                type: `image/${outputFormat}`,
                lastModified: Date.now()
              }
            )

            resolve(compressedFile)
          },
          `image/${outputFormat}`,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Load image
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Generate image thumbnail
 */
export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Set square canvas
        canvas.width = size
        canvas.height = size

        // Calculate crop dimensions for square thumbnail
        const { width, height } = img
        const minDimension = Math.min(width, height)
        const scale = size / minDimension
        
        const scaledWidth = width * scale
        const scaledHeight = height * scale
        
        const offsetX = (size - scaledWidth) / 2
        const offsetY = (size - scaledHeight) / 2

        // Draw cropped and scaled image
        ctx?.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

        // Convert to data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(thumbnailDataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to generate thumbnail'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to get image dimensions'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Convert file to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      resolve(reader.result as string)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to convert file to base64'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}