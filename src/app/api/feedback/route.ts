import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { feedback, email, category } = await request.json()

    if (!feedback?.trim()) {
      return NextResponse.json(
        { error: '피드백 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    const categoryLabels = {
      'general': '일반 피드백',
      'feature': '기능 제안', 
      'bug': '버그 신고'
    }

    const categoryEmoji = {
      'general': '💬',
      'feature': '💡',
      'bug': '🐛'
    }

    const emailSubject = `${categoryEmoji[category as keyof typeof categoryEmoji]} [Koouk] ${categoryLabels[category as keyof typeof categoryLabels]}`
    
    const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
          ${categoryEmoji[category as keyof typeof categoryEmoji]} Koouk 피드백
        </h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
          ${categoryLabels[category as keyof typeof categoryLabels]}
        </p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">📝 피드백 내용:</h3>
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #667eea;">
            <p style="color: #333; margin: 0; white-space: pre-wrap; line-height: 1.6;">${feedback}</p>
          </div>
        </div>
        
        ${email ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">📧 연락처:</h3>
          <p style="color: #555; margin: 0; background: #f1f3f4; padding: 12px; border-radius: 6px; font-family: monospace;">
            ${email}
          </p>
        </div>
        ` : ''}
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
          <p style="color: #888; font-size: 12px; margin: 0; text-align: center;">
            🚀 Koouk 피드백 시스템에서 자동 발송됨<br>
            <span style="color: #bbb;">${new Date().toLocaleString('ko-KR')}</span>
          </p>
        </div>
      </div>
    </div>
    `

    await resend.emails.send({
      from: 'Koouk Feedback <noreply@koouk.im>',
      to: ['tjsalg1@gmail.com'],
      subject: emailSubject,
      html: emailHtml,
    })

    return NextResponse.json({ 
      success: true, 
      message: '피드백이 성공적으로 전송되었습니다!' 
    })

  } catch (error) {
    console.error('Feedback send error:', error)
    return NextResponse.json(
      { error: '피드백 전송에 실패했습니다.' },
      { status: 500 }
    )
  }
}