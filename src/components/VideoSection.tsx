interface Video {
  id: number
  title: string
  url: string
  thumbnail?: string
  videoId?: string
}

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
  const videos: Video[] = [
    { id: 1, title: "React 18 Complete Tutorial", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" },
    { id: 2, title: "Next.js App Router Guide", url: "https://www.youtube.com/watch?v=ZVnjOPwW4ZA" },
    { id: 3, title: "TypeScript Best Practices", url: "https://www.youtube.com/watch?v=RmGHnYUqQ4k" },
    { id: 4, title: "Tailwind CSS Masterclass", url: "https://www.youtube.com/watch?v=ft30zcMlFao" },
    { id: 5, title: "JavaScript ES2024 Features", url: "https://www.youtube.com/watch?v=ti2Q4P_LZFE" },
    { id: 6, title: "Web Performance Optimization", url: "https://www.youtube.com/watch?v=uhRWMGBjlO8" },
    { id: 7, title: "Modern CSS Techniques", url: "https://www.youtube.com/watch?v=qm0IfZGk-2E" },
    { id: 8, title: "Node.js Backend Development", url: "https://www.youtube.com/watch?v=ENrzD9HAZK4" },
    { id: 9, title: "React State Management", url: "https://www.youtube.com/watch?v=35lXWvCuM8o" }
  ]

  return (
    <div className="h-full">
      <h3 className="responsive-text-lg font-semibold mb-4 text-red-400">Videos ({videos.length})</h3>
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {videos.map((video) => {
          const thumbnailUrl = getYouTubeThumbnail(video.url)
          return (
            <div key={video.id} className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700">
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
    </div>
  )
}