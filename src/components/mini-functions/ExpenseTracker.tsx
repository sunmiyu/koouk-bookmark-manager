'use client'

import { useState, useEffect } from 'react'
import { ExpenseData, ExpenseItem } from '@/types/miniFunctions'
import { supabase } from '@/lib/supabase'
import { expensesService } from '@/lib/supabase-services'
import type { User } from '@supabase/supabase-js'

interface ExpenseTrackerProps {
  isPreviewOnly?: boolean
}

export default function ExpenseTracker({ isPreviewOnly = false }: ExpenseTrackerProps) {
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    todayTotal: 0,
    items: []
  })
  const [newExpense, setNewExpense] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showMonthlyTotal, setShowMonthlyTotal] = useState(false)
  const [historyData, setHistoryData] = useState<{ date: string; total: number; count: number }[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; total: number; count: number }[]>([])
  const [user, setUser] = useState<User | null>(null)

  // Get user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load today's expenses
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

    const loadTodayExpenses = async () => {
      if (user) {
        try {
          const today = new Date().toISOString().split('T')[0]
          const expenses = await expensesService.getByDate(user.id, today)
          
          const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
          const items = expenses.map(expense => ({
            id: expense.id!,
            amount: Number(expense.amount),
            description: expense.description || '기타',
            timestamp: expense.created_at || new Date().toISOString(),
            category: expense.category || 'other'
          }))

          setExpenseData({ todayTotal: total, items })
        } catch (error) {
          console.error('Failed to load expenses:', error)
          // Fallback to localStorage
          const today = new Date().toISOString().split('T')[0]
          const saved = localStorage.getItem(`koouk_expenses_${today}`)
          if (saved) {
            try {
              const data = JSON.parse(saved) as ExpenseData
              setExpenseData(data)
            } catch (e) {
              console.error('Failed to load from localStorage:', e)
            }
          }
        }
      } else {
        // Use localStorage when not logged in
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
      }
    }

    loadTodayExpenses()
  }, [isPreviewOnly, user])

  const addExpense = async () => {
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

    // Save to Supabase if user is logged in, otherwise localStorage
    if (user) {
      try {
        await expensesService.create({
          user_id: user.id,
          amount: amount,
          description,
          date: new Date().toISOString().split('T')[0],
          category: 'other'
        })
      } catch (error) {
        console.error('Failed to save expense to Supabase:', error)
        // Fallback to localStorage
        const today = new Date().toISOString().split('T')[0]
        localStorage.setItem(`koouk_expenses_${today}`, JSON.stringify(updatedData))
      }
    } else {
      // Save to localStorage when not logged in
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem(`koouk_expenses_${today}`, JSON.stringify(updatedData))
    }
  }

  const removeExpense = async (itemId: string) => {
    if (isPreviewOnly) return

    const itemToRemove = expenseData.items.find(item => item.id === itemId)
    if (!itemToRemove) return

    const updatedData = {
      todayTotal: expenseData.todayTotal - itemToRemove.amount,
      items: expenseData.items.filter(item => item.id !== itemId)
    }

    setExpenseData(updatedData)

    // Remove from Supabase if user is logged in, otherwise localStorage
    if (user) {
      try {
        await expensesService.delete(itemId)
      } catch (error) {
        console.error('Failed to delete expense from Supabase:', error)
        // Fallback to localStorage
        const today = new Date().toISOString().split('T')[0]
        localStorage.setItem(`koouk_expenses_${today}`, JSON.stringify(updatedData))
      }
    } else {
      // Save to localStorage when not logged in
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem(`koouk_expenses_${today}`, JSON.stringify(updatedData))
    }
  }

  const loadHistoryData = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Get last 30 days of expenses
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const startDate = thirtyDaysAgo.toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const expenses = await expensesService.getByDateRange(user.id, startDate, endDate)
      
      // Group by date
      const dailyTotals: { [date: string]: { total: number; count: number } } = {}
      
      expenses.forEach(expense => {
        const date = expense.date || new Date().toISOString().split('T')[0]
        if (!dailyTotals[date]) {
          dailyTotals[date] = { total: 0, count: 0 }
        }
        dailyTotals[date].total += Number(expense.amount)
        dailyTotals[date].count += 1
      })

      const historyArray = Object.entries(dailyTotals)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10) // Last 10 days with data

      setHistoryData(historyArray)
    } catch (error) {
      console.error('Failed to load history data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMonthlyData = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Get last 6 months of expenses
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const startDate = sixMonthsAgo.toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const expenses = await expensesService.getByDateRange(user.id, startDate, endDate)
      
      // Group by month
      const monthlyTotals: { [month: string]: { total: number; count: number } } = {}
      
      expenses.forEach(expense => {
        const date = new Date(expense.date || new Date())
        const month = date.toISOString().slice(0, 7) // YYYY-MM format
        if (!monthlyTotals[month]) {
          monthlyTotals[month] = { total: 0, count: 0 }
        }
        monthlyTotals[month].total += Number(expense.amount)
        monthlyTotals[month].count += 1
      })

      const monthlyArray = Object.entries(monthlyTotals)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => b.month.localeCompare(a.month))

      setMonthlyData(monthlyArray)
    } catch (error) {
      console.error('Failed to load monthly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${year}년 ${parseInt(month)}월`
  }

  const displayItems = isPreviewOnly ? expenseData.items.slice(0, 2) : expenseData.items.slice(0, 3)

  return (
    <div className="space-y-1">
      {/* Header with History button */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">가계부 관리</span>
        {!isPreviewOnly && (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setShowHistory(!showHistory)
                if (!showHistory) loadHistoryData()
              }}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              📊 History
            </button>
            <button 
              onClick={() => {
                setShowMonthlyTotal(!showMonthlyTotal)
                if (!showMonthlyTotal) loadMonthlyData()
              }}
              className="text-xs text-green-400 hover:text-green-300 underline"
            >
              📈 월별 총계
            </button>
          </div>
        )}
      </div>

      {/* Today's total */}
      <div className="flex justify-between items-center py-1">
        <span className="text-gray-300 font-medium">오늘 지출</span>
        <span className="text-white font-semibold">
          {formatCurrency(expenseData.todayTotal)}
        </span>
      </div>

      {/* Recent expenses */}
      {displayItems.length > 0 && (
        <div className="space-y-1">
          {displayItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center group py-1">
              <span className="text-gray-300 font-medium truncate flex-1">
                {item.description}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-white font-semibold text-sm">
                  {formatCurrency(item.amount)}
                </span>
                {!isPreviewOnly && (
                  <button
                    onClick={() => removeExpense(item.id)}
                    disabled={loading}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm w-4 disabled:opacity-50"
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

      {/* History View */}
      {showHistory && !isPreviewOnly && (
        <div className="mt-4 border-t border-gray-600 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">최근 10일 기록</span>
            <button 
              onClick={() => setShowHistory(false)}
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              ✕
            </button>
          </div>
          {loading ? (
            <div className="text-center py-2">
              <span className="text-gray-500 text-sm">로딩 중...</span>
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-2">
              <span className="text-gray-500 text-sm">기록이 없습니다</span>
            </div>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {historyData.map((day) => (
                <div key={day.date} className="flex justify-between items-center py-1 px-2 bg-gray-800 rounded">
                  <div>
                    <span className="text-gray-300 text-sm">{formatDate(day.date)}</span>
                    <span className="text-gray-500 text-xs ml-2">({day.count}건)</span>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {formatCurrency(day.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Monthly Total View */}
      {showMonthlyTotal && !isPreviewOnly && (
        <div className="mt-4 border-t border-gray-600 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">월별 지출 총계</span>
            <button 
              onClick={() => setShowMonthlyTotal(false)}
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              ✕
            </button>
          </div>
          {loading ? (
            <div className="text-center py-2">
              <span className="text-gray-500 text-sm">로딩 중...</span>
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="text-center py-2">
              <span className="text-gray-500 text-sm">기록이 없습니다</span>
            </div>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {monthlyData.map((month) => (
                <div key={month.month} className="flex justify-between items-center py-2 px-2 bg-gray-800 rounded">
                  <div>
                    <span className="text-gray-300 text-sm font-medium">{formatMonth(month.month)}</span>
                    <span className="text-gray-500 text-xs ml-2">({month.count}건)</span>
                  </div>
                  <span className="text-white font-semibold text-sm">
                    {formatCurrency(month.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
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