'use client'

import { useState, useEffect } from 'react'

interface FeedbackPost {
  id: string
  content: string
  timestamp: number
  isAnonymous: boolean
}

export default function FeedbackBoard() {
  const [posts, setPosts] = useState<FeedbackPost[]>([])
  const [newPost, setNewPost] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBoard, setShowBoard] = useState(false)

  // localStorage에서 피드백 불러오기
  useEffect(() => {
    const savedPosts = localStorage.getItem('koouk_feedback_posts')
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts)
        setPosts(parsedPosts.sort((a: FeedbackPost, b: FeedbackPost) => b.timestamp - a.timestamp))
      } catch (error) {
        console.error('피드백 데이터 로드 실패:', error)
      }
    }
  }, [])

  // localStorage에 피드백 저장
  const savePosts = (updatedPosts: FeedbackPost[]) => {
    try {
      localStorage.setItem('koouk_feedback_posts', JSON.stringify(updatedPosts))
    } catch (error) {
      console.error('피드백 데이터 저장 실패:', error)
    }
  }

  // 새 피드백 작성
  const handleSubmit = () => {
    if (!newPost.trim()) return

    setIsSubmitting(true)

    const newFeedback: FeedbackPost = {
      id: Date.now().toString(),
      content: newPost.trim(),
      timestamp: Date.now(),
      isAnonymous: true
    }

    const updatedPosts = [newFeedback, ...posts]
    setPosts(updatedPosts)
    savePosts(updatedPosts)
    setNewPost('')
    
    setTimeout(() => setIsSubmitting(false), 500)
  }

  // 시간 포맷팅
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return '방금 전'
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`
    return `${Math.floor(diffMinutes / 1440)}일 전`
  }

  return (
    <div className="w-full">
      {!showBoard ? (
        // 피드백 버튼
        <button
          onClick={() => setShowBoard(true)}
          className="text-green-400 hover:text-green-300 transition-colors text-xs"
        >
          피드백 보내기
        </button>
      ) : (
        // 피드백 게시판
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-700">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">익명 피드백 게시판</h2>
              <button
                onClick={() => setShowBoard(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 새 피드백 작성 */}
            <div className="p-4 border-b border-gray-700">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="피드백을 남겨주세요... (익명으로 작성됩니다)"
                className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-green-400"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {newPost.length}/500
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!newPost.trim() || isSubmitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {isSubmitting ? '작성 중...' : '피드백 남기기'}
                </button>
              </div>
            </div>

            {/* 피드백 목록 */}
            <div className="overflow-y-auto max-h-96">
              {posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-3">💬</div>
                  <p>아직 피드백이 없습니다.</p>
                  <p className="text-sm mt-1">첫 번째 피드백을 남겨보세요!</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">익</span>
                          </div>
                          <span className="text-sm text-gray-400">익명</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(post.timestamp)}
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 하단 정보 */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <p className="text-xs text-gray-400 text-center">
                테스트 기간 중 임시 게시판입니다. 모든 피드백은 익명으로 저장됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}