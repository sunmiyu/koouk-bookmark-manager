import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const errorReport = await request.json()
    
    // 기본적인 검증
    if (!errorReport.message || !errorReport.timestamp) {
      return NextResponse.json(
        { error: 'Invalid error report format' },
        { status: 400 }
      )
    }

    // 사용자 정보 가져오기 (옵션)
    const { data: { user } } = await supabase.auth.getUser()
    
    // 에러 리포트를 feedback 테이블에 저장
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user?.id || null,
        type: 'error_report',
        subject: `Error: ${errorReport.severity} - ${errorReport.context || 'Unknown'}`,
        message: JSON.stringify({
          message: errorReport.message,
          stack: errorReport.stack,
          context: errorReport.context,
          metadata: errorReport.metadata,
          severity: errorReport.severity
        }),
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to store error report:', error)
      return NextResponse.json(
        { error: 'Failed to store error report' },
        { status: 500 }
      )
    }

    // 중요한 에러인 경우 즉시 알림 (추후 구현)
    if (errorReport.severity === 'critical' || errorReport.severity === 'high') {
      // 여기서 슬랙, 이메일 등으로 알림 발송
      console.warn('High severity error reported:', errorReport)
    }

    return NextResponse.json({ 
      success: true, 
      reportId: data.id 
    })

  } catch (error) {
    console.error('Error report processing failed:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 에러 리포트 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인 (추후 구현)
    // const isAdmin = await checkAdminPermission(user.id)
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { error: 'Admin permission required' },
    //     { status: 403 }
    //   )
    // }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const severity = url.searchParams.get('severity')

    let query = supabase
      .from('feedback')
      .select('*')
      .eq('type', 'error_report')

    // Apply severity filter if provided
    if (severity) {
      query = query.eq('severity', severity)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch error reports' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      reports: data,
      pagination: {
        limit,
        offset,
        hasMore: data.length === limit
      }
    })

  } catch (error) {
    console.error('Failed to fetch error reports:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}