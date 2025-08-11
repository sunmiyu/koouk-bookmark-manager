import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { extractYouTubeVideoId } from '@/utils/youtube'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

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

    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: [videoId]
    })

    const video = response.data.items?.[0]
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const snippet = video.snippet
    const contentDetails = video.contentDetails

    const videoInfo = {
      title: snippet?.title || undefined,
      description: snippet?.description || undefined,
      duration: contentDetails?.duration || undefined,
      channelTitle: snippet?.channelTitle || undefined,
      publishedAt: snippet?.publishedAt || undefined,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }

    return NextResponse.json(videoInfo)
  } catch (error) {
    console.error('YouTube API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch video information' }, { status: 500 })
  }
}