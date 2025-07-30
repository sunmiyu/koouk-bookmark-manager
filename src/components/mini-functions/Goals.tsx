'use client'

import { useState, useEffect } from 'react'

interface Goal {
  id: string
  title: string
  deadline: string
  completed: boolean
  createdAt: string
}

interface GoalsProps {
  isPreviewOnly?: boolean
}

export default function Goals({ isPreviewOnly = false }: GoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    if (isPreviewOnly) {
      // Sample data for preview
      setGoals([
        { 
          id: '1', 
          title: '프로젝트 완료', 
          deadline: '2024-02-15', 
          completed: false,
          createdAt: new Date().toISOString() 
        },
        { 
          id: '2', 
          title: '영어 자격증 취득', 
          deadline: '2024-03-31', 
          completed: false,
          createdAt: new Date().toISOString() 
        },
        { 
          id: '3', 
          title: '운동 루틴 정착', 
          deadline: '2024-02-29', 
          completed: true,
          createdAt: new Date().toISOString() 
        }
      ])
      return
    }

    // Load from localStorage or API
    const saved = localStorage.getItem('koouk_goals')
    if (saved) {
      setGoals(JSON.parse(saved))
    }
  }, [isPreviewOnly])

  const toggleGoal = (id: string) => {
    if (isPreviewOnly) return
    
    const updatedGoals = goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    )
    setGoals(updatedGoals)
    localStorage.setItem('koouk_goals', JSON.stringify(updatedGoals))
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const activeGoals = goals.filter(goal => !goal.completed)
  const completedGoals = goals.filter(goal => goal.completed)

  return (
    <div className="space-y-2">
      {isPreviewOnly ? (
        <div className="text-gray-300 text-sm">
          <div className="mb-2">
            진행중: {activeGoals.length}개 | 완료: {completedGoals.length}개
          </div>
          {activeGoals.slice(0, 2).map((goal) => {
            const daysLeft = getDaysUntilDeadline(goal.deadline)
            return (
              <div key={goal.id} className="text-xs text-gray-400 flex justify-between">
                <span className="truncate">{goal.title}</span>
                <span className={daysLeft < 7 ? 'text-red-400' : 'text-gray-400'}>
                  {daysLeft > 0 ? `${daysLeft}일 남음` : '기한 초과'}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <div className="text-gray-400 text-xs mb-2">진행중인 목표</div>
              <div className="space-y-2">
                {activeGoals.map((goal) => {
                  const daysLeft = getDaysUntilDeadline(goal.deadline)
                  return (
                    <div key={goal.id} className="p-3 bg-gray-800 rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => toggleGoal(goal.id)}
                            className="mt-0.5 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">
                              {goal.title}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {formatDate(goal.deadline)}까지
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <div className={`text-xs font-medium ${
                            daysLeft < 0 ? 'text-red-400' :
                            daysLeft < 7 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {daysLeft > 0 ? `${daysLeft}일 남음` : '기한 초과'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <div className="text-gray-400 text-xs mb-2">완료된 목표</div>
              <div className="space-y-2">
                {completedGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="p-2 bg-gray-800 rounded opacity-60">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleGoal(goal.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="text-gray-300 text-sm line-through">
                          {goal.title}
                        </div>
                      </div>
                      <div className="text-green-400 text-xs">완료</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {goals.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              설정된 목표가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  )
}