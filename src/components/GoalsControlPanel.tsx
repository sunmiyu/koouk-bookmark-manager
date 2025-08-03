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
  createdAt: string
}

export default function GoalsControlPanel() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: '건강',
    targetValue: 1,
    currentValue: 0,
    unit: '회',
    deadline: '',
    color: 'blue'
  })

  const categories = ['건강', '학습', '업무', '취미', '관계', '재정', '기타']
  const units = ['회', '시간', '일', '개', 'kg', 'km', '권', '만원', '%', '점']
  const colors = [
    { name: 'blue', label: '파랑', class: 'bg-blue-500' },
    { name: 'green', label: '초록', class: 'bg-green-500' },
    { name: 'purple', label: '보라', class: 'bg-purple-500' },
    { name: 'red', label: '빨강', class: 'bg-red-500' },
    { name: 'yellow', label: '노랑', class: 'bg-yellow-500' },
    { name: 'pink', label: '분홍', class: 'bg-pink-500' }
  ]

  useEffect(() => {
    const saved = localStorage.getItem('miniFunction_goals')
    if (saved) {
      setGoals(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (newGoals: Goal[]) => {
    localStorage.setItem('miniFunction_goals', JSON.stringify(newGoals))
    setGoals(newGoals)
  }

  const addGoal = () => {
    if (!newGoal.title.trim() || newGoal.targetValue <= 0) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      category: newGoal.category,
      targetValue: newGoal.targetValue,
      currentValue: newGoal.currentValue,
      unit: newGoal.unit,
      deadline: newGoal.deadline || undefined,
      color: newGoal.color,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    const updated = [...goals, goal]
    saveToStorage(updated)
    
    setNewGoal({
      title: '',
      description: '',
      category: '건강',
      targetValue: 1,
      currentValue: 0,
      unit: '회',
      deadline: '',
      color: 'blue'
    })
    setShowAddForm(false)
  }

  const updateGoalProgress = (id: string, newValue: number) => {
    const updated = goals.map(goal => 
      goal.id === id ? { ...goal, currentValue: Math.max(0, newValue) } : goal
    )
    saveToStorage(updated)
  }

  const toggleGoalActive = (id: string) => {
    const updated = goals.map(goal => 
      goal.id === id ? { ...goal, isActive: !goal.isActive } : goal
    )
    saveToStorage(updated)
  }

  const deleteGoal = (id: string) => {
    if (confirm('이 목표를 삭제하시겠습니까?')) {
      const updated = goals.filter(goal => goal.id !== id)
      saveToStorage(updated)
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
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

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-200 bg-red-50'
      case 'blue': return 'border-blue-200 bg-blue-50'
      case 'green': return 'border-green-200 bg-green-50'
      case 'purple': return 'border-purple-200 bg-purple-50'
      case 'yellow': return 'border-yellow-200 bg-yellow-50'
      case 'pink': return 'border-pink-200 bg-pink-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">목표 관리</h3>
          <p className="text-sm text-gray-600">개인 목표를 설정하고 진행상황을 추적하세요</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showAddForm ? '취소' : '+ 목표 추가'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">목표명</label>
              <input
                type="text"
                placeholder="예: 매일 운동하기, 책 읽기"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">목표 설명 (선택사항)</label>
            <textarea
              placeholder="목표에 대한 자세한 설명"
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">목표값</label>
              <input
                type="number"
                min="1"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">단위</label>
              <select
                value={newGoal.unit}
                onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">마감일 (선택사항)</label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setNewGoal(prev => ({ ...prev, color: color.name }))}
                  className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                    newGoal.color === color.name ? 'border-gray-900 scale-110' : 'border-gray-300'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <button
            onClick={addGoal}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            목표 저장
          </button>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 설정된 목표가 없습니다
          </div>
        ) : (
          goals.map(goal => {
            const progress = calculateProgress(goal.currentValue, goal.targetValue)
            return (
              <div key={goal.id} className={`border rounded-lg p-4 ${getColorClass(goal.color)} ${
                !goal.isActive ? 'opacity-50' : ''
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-gray-900">
                          {goal.title}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          goal.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {goal.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      )}
                      <div className="text-sm text-gray-600">
                        {goal.category} • 목표: {goal.targetValue} {goal.unit}
                        {goal.deadline && ` • 마감: ${goal.deadline}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleGoalActive(goal.id)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        goal.isActive 
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                          : 'bg-green-200 hover:bg-green-300 text-green-700'
                      }`}
                    >
                      {goal.isActive ? '비활성화' : '활성화'}
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {goal.isActive && (
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">진행상황</span>
                        <span className="font-medium text-gray-900">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Progress Update */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">현재 진행:</span>
                      <input
                        type="number"
                        min="0"
                        value={goal.currentValue}
                        onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">/ {goal.targetValue} {goal.unit}</span>
                      {progress >= 100 && (
                        <span className="text-green-600 font-medium text-sm">🎉 목표 달성!</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}