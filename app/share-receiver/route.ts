import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract shared data
    const title = formData.get('title') as string
    const text = formData.get('text') as string
    const url = formData.get('url') as string
    const files = formData.getAll('media') as File[]

    // Build query parameters for the main app
    const params = new URLSearchParams()
    
    if (title) params.set('title', title)
    if (text) params.set('text', text)
    if (url) params.set('url', url)
    
    // Handle files (for future implementation)
    if (files.length > 0) {
      // For now, we'll just pass along file info
      params.set('hasFiles', 'true')
      params.set('fileCount', files.length.toString())
    }

    // Redirect to main app with shared data
    const redirectUrl = `/?shared=true&${params.toString()}`
    
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error('Error handling shared content:', error)
    
    // Fallback: redirect to main app
    return NextResponse.redirect(new URL('/?error=share_failed', request.url))
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ message: 'Share receiver endpoint is working' })
}