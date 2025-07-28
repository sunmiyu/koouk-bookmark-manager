'use client'

import { useState, useEffect } from 'react'
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

  // Yahoo Finance API 호출
  const fetchStockData = async (symbols: string[]) => {
    try {
      const promises = symbols.map(async (symbol) => {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${symbol}`)
        }
        
        const data = await response.json()
        const result = data?.chart?.result?.[0]
        
        if (!result) {
          throw new Error(`No data for ${symbol}`)
        }

        const meta = result.meta
        const currentPrice = meta.regularMarketPrice || 0
        const previousClose = meta.previousClose || 0
        const change = currentPrice - previousClose
        const changePercent = (change / previousClose) * 100

        return {
          symbol: symbol,
          name: meta.longName || symbol,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          currency: meta.currency || 'USD',
          lastUpdated: new Date().toISOString()
        } as StockItem
      })

      const results = await Promise.all(promises)
      return results.filter(stock => stock.price > 0) // 유효한 데이터만 필터링
    } catch (error) {
      console.error('Error fetching stock data:', error)
      throw error
    }
  }

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
  const loadStockData = async () => {
    if (isPreviewOnly) {
      // 프리뷰용 샘플 데이터
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
            symbol: 'AAPL',
            name: 'Apple Inc.',
            price: 195.50,
            change: -2.30,
            changePercent: -1.16,
            currency: 'USD',
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
      
      const symbols = loadWatchlist()
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
  }

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
      const interval = setInterval(loadStockData, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isPreviewOnly, loadStockData])

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`
    }
    return `$${price.toFixed(2)}`
  }

  const formatChange = (change: number, changePercent: number, currency: string) => {
    const changeStr = currency === 'KRW' 
      ? `₩${Math.abs(change).toLocaleString()}`
      : `$${Math.abs(change).toFixed(2)}`
    
    return `${change >= 0 ? '+' : '-'}${changeStr} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`
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
          className="text-blue-400 hover:text-blue-300 underline mt-1"
        >
          Retry
        </button>
      </div>
    )
  }

  const displayedStocks = stockData.watchlist.slice(0, 3) // 메인에서는 3개만
  const allStocks = stockData.watchlist

  return (
    <div className="relative">
      {/* 메인 화면: 3개 종목만 표시 */}
      <div className="space-y-2">
        {displayedStocks.map((stock) => (
          <div key={stock.symbol} className="flex items-center justify-between text-sm">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{stock.name}</div>
              <div className="text-xs text-gray-400">{stock.symbol}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-white">
                {formatPrice(stock.price, stock.currency)}
              </div>
              <div className={`text-xs ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatChange(stock.change, stock.changePercent, stock.currency)}
              </div>
            </div>
          </div>
        ))}
        
        {allStocks.length > 3 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-center text-blue-400 hover:text-blue-300 text-sm py-2 border border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
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
                className="text-gray-400 hover:text-white"
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
                    <div className="text-right mr-3">
                      <div className="font-medium text-white">
                        {formatPrice(stock.price, stock.currency)}
                      </div>
                      <div className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatChange(stock.change, stock.changePercent, stock.currency)}
                      </div>
                    </div>
                    {!isPreviewOnly && allStocks.length > 1 && (
                      <button
                        onClick={() => removeStock(stock.symbol)}
                        className="text-red-400 hover:text-red-300 text-sm px-2"
                      >
                        ✕
                      </button>
                    )}
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
                  <div className="text-xs text-gray-400 mt-2">
                    {allStocks.length}/10 stocks added
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex justify-between items-center text-xs text-gray-400">
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