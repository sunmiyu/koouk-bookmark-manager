import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      const title = formData.get('title') as string
      const text = formData.get('text') as string
      const url = formData.get('url') as string
      const files = formData.getAll('files') as File[]
      
      // 공유받은 데이터를 세션 스토리지에 임시 저장
      const sharedData = {
        title: title || 'Shared Content',
        text: text || '',
        url: url || '',
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        timestamp: new Date().toISOString(),
        processed: false
      }
      
      // 메인 앱으로 리다이렉트하면서 공유 데이터를 쿼리 파라미터로 전달
      const params = new URLSearchParams()
      params.set('shared', 'true')
      params.set('data', btoa(JSON.stringify(sharedData)))
      
      return NextResponse.redirect(new URL(`/?${params.toString()}`, request.url))
    }
    
    // JSON 형태의 요청 처리
    const body = await request.json()
    const { title, text, url } = body
    
    const sharedData = {
      title: title || 'Shared Content',
      text: text || '',
      url: url || '',
      files: [],
      timestamp: new Date().toISOString(),
      processed: false
    }
    
    const params = new URLSearchParams()
    params.set('shared', 'true')
    params.set('data', btoa(JSON.stringify(sharedData)))
    
    return NextResponse.redirect(new URL(`/?${params.toString()}`, request.url))
    
  } catch (error) {
    console.error('Share processing error:', error)
    
    // 에러 발생 시에도 메인 앱으로 리다이렉트
    return NextResponse.redirect(new URL('/?error=share_failed', request.url))
  }
}

export async function GET(request: NextRequest) {
  // GET 요청은 메인 앱으로 리다이렉트
  return NextResponse.redirect(new URL('/', request.url))
}