import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // URL 유효성 검사
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // 웹페이지 HTML 가져오기
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10초 타임아웃
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 })
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Meta 정보 추출
    const metadata = {
      title: '',
      description: '',
      image: '',
      url: validUrl.toString(),
      domain: validUrl.hostname
    }

    // 제목 추출 (우선순위: og:title > twitter:title > title 태그)
    metadata.title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      ''

    // 네이버 카페 특화 처리
    if (validUrl.hostname.includes('cafe.naver.com')) {
      // 카페 글 제목 추출
      const cafeTitle = 
        $('.ArticleContentBox .title_text').text() ||
        $('.article_header .title').text() ||
        $('.tit').text() ||
        $('h3.title_text').text()
      
      if (cafeTitle) {
        metadata.title = cafeTitle.trim()
      }
      
      // URL 정리 (iframe_url 파라미터 제거)
      try {
        const cleanUrl = new URL(validUrl)
        if (cleanUrl.searchParams.has('iframe_url_utf8')) {
          cleanUrl.searchParams.delete('iframe_url_utf8')
          metadata.url = cleanUrl.toString()
        }
      } catch {
        // URL 정리 실패시 원본 유지
      }
    }

    // 설명 추출
    metadata.description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''

    // 이미지 추출 (네이버 블로그 특화 처리 포함)
    let imageUrl = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      ''

    // 네이버 블로그 특화 처리
    if (!imageUrl && validUrl.hostname.includes('blog.naver.com')) {
      // 네이버 블로그의 대표 이미지 추출
      const naverImage = 
        $('.se-main-container img').first().attr('src') ||
        $('.se-component-image img').first().attr('src') ||
        $('._img').first().attr('src') ||
        $('img[src*="blogfiles.naver.net"]').first().attr('src') ||
        $('img[src*="pstatic.net"]').first().attr('src')
      
      if (naverImage) {
        imageUrl = naverImage
      }
    }

    // 일반 사이트 폴백
    if (!imageUrl) {
      imageUrl = $('img').first().attr('src') || ''
    }

    // 상대 URL을 절대 URL로 변환
    if (imageUrl) {
      try {
        if (imageUrl.startsWith('//')) {
          imageUrl = validUrl.protocol + imageUrl
        } else if (imageUrl.startsWith('/')) {
          imageUrl = validUrl.origin + imageUrl
        } else if (!imageUrl.startsWith('http')) {
          imageUrl = new URL(imageUrl, validUrl.toString()).toString()
        }
        metadata.image = imageUrl
      } catch {
        metadata.image = ''
      }
    }

    // 텍스트 정리 및 디코딩
    metadata.title = metadata.title
      .replace(/\s+/g, ' ') // 연속된 공백 제거
      .trim()
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // 깨진 특수문자 처리  
      .replace(/♦+/g, '') // 다이아몬드 문자 제거
      .replace(/[^\x20-\x7E\xA0-\uFFFF]/g, '') // 유효하지 않은 문자 제거
      .replace(/\s+/g, ' ') // 다시 공백 정리
      .trim()

    metadata.description = metadata.description
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

    // 제목이 너무 길면 자르기
    if (metadata.title.length > 100) {
      metadata.title = metadata.title.substring(0, 97) + '...'
    }

    // 설명이 너무 길면 자르기
    if (metadata.description.length > 200) {
      metadata.description = metadata.description.substring(0, 197) + '...'
    }

    return NextResponse.json(metadata)

  } catch (error) {
    console.error('Meta extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract metadata' }, 
      { status: 500 }
    )
  }
}