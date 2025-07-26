import { useContent } from '@/contexts/ContentContext'

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

const getYouTubeThumbnail = (url: string): string => {
  const videoId = getYouTubeVideoId(url)
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
}

export default function VideoSection() {
  const FREE_PLAN_LIMIT = 50
  const { videos } = useContent()

  const isAtLimit = videos.length >= FREE_PLAN_LIMIT
  
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="responsive-text-lg font-semibold text-red-400">Videos</h3>
        <div className="text-xs text-gray-400">
          <span className={videos.length >= FREE_PLAN_LIMIT ? 'text-yellow-400' : ''}>{videos.length}</span>
          <span className="text-gray-500">/{FREE_PLAN_LIMIT}</span>
        </div>
      </div>
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {videos.map((video) => {
          const thumbnailUrl = video.url ? getYouTubeThumbnail(video.url) : ''
          return (
            <div 
              key={video.id} 
              className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700"
              onClick={() => window.open(video.url, '_blank')}
            >
              <div className="flex items-start responsive-gap-sm">
                <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden relative">
                  {thumbnailUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white bg-red-600 rounded-full p-0.5 sm:p-1 bg-opacity-80" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white responsive-text-sm line-clamp-2">{video.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">Video • YouTube</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {videos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <p>No videos yet</p>
        </div>
      )}
      
      {isAtLimit && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Free plan limit reached ({FREE_PLAN_LIMIT} videos)</span>
          </div>
          <p className="text-xs text-yellow-300 mt-1">
            Delete existing videos to add new ones, or <a href="/pricing" className="underline hover:text-yellow-200">upgrade to Pro</a>
          </p>
        </div>
      )}
    </div>
  )
}