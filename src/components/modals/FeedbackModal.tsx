'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, Star, Heart } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setIsSubmitting(true)

    try {
      // API를 통해 직접 이메일 전송
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback,
          email: email || null,
          category,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '피드백 전송에 실패했습니다.')
      }

      // 성공 상태로 전환
      setIsSuccess(true)
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        setIsSuccess(false)
        setFeedback('')
        setEmail('')
        setCategory('general')
        onClose()
      }, 3000)

    } catch (error) {
      console.error('피드백 전송 실패:', error)
      alert('피드백 전송에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryOptions = [
    { value: 'general', label: '일반 피드백', icon: '💬', color: 'blue' },
    { value: 'feature', label: '기능 제안', icon: '💡', color: 'green' },
    { value: 'bug', label: '버그 신고', icon: '🐛', color: 'red' }
  ] as const

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          >
            {isSuccess ? (
              // Success State
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Heart className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">피드백을 보내주셔서 감사합니다! ✨</h3>
                <p className="text-xs text-gray-600 mb-4">
                  여러분의 소중한 의견이 Koouk을 더 나은 서비스로 만들어갑니다.
                </p>
                <div className="flex items-center justify-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            ) : (
              // Feedback Form
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">피드백 보내기</h2>
                      <p className="text-xs text-gray-500">여러분의 의견을 들려주세요</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                  {/* Category Selection */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      카테고리 선택
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {categoryOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCategory(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            category === option.value
                              ? `border-${option.color}-500 bg-${option.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg mb-1">{option.icon}</div>
                          <div className="text-xs font-medium text-gray-700">
                            {option.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      이메일 (선택사항)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="회신이 필요한 경우 이메일을 입력해주세요"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Feedback Content */}
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      피드백 내용 *
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={
                        category === 'bug' 
                          ? '어떤 문제가 발생했는지 자세히 알려주세요. 재현 방법도 함께 작성해주시면 더욱 도움이 됩니다.'
                          : category === 'feature'
                          ? '어떤 기능이 있으면 좋을지, 왜 필요한지 설명해주세요.'
                          : 'Koouk에 대한 의견, 제안, 또는 문의사항을 자유롭게 작성해주세요.'
                      }
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                    <div className="mt-1 text-right">
                      <span className="text-xs text-gray-400">
                        {feedback.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={!feedback.trim() || isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>피드백 보내기</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    소중한 의견을 Koouk 팀에게 안전하게 전달해드립니다 ✨
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}