import { NextResponse } from 'next/server'

// Personal Storage Hub용 - Market API 간소화
export async function GET() {
  try {
    // Personal Storage Hub에서는 주식 정보를 사용하지 않으므로 비활성화
    return NextResponse.json({ 
      success: true,
      data: [],
      count: 0,
      source: 'disabled',
      message: 'Market API disabled for Personal Storage Hub',
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Market API Error:', error)
    
    return NextResponse.json({
      success: false,
      data: [],
      count: 0,
      source: 'error',
      error: 'Market API disabled',
      lastUpdated: new Date().toISOString()
    })
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}