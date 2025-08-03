'use client'

import { useState, useEffect } from 'react'

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  targetValue: number
  currentValue: number
  unit: string
  deadline?: string
  color: string
  isActive: boolean
}

export default function GoalsFunction() {
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('miniFunction_goals')
    if (saved) {
      setGoals(JSON.parse(saved))
    }
  }, [])

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400'
    if (percentage >= 70) return 'text-blue-400'
    if (percentage >= 50) return 'text-yellow-400'
    return 'text-gray-400'
  }

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-400'
    if (percentage >= 70) return 'bg-blue-400'
    if (percentage >= 50) return 'bg-yellow-400'
    return 'bg-gray-400'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '건강': return '💪'
      case '학습': return '📚'
      case '업무': return '💼'
      case '취미': return '🎨'
      case '관계': return '👥'
      case '재정': return '💰'
      default: return '🎯'
    }
  }

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null
    const today = new Date()
    const target = new Date(deadline)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const activeGoals = goals.filter(goal => goal.isActive)
  const totalProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, goal) => sum + calculateProgress(goal.currentValue, goal.targetValue), 0) / activeGoals.length
    : 0

  const completedGoals = activeGoals.filter(goal => calculateProgress(goal.currentValue, goal.targetValue) >= 100)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">목표 현황</div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-gray-400">활성 목표: </span>
            <span className="text-white font-medium">{activeGoals.length}개</span>
          </div>
          <div>
            <span className="text-gray-400">완료: </span>
            <span className="text-white font-medium">{completedGoals.length}개</span>
          </div>
          <div>
            <span className="text-gray-400">평균 달성률: </span>
            <span className="text-white font-medium">{totalProgress.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Settings Info */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
        <div className="text-sm text-blue-400 mb-1">목표 설정</div>
        <div className="text-xs text-gray-300">
          톱니바퀴 → Mini Function Control에서 목표를 추가하고 진행상황을 업데이트할 수 있습니다.
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <div className="text-sm font-medium text-white mb-2">활성 목표</div>
          <div className="space-y-3">
            {activeGoals.slice(0, 4).map(goal => {
              const progress = calculateProgress(goal.currentValue, goal.targetValue)
              const daysRemaining = getDaysRemaining(goal.deadline || '')
              
              return (
                <div key={goal.id} className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {goal.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {goal.category}
                          {daysRemaining !== null && (
                            <span className={`ml-2 ${
                              daysRemaining < 0 ? 'text-red-400' :
                              daysRemaining <= 7 ? 'text-yellow-400' : 'text-gray-400'
                            }`}>
                              {daysRemaining < 0 ? `${Math.abs(daysRemaining)}일 지남` :
                               daysRemaining === 0 ? '마감일' : `${daysRemaining}일 남음`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getProgressColor(progress)}`}>
                      {progress.toFixed(0)}%
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="w-full bg-gray-700/30 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                    {progress >= 100 && (
                      <span className="text-green-400 font-medium">🎉 달성!</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed Goals Today */}
      {completedGoals.length > 0 && (
        <div>
          <div className="text-sm font-medium text-green-400 mb-2">최근 달성한 목표</div>
          <div className="space-y-2">
            {completedGoals.slice(0, 2).map(goal => (
              <div key={goal.id} className="bg-green-900/20 border border-green-700/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {goal.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {goal.currentValue} {goal.unit} 달성
                    </div>
                  </div>
                  <span className="text-green-400 text-lg">✅</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          설정된 목표가 없습니다
        </div>
      )}
    </div>
  )
}