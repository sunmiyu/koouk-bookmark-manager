'use client'

import { useState } from 'react'

type Comment = {
  id: string
  content: string
  createdAt: string
}

type Question = {
  id: string
  question: string
  createdAt: string
  comments: Comment[]
}

export default function TalkTalkContent() {
  // Mock data for 2 daily questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: '오늘 하루 중 가장 기억에 남는 순간은 무엇인가요?',
      createdAt: new Date().toISOString(),
      comments: [
        { id: 'c1', content: '점심시간에 동료와 나눈 대화가 정말 좋았어요', createdAt: new Date().toISOString() }
      ]
    },
    {
      id: '2', 
      question: '내일 가장 기대하고 있는 일이 있다면 무엇인가요?',
      createdAt: new Date().toISOString(),
      comments: []
    }
  ])

  const [newComments, setNewComments] = useState<{ [questionId: string]: string }>({})

  const handleAddComment = (questionId: string) => {
    const content = newComments[questionId]?.trim()
    if (!content || content.length > 100) return

    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString()
    }

    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, comments: [...q.comments, newComment] }
        : q
    ))

    setNewComments(prev => ({ ...prev, [questionId]: '' }))
  }

  const updateNewComment = (questionId: string, content: string) => {
    if (content.length <= 100) {
      setNewComments(prev => ({ ...prev, [questionId]: content }))
    }
  }

  return (
    <div className="h-full" style={{ 
      padding: 'var(--space-10) var(--space-8)',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Header */}
      <div className="mb-12">
        <h1 style={{ 
          fontSize: 'var(--text-3xl)',
          fontWeight: '300',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: '1.2',
          marginBottom: 'var(--space-2)'
        }}>
          TalkTalk
        </h1>
        <p style={{ 
          fontSize: 'var(--text-lg)',
          color: 'var(--text-secondary)',
          fontWeight: '400',
          lineHeight: '1.5',
          letterSpacing: '0.01em'
        }}>
          매일 새로운 질문으로 소소한 일상을 나눠보세요
        </p>
      </div>

      {/* Questions Container */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              newComment={newComments[question.id] || ''}
              onCommentChange={(content) => updateNewComment(question.id, content)}
              onAddComment={() => handleAddComment(question.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Question Card Component
function QuestionCard({ 
  question, 
  questionNumber,
  newComment,
  onCommentChange,
  onAddComment
}: {
  question: Question
  questionNumber: number
  newComment: string
  onCommentChange: (content: string) => void
  onAddComment: () => void
}) {
  const [isFocused, setIsFocused] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onAddComment()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins}분 전`
    }
    if (diffHours < 24) {
      return `${diffHours}시간 전`
    }
    return date.toLocaleDateString()
  }

  return (
    <div 
      className="group transition-all duration-300 ease-out"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow-subtle)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'
      }}
    >
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div style={{
              backgroundColor: '#1A1A1A',
              color: 'white',
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {questionNumber}
            </div>
            <span style={{
              fontSize: '0.8rem',
              color: '#9CA3AF',
              fontWeight: '400'
            }}>
              오늘의 질문
            </span>
          </div>
          <span style={{
            fontSize: '0.75rem',
            color: '#9CA3AF',
            fontWeight: '400'
          }}>
            {formatTime(question.createdAt)}
          </span>
        </div>
        
        <h3 style={{ 
          fontSize: '1.25rem',
          fontWeight: '400',
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
          lineHeight: '1.4'
        }}>
          {question.question}
        </h3>
      </div>

      {/* Comments */}
      <div className="space-y-4 mb-6">
        {question.comments.map(comment => (
          <div 
            key={comment.id}
            className="transition-all duration-200 ease-out"
            style={{
              backgroundColor: '#FAFAF9',
              border: '1px solid #F5F3F0',
              borderRadius: '0.875rem',
              padding: '1rem 1.25rem'
            }}
          >
            <p style={{
              color: '#1A1A1A',
              fontSize: '0.9rem',
              fontWeight: '400',
              lineHeight: '1.5',
              marginBottom: '0.5rem'
            }}>
              {comment.content}
            </p>
            <span style={{
              fontSize: '0.75rem',
              color: '#9CA3AF',
              fontWeight: '400'
            }}>
              {formatTime(comment.createdAt)}
            </span>
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <div className="relative">
        <textarea
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          placeholder="솔직한 생각 한 줄만이라도 😊"
          className="w-full resize-none transition-all duration-200 ease-out"
          style={{
            backgroundColor: '#FAFAF9',
            border: `1px solid ${isFocused ? '#E8E5E1' : '#F5F3F0'}`,
            borderRadius: '0.875rem',
            padding: '1rem',
            color: '#1A1A1A',
            outline: 'none',
            fontSize: '0.9rem',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0.01em',
            height: '5rem',
            minHeight: '5rem'
          }}
          maxLength={100}
        />
        
        {/* Character Counter and Submit */}
        <div className="flex items-center justify-between mt-3">
          <span style={{ 
            color: newComment.length > 90 ? '#EF4444' : '#9CA3AF',
            fontSize: '0.75rem',
            fontWeight: '400',
            letterSpacing: '0.02em',
            transition: 'color 0.2s ease-out'
          }}>
            {newComment.length}/100
          </span>
          
          {newComment.trim() && (
            <button
              onClick={onAddComment}
              className="transition-all duration-200 ease-out"
              style={{
                backgroundColor: '#1A1A1A',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: '500',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333333'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1A1A1A'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              댓글 작성
            </button>
          )}
        </div>
      </div>
    </div>
  )
}