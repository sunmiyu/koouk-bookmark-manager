'use client'

import { useState, useEffect } from 'react'

interface ConversionHistory {
  id: string
  fromValue: number
  toValue: number
  fromUnit: string
  toUnit: string
  category: string
  timestamp: string
}

interface FavoriteConversion {
  id: string
  name: string
  fromUnit: string
  toUnit: string
  category: string
}

export default function UnitConverterControlPanel() {
  const [history, setHistory] = useState<ConversionHistory[]>([])
  const [favorites, setFavorites] = useState<FavoriteConversion[]>([])
  const [selectedCategory, setSelectedCategory] = useState('길이')
  const [fromUnit, setFromUnit] = useState('')
  const [toUnit, setToUnit] = useState('')
  const [fromValue, setFromValue] = useState('')
  const [toValue, setToValue] = useState('')
  const [showAddFavorite, setShowAddFavorite] = useState(false)

  const [newFavorite, setNewFavorite] = useState({
    name: '',
    category: '길이',
    fromUnit: '',
    toUnit: ''
  })

  const unitCategories = {
    '길이': {
      units: {
        'm': { name: '미터', factor: 1 },
        'cm': { name: '센티미터', factor: 0.01 },
        'mm': { name: '밀리미터', factor: 0.001 },
        'km': { name: '킬로미터', factor: 1000 },
        'inch': { name: '인치', factor: 0.0254 },
        'ft': { name: '피트', factor: 0.3048 },
        'yard': { name: '야드', factor: 0.9144 },
        'mile': { name: '마일', factor: 1609.34 }
      }
    },
    '무게': {
      units: {
        'kg': { name: '킬로그램', factor: 1 },
        'g': { name: '그램', factor: 0.001 },
        'mg': { name: '밀리그램', factor: 0.000001 },
        'ton': { name: '톤', factor: 1000 },
        'lb': { name: '파운드', factor: 0.453592 },
        'oz': { name: '온스', factor: 0.0283495 }
      }
    },
    '온도': {
      units: {
        'C': { name: '섭씨', factor: 1 },
        'F': { name: '화씨', factor: 1 },
        'K': { name: '켈빈', factor: 1 }
      }
    },
    '부피': {
      units: {
        'L': { name: '리터', factor: 1 },
        'mL': { name: '밀리리터', factor: 0.001 },
        'gal': { name: '갤런', factor: 3.78541 },
        'qt': { name: '쿼트', factor: 0.946353 },
        'pt': { name: '파인트', factor: 0.473176 },
        'cup': { name: '컵', factor: 0.236588 },
        'fl_oz': { name: '액량온스', factor: 0.0295735 }
      }
    },
    '면적': {
      units: {
        'm2': { name: '제곱미터', factor: 1 },
        'cm2': { name: '제곱센티미터', factor: 0.0001 },
        'km2': { name: '제곱킬로미터', factor: 1000000 },
        'ft2': { name: '제곱피트', factor: 0.092903 },
        'acre': { name: '에이커', factor: 4046.86 },
        'hectare': { name: '헥타르', factor: 10000 }
      }
    },
    '시간': {
      units: {
        'sec': { name: '초', factor: 1 },
        'min': { name: '분', factor: 60 },
        'hour': { name: '시간', factor: 3600 },
        'day': { name: '일', factor: 86400 },
        'week': { name: '주', factor: 604800 },
        'month': { name: '월', factor: 2592000 },
        'year': { name: '년', factor: 31536000 }
      }
    }
  }

  useEffect(() => {
    const savedHistory = localStorage.getItem('miniFunction_unitHistory')
    const savedFavorites = localStorage.getItem('miniFunction_unitFavorites')
    
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  useEffect(() => {
    const units = Object.keys(unitCategories[selectedCategory as keyof typeof unitCategories].units)
    if (units.length > 0) {
      setFromUnit(units[0])
      setToUnit(units[1] || units[0])
    }
    setFromValue('')
    setToValue('')
  }, [selectedCategory, unitCategories])

  const convertValue = (value: number, from: string, to: string, category: string): number => {
    if (category === '온도') {
      // Temperature conversion
      if (from === 'C' && to === 'F') return (value * 9/5) + 32
      if (from === 'F' && to === 'C') return (value - 32) * 5/9
      if (from === 'C' && to === 'K') return value + 273.15
      if (from === 'K' && to === 'C') return value - 273.15
      if (from === 'F' && to === 'K') return ((value - 32) * 5/9) + 273.15
      if (from === 'K' && to === 'F') return ((value - 273.15) * 9/5) + 32
      return value
    } else {
      // Linear conversion
      const categoryData = unitCategories[category as keyof typeof unitCategories]
      const fromFactor = categoryData.units[from as keyof typeof categoryData.units]?.factor || 1
      const toFactor = categoryData.units[to as keyof typeof categoryData.units]?.factor || 1
      return (value * fromFactor) / toFactor
    }
  }

  const handleConvert = () => {
    const value = parseFloat(fromValue)
    if (isNaN(value)) return

    const converted = convertValue(value, fromUnit, toUnit, selectedCategory)
    setToValue(converted.toString())

    // Save to history
    const conversion: ConversionHistory = {
      id: Date.now().toString(),
      fromValue: value,
      toValue: converted,
      fromUnit,
      toUnit,
      category: selectedCategory,
      timestamp: new Date().toISOString()
    }

    const updatedHistory = [conversion, ...history].slice(0, 50) // Keep last 50
    localStorage.setItem('miniFunction_unitHistory', JSON.stringify(updatedHistory))
    setHistory(updatedHistory)
  }

  const addToFavorites = () => {
    if (!newFavorite.name.trim() || !newFavorite.fromUnit || !newFavorite.toUnit) return

    const favorite: FavoriteConversion = {
      id: Date.now().toString(),
      name: newFavorite.name.trim(),
      fromUnit: newFavorite.fromUnit,
      toUnit: newFavorite.toUnit,
      category: newFavorite.category
    }

    const updated = [...favorites, favorite]
    localStorage.setItem('miniFunction_unitFavorites', JSON.stringify(updated))
    setFavorites(updated)
    
    setNewFavorite({
      name: '',
      category: '길이',
      fromUnit: '',
      toUnit: ''
    })
    setShowAddFavorite(false)
  }

  const deleteFavorite = (id: string) => {
    if (confirm('이 즐겨찾기를 삭제하시겠습니까?')) {
      const updated = favorites.filter(fav => fav.id !== id)
      localStorage.setItem('miniFunction_unitFavorites', JSON.stringify(updated))
      setFavorites(updated)
    }
  }

  const loadFavorite = (favorite: FavoriteConversion) => {
    setSelectedCategory(favorite.category)
    setFromUnit(favorite.fromUnit)
    setToUnit(favorite.toUnit)
    setFromValue('')
    setToValue('')
  }

  const currentUnits = unitCategories[selectedCategory as keyof typeof unitCategories]?.units || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">단위 변환기</h3>
          <p className="text-sm text-gray-600">다양한 단위를 쉽게 변환하고 즐겨찾기로 저장하세요</p>
        </div>
        <button
          onClick={() => setShowAddFavorite(!showAddFavorite)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + 즐겨찾기 추가
        </button>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">변환 카테고리</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Object.keys(unitCategories).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 text-sm rounded transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Converter */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">변환할 값</label>
            <input
              type="number"
              step="any"
              placeholder="숫자를 입력하세요"
              value={fromValue}
              onChange={(e) => {
                setFromValue(e.target.value)
                setToValue('')
              }}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm mb-2"
            />
            <select
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value)
                setToValue('')
              }}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
            >
              {Object.entries(currentUnits).map(([unit, data]) => (
                <option key={unit} value={unit}>{data.name} ({unit})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">변환 결과</label>
            <input
              type="text"
              readOnly
              value={toValue}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 text-sm mb-2"
              placeholder="변환 결과"
            />
            <select
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value)
                setToValue('')
              }}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
            >
              {Object.entries(currentUnits).map(([unit, data]) => (
                <option key={unit} value={unit}>{data.name} ({unit})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleConvert}
            disabled={!fromValue}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            변환하기
          </button>
        </div>
      </div>

      {/* Add Favorite Form */}
      {showAddFavorite && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4">
          <h4 className="text-md font-medium text-gray-900">즐겨찾기 추가</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">즐겨찾기 이름</label>
              <input
                type="text"
                placeholder="예: 키 변환, 요리 측정"
                value={newFavorite.name}
                onChange={(e) => setNewFavorite(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={newFavorite.category}
                onChange={(e) => setNewFavorite(prev => ({ ...prev, category: e.target.value, fromUnit: '', toUnit: '' }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 text-sm"
              >
                {Object.keys(unitCategories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">변환 시작 단위</label>
              <select
                value={newFavorite.fromUnit}
                onChange={(e) => setNewFavorite(prev => ({ ...prev, fromUnit: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 text-sm"
              >
                <option value="">단위 선택</option>
                {Object.entries(unitCategories[newFavorite.category as keyof typeof unitCategories]?.units || {}).map(([unit, data]) => (
                  <option key={unit} value={unit}>{data.name} ({unit})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">변환 대상 단위</label>
              <select
                value={newFavorite.toUnit}
                onChange={(e) => setNewFavorite(prev => ({ ...prev, toUnit: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 text-sm"
              >
                <option value="">단위 선택</option>
                {Object.entries(unitCategories[newFavorite.category as keyof typeof unitCategories]?.units || {}).map(([unit, data]) => (
                  <option key={unit} value={unit}>{data.name} ({unit})</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={addToFavorites}
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            즐겨찾기 저장
          </button>
        </div>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">즐겨찾기 변환</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favorites.map(favorite => (
              <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-md font-medium text-gray-900">{favorite.name}</div>
                    <div className="text-sm text-gray-600">
                      {favorite.category}: {favorite.fromUnit} → {favorite.toUnit}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadFavorite(favorite)}
                      className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs transition-colors"
                    >
                      사용
                    </button>
                    <button
                      onClick={() => deleteFavorite(favorite.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">최근 변환 내역</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.slice(0, 10).map(item => (
              <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.fromValue} {item.fromUnit} = {item.toValue.toFixed(4)} {item.toUnit}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.category} • {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}