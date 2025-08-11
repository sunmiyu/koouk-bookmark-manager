import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import { extractYouTubeVideoId } from '../../utils/youtube'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  try {
    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' })
    }

    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: [videoId]
    })

    const video = response.data.items?.[0]
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
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

    res.status(200).json(videoInfo)
  } catch (error) {
    console.error('YouTube API Error:', error)
    res.status(500).json({ error: 'Failed to fetch video information' })
  }
}