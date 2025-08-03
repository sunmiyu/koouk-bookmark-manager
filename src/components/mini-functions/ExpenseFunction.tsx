'use client'

import { useState, useEffect } from 'react'

interface ExpenseItem {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
}

export default function ExpenseFunction() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '식비'
  })

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('miniFunction_expenses')
    if (saved) {
      setExpenses(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (items: ExpenseItem[]) => {
    localStorage.setItem('miniFunction_expenses', JSON.stringify(items))
    setExpenses(items)
  }

  const addItem = () => {
    if (!newItem.amount || !newItem.description) return

    const item: ExpenseItem = {
      id: Date.now().toString(),
      type: newItem.type,
      amount: parseInt(newItem.amount),
      description: newItem.description,
      category: newItem.category,
      date: new Date().toISOString().split('T')[0]
    }

    const updated = [item, ...expenses]
    saveToStorage(updated)
    
    setNewItem({
      type: 'expense',
      amount: '',
      description: '',
      category: '식비'
    })
    setShowAddForm(false)
  }

  const deleteItem = (id: string) => {
    const updated = expenses.filter(item => item.id !== id)
    saveToStorage(updated)
  }

  const today = new Date().toISOString().split('T')[0]
  const todayItems = expenses.filter(item => item.date === today)
  const todayIncome = todayItems.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const todayExpense = todayItems.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)

  const categories = ['식비', '교통비', '쇼핑', '문화생활', '의료비', '기타']

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
          <div className="text-xs text-green-400 mb-1">오늘 수입</div>
          <div className="text-lg font-bold text-green-400">+{todayIncome.toLocaleString()}원</div>
        </div>
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
          <div className="text-xs text-red-400 mb-1">오늘 지출</div>
          <div className="text-lg font-bold text-red-400">-{todayExpense.toLocaleString()}원</div>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {showAddForm ? '취소' : '+ 추가'}
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setNewItem(prev => ({ ...prev, type: 'expense' }))}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                newItem.type === 'expense' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              지출
            </button>
            <button
              onClick={() => setNewItem(prev => ({ ...prev, type: 'income' }))}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                newItem.type === 'income' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              수입
            </button>
          </div>
          
          <input
            type="number"
            placeholder="금액"
            value={newItem.amount}
            onChange={(e) => setNewItem(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          />
          
          <input
            type="text"
            placeholder="내용"
            value={newItem.description}
            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          />
          
          <select
            value={newItem.category}
            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <button
            onClick={addItem}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
          >
            저장
          </button>
        </div>
      )}

      {/* Recent Items */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {expenses.slice(0, 10).map(item => (
          <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-gray-800/40 rounded border border-gray-700/20">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  item.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()}원
                </span>
                <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                  {item.category}
                </span>
              </div>
              <div className="text-xs text-gray-400 truncate">{item.description}</div>
              <div className="text-xs text-gray-500">{item.date}</div>
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-gray-500 hover:text-red-400 text-xs ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}