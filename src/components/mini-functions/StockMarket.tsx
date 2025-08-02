'use client'

import { useState, useEffect, useCallback } from 'react'
import { StockItem, StockData } from '@/types/miniFunctions'

interface StockMarketProps {
  isPreviewOnly?: boolean
}

// 기본 관심 종목 (한국 + 미국)
const DEFAULT_STOCKS = [
  { symbol: '005930.KS', name: '삼성전자' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: '000660.KS', name: 'SK하이닉스' }
]

export default function StockMarket({ isPreviewOnly = false }: StockMarketProps) {
  const [stockData, setStockData] = useState<StockData>({
    watchlist: [],
    lastUpdated: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')
  const [isAddingStock, setIsAddingStock] = useState(false)
  const [apiSource, setApiSource] = useState<'yahoo' | 'mixed' | 'fallback'>('fallback')

  // 모의 주식 데이터 생성 (테스트 기간용)
  const generateMockStockData = (symbols: string[]): StockItem[] => {
    const stockDatabase: Record<string, { name: string; basePrice: number; currency: string }> = {
      '005930.KS': { name: '삼성전자', basePrice: 70000, currency: 'KRW' },
      '000660.KS': { name: 'SK하이닉스', basePrice: 125000, currency: 'KRW' },
      '035420.KS': { name: 'NAVER', basePrice: 180000, currency: 'KRW' },
      '207940.KS': { name: '삼성바이오로직스', basePrice: 850000, currency: 'KRW' },
      'AAPL': { name: 'Apple Inc.', basePrice: 195, currency: 'USD' },
      'GOOGL': { name: 'Alphabet Inc.', basePrice: 140, currency: 'USD' },
      'MSFT': { name: 'Microsoft Corporation', basePrice: 415, currency: 'USD' },
      'TSLA': { name: 'Tesla, Inc.', basePrice: 240, currency: 'USD' },
      'NVDA': { name: 'NVIDIA Corporation', basePrice: 875, currency: 'USD' },
      'AMZN': { name: 'Amazon.com Inc.', basePrice: 155, currency: 'USD' }
    }

    return symbols.map(symbol => {
      const stock = stockDatabase[symbol] || { 
        name: symbol, 
        basePrice: 100, 
        currency: symbol.includes('.KS') ? 'KRW' : 'USD' 
      }
      
      // 랜덤 변동률 생성 (-5% ~ +5%)
      const changePercent = (Math.random() - 0.5) * 10
      const change = stock.basePrice * (changePercent / 100)
      const currentPrice = stock.basePrice + change

      return {
        symbol,
        name: stock.name,
        price: Math.round(currentPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        currency: stock.currency,
        lastUpdated: new Date().toISOString()
      }
    })
  }

  // 실제 주식 데이터 가져오기
  const fetchStockData = useCallback(async (symbols: string[]): Promise<StockItem[]> => {
    try {
      const symbolsQuery = symbols.join(',')
      const response = await fetch(`/api/stocks?symbols=${encodeURIComponent(symbolsQuery)}`)
      const data = await response.json()

      if (data.success && data.data) {
        setApiSource(data.source)
        console.log('Stock API source:', data.source)
        return data.data
      } else {
        throw new Error('Failed to fetch stock data')
      }
    } catch (error) {
      console.error('Stock fetch error:', error)
      // 폴백으로 모의 데이터 사용
      setApiSource('fallback')
      return generateMockStockData(symbols)
    }
  }, [])

  // localStorage에서 관심 종목 로드
  const loadWatchlist = () => {
    try {
      const saved = localStorage.getItem('koouk_stock_watchlist')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.length > 0 ? parsed : DEFAULT_STOCKS.map(s => s.symbol)
      }
      return DEFAULT_STOCKS.map(s => s.symbol)
    } catch {
      return DEFAULT_STOCKS.map(s => s.symbol)
    }
  }

  // localStorage에 관심 종목 저장
  const saveWatchlist = (symbols: string[]) => {
    localStorage.setItem('koouk_stock_watchlist', JSON.stringify(symbols))
  }

  // 주식 데이터 로드
  const loadStockData = useCallback(async () => {
    if (isPreviewOnly) {
      // 프리뷰용 샘플 데이터 - 한국 주식
      setStockData({
        watchlist: [
          {
            symbol: '005930.KS',
            name: '삼성전자',
            price: 71000,
            change: 1000,
            changePercent: 1.43,
            currency: 'KRW',
            lastUpdated: new Date().toISOString()
          },
          {
            symbol: '000660.KS',
            name: 'SK하이닉스',
            price: 125000,
            change: 3500,
            changePercent: 2.88,
            currency: 'KRW',
            lastUpdated: new Date().toISOString()
          },
          {
            symbol: '035420.KS',
            name: 'NAVER',
            price: 180000,
            change: -5000,
            changePercent: -2.70,
            currency: 'KRW',
            lastUpdated: new Date().toISOString()
          },
          {
            symbol: '207940.KS',
            name: '삼성바이오로직스',
            price: 850000,
            change: 15000,
            changePercent: 1.80,
            currency: 'KRW',
            lastUpdated: new Date().toISOString()
          },
          {
            symbol: '373220.KS',
            name: 'LG에너지솔루션',
            price: 420000,
            change: -8000,
            changePercent: -1.87,
            currency: 'KRW',
            lastUpdated: new Date().toISOString()
          }
        ],
        lastUpdated: new Date().toISOString()
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const symbols = await loadWatchlist()
      const stocks = await fetchStockData(symbols)
      
      setStockData({
        watchlist: stocks,
        lastUpdated: new Date().toISOString()
      })
    } catch (err) {
      setError('Failed to load stock data')
      console.error('Stock data error:', err)
    } finally {
      setLoading(false)
    }
  }, [isPreviewOnly, fetchStockData])

  // 새 종목 추가
  const addStock = async () => {
    if (!newSymbol.trim() || stockData.watchlist.length >= 10) return
    
    try {
      setIsAddingStock(true)
      const newStocks = await fetchStockData([newSymbol.trim().toUpperCase()])
      
      if (newStocks.length > 0) {
        const updatedWatchlist = [...stockData.watchlist, newStocks[0]]
        setStockData({
          watchlist: updatedWatchlist,
          lastUpdated: new Date().toISOString()
        })
        
        saveWatchlist(updatedWatchlist.map(s => s.symbol))
        setNewSymbol('')
      }
    } catch {
      alert('Failed to add stock. Please check the symbol.')
    } finally {
      setIsAddingStock(false)
    }
  }

  // 종목 삭제
  const removeStock = (symbol: string) => {
    const updatedWatchlist = stockData.watchlist.filter(s => s.symbol !== symbol)
    setStockData({
      watchlist: updatedWatchlist,
      lastUpdated: new Date().toISOString()
    })
    saveWatchlist(updatedWatchlist.map(s => s.symbol))
  }

  useEffect(() => {
    loadStockData()
    
    // 5분마다 업데이트 (프리뷰가 아닐 때만)
    if (!isPreviewOnly) {
      const interval = setInterval(() => {
        loadStockData()
      }, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isPreviewOnly, loadStockData])

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`
    }
    return `$${price.toFixed(2)}`
  }


  if (loading) {
    return (
      <div className="text-gray-400">
        <div className="animate-pulse">Loading stocks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        <p>{error}</p>
        <button 
          onClick={loadStockData}
          className="text-blue-400 hover:text-blue-300 underline mt-1 cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  const displayedStocks = stockData.watchlist.slice(0, 5) // 메인에서는 5개만
  const allStocks = stockData.watchlist

  return (
    <div className="relative">
      {/* API 상태 표시 */}
      {!isPreviewOnly && (
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📈 주식 정보</span>
            {apiSource === 'yahoo' || apiSource === 'mixed' ? (
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                실시간 데이터
              </span>
            ) : (
              <span className="text-yellow-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                샘플 데이터
              </span>
            )}
          </div>
        </div>
      )}

      {/* API 키 안내 */}
      {!isPreviewOnly && apiSource === 'fallback' && (
        <div className="text-xs text-gray-500 bg-gray-800/50 p-2 rounded mb-3">
          💡 <strong>실시간 주식 데이터</strong>를 위해 API 키를 설정하세요
          <br />• 환경 변수: <code className="text-blue-400">ALPHA_VANTAGE_API_KEY</code>
          <br />• 무료: Yahoo Finance 자동 사용 (제한적)
        </div>
      )}

      {/* 메인 화면: 5개 종목만 표시 */}
      <div className="space-y-2">
        {displayedStocks.map((stock) => (
          <div key={stock.symbol} className="flex justify-between items-center text-sm py-1">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">■</span>
              <span className="font-medium text-white">{stock.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {formatPrice(stock.price, stock.currency)}
              </span>
              <span className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.change >= 0 ? '▲' : '▼'}
              </span>
            </div>
          </div>
        ))}
        
        {allStocks.length > 5 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 border border-gray-700 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
          >
            📊 View All Stocks ({allStocks.length})
          </button>
        )}
      </div>

      {/* 확장된 모달 */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-white">Stock Watchlist</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 종목 리스트 */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {allStocks.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{stock.name}</div>
                      <div className="text-sm text-gray-400">{stock.symbol}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {formatPrice(stock.price, stock.currency)}
                        </div>
                        <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                      {!isPreviewOnly && allStocks.length > 1 && (
                        <button
                          onClick={() => removeStock(stock.symbol)}
                          className="text-red-400 hover:text-red-300 text-sm px-2 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 새 종목 추가 */}
              {!isPreviewOnly && allStocks.length < 10 && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value)}
                      placeholder="Symbol (e.g., AAPL, 005930.KS)"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={addStock}
                      disabled={isAddingStock || !newSymbol.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded"
                    >
                      {isAddingStock ? '...' : '+'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    {allStocks.length}/10 stocks added
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Last updated: {new Date(stockData.lastUpdated).toLocaleTimeString()}</span>
                <button
                  onClick={loadStockData}
                  disabled={loading}
                  className="text-blue-400 hover:text-blue-300"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}