'use client'

import { useState, useEffect } from 'react'
import { ExpenseData, ExpenseItem } from '@/types/miniFunctions'

interface ExpenseTrackerProps {
  isPreviewOnly?: boolean
}

export default function ExpenseTracker({ isPreviewOnly = false }: ExpenseTrackerProps) {
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    todayTotal: 0,
    items: []
  })
  const [newExpense, setNewExpense] = useState('')

  // Load today's expenses from localStorage
  useEffect(() => {
    if (isPreviewOnly) {
      // Sample data for preview
      setExpenseData({
        todayTotal: 34500,
        items: [
          {
            id: 'sample1',
            amount: 4500,
            description: '커피',
            timestamp: new Date().toISOString(),
            category: 'food'
          },
          {
            id: 'sample2', 
            amount: 30000,
            description: '점심 회식',
            timestamp: new Date().toISOString(),
            category: 'food'
          }
        ]
      })
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const saved = localStorage.getItem(`koouk_expenses_${today}`)
    
    if (saved) {
      try {
        const data = JSON.parse(saved) as ExpenseData
        setExpenseData(data)
      } catch (error) {
        console.error('Failed to load expenses:', error)
      }
    }
  }, [isPreviewOnly])

  const addExpense = () => {
    if (isPreviewOnly || !newExpense.trim()) return

    // Parse input like "커피 4500" or "4500 커피" or "4500"
    const input = newExpense.trim()
    let amount = 0
    let description = ''

    const match = input.match(/(\d+)\s*(.*)/) || input.match(/(.*)\s+(\d+)/)
    
    if (match) {
      if (/^\d+/.test(input)) {
        // Starts with number: "4500 커피"
        amount = parseInt(match[1])
        description = match[2].trim() || '기타'
      } else {
        // Ends with number: "커피 4500"
        const parts = input.split(/\s+/)
        const lastPart = parts[parts.length - 1]
        if (/^\d+$/.test(lastPart)) {
          amount = parseInt(lastPart)
          description = parts.slice(0, -1).join(' ') || '기타'
        }
      }
    }

    if (amount <= 0) return

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      amount,
      description,
      timestamp: new Date().toISOString()
    }

    const updatedData = {
      todayTotal: expenseData.todayTotal + amount,
      items: [newItem, ...expenseData.items]
    }

    setExpenseData(updatedData)
    setNewExpense('')

    // Save to localStorage
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`koouk_expenses_${today}`, JSON.stringify(updatedData))
  }

  const removeExpense = (itemId: string) => {
    if (isPreviewOnly) return

    const itemToRemove = expenseData.items.find(item => item.id === itemId)
    if (!itemToRemove) return

    const updatedData = {
      todayTotal: expenseData.todayTotal - itemToRemove.amount,
      items: expenseData.items.filter(item => item.id !== itemId)
    }

    setExpenseData(updatedData)

    // Save to localStorage
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`koouk_expenses_${today}`, JSON.stringify(updatedData))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const displayItems = isPreviewOnly ? expenseData.items.slice(0, 2) : expenseData.items.slice(0, 3)

  return (
    <div className="space-y-1">
      {/* Header with History button */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">가계부 관리</span>
        {!isPreviewOnly && (
          <div className="flex gap-2">
            <button className="text-xs text-blue-400 hover:text-blue-300 underline">
              📊 History
            </button>
            <button className="text-xs text-green-400 hover:text-green-300 underline">
              📈 월별 총계
            </button>
          </div>
        )}
      </div>

      {/* Today's total */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">오늘 지출</span>
        <span className="text-white font-medium text-sm">
          {formatCurrency(expenseData.todayTotal)}
        </span>
      </div>

      {/* Recent expenses */}
      {displayItems.length > 0 && (
        <div className="space-y-1">
          {displayItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between group">
              <span className="text-white text-sm truncate flex-1">
                {item.description}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-gray-300 text-sm">
                  {formatCurrency(item.amount)}
                </span>
                {!isPreviewOnly && (
                  <button
                    onClick={() => removeExpense(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm w-4"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new expense */}
      {!isPreviewOnly && (
        <div className="mt-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newExpense}
              onChange={(e) => setNewExpense(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExpense()}
              placeholder="커피 4500"
              className="flex-1 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            />
            <button
              onClick={addExpense}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
            >
              +
            </button>
          </div>
          <div className="text-gray-500 text-sm mt-1">
            예: &quot;커피 4500&quot; 또는 &quot;4500 커피&quot;
          </div>
        </div>
      )}

      {expenseData.items.length === 0 && (
        <div className="text-center py-2">
          <span className="text-gray-500 text-sm">
            {isPreviewOnly ? '💰 Track expenses in Pro plan' : 'No expenses today'}
          </span>
        </div>
      )}

      {isPreviewOnly && expenseData.items.length > 0 && (
        <div className="text-center pt-1">
          <span className="text-gray-500 text-sm">Add expenses in Pro plan</span>
        </div>
      )}
    </div>
  )
}