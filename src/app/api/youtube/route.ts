import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { extractYouTubeVideoId } from '@/utils/youtube'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

// HTML 스크래핑으로 YouTube 제목 추출하는 폴백 함수
async function scrapeYouTubeTitle(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch')
    
    const html = await response.text()
    
    // YouTube 페이지에서 제목 추출 (여러 방법 시도)
    const titleMatch = html.match(/<title>([^<]+)<\/title>/)
    if (titleMatch) {
      let title = titleMatch[1]
      // " - YouTube" 부분 제거
      title = title.replace(/ - YouTube$/, '')
      // HTML 엔티티 디코딩
      title = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
      
      if (title && title !== 'YouTube') {
        return title
      }
    }
    
    // og:title 메타 태그에서 추출
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
    if (ogTitleMatch) {
      return ogTitleMatch[1]
    }
    
    return null
  } catch (error) {
    console.error('YouTube scraping error:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    let videoInfo = {
      title: undefined as string | undefined,
      description: undefined as string | undefined,
      duration: undefined as string | undefined,
      channelTitle: undefined as string | undefined,
      publishedAt: undefined as string | undefined,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }

    // YouTube API 시도 (API 키가 있을 때만)
    if (process.env.YOUTUBE_API_KEY) {
      try {
        const response = await youtube.videos.list({
          part: ['snippet', 'contentDetails'],
          id: [videoId]
        })

        const video = response.data.items?.[0]
        if (video) {
          const snippet = video.snippet
          const contentDetails = video.contentDetails

          videoInfo = {
            title: snippet?.title || undefined,
            description: snippet?.description || undefined,
            duration: contentDetails?.duration || undefined,
            channelTitle: snippet?.channelTitle || undefined,
            publishedAt: snippet?.publishedAt || undefined,
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
          }
        }
      } catch (apiError) {
        console.error('YouTube API failed, falling back to scraping:', apiError)
      }
    }

    // API가 실패했거나 제목이 없으면 스크래핑으로 폴백
    if (!videoInfo.title) {
      const scrapedTitle = await scrapeYouTubeTitle(url)
      if (scrapedTitle) {
        videoInfo.title = scrapedTitle
      } else {
        videoInfo.title = `YouTube Video ${videoId}`
      }
    }

    return NextResponse.json(videoInfo)
  } catch (error) {
    console.error('YouTube processing error:', error)
    return NextResponse.json({ error: 'Failed to fetch video information' }, { status: 500 })
  }
}