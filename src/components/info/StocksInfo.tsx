'use client'

import { useState } from 'react'

type StockData = {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume?: number
  marketCap?: string
}

export default function StocksInfo() {
  const [watchlist, setWatchlist] = useState<StockData[]>([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.43,
      change: 2.15,
      changePercent: 1.24,
      volume: 45623000,
      marketCap: '2.75T'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.56,
      change: -1.23,
      changePercent: -0.85,
      volume: 28456000,
      marketCap: '1.78T'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 248.87,
      change: 12.45,
      changePercent: 5.26,
      volume: 89234000,
      marketCap: '792B'
    }
  ])

  const [newSymbol, setNewSymbol] = useState('')
  const [marketSummary] = useState({
    sp500: { value: 4567.89, change: 23.45, changePercent: 0.52 },
    nasdaq: { value: 14234.56, change: -45.67, changePercent: -0.32 },
    dow: { value: 34567.12, change: 156.78, changePercent: 0.46 }
  })

  const addToWatchlist = () => {
    if (newSymbol.trim()) {
      // 실제로는 API 호출로 주식 데이터를 가져와야 함
      const mockStock: StockData = {
        symbol: newSymbol.toUpperCase(),
        name: `${newSymbol.toUpperCase()} Company`,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 100000000),
        marketCap: '1.2T'
      }
      setWatchlist(prev => [mockStock, ...prev])
      setNewSymbol('')
    }
  }

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol))
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'var(--success)' : 'var(--error)'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="h-full" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📈</span>
          <h1 style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: '700', 
            color: 'var(--text-primary)' 
          }}>
            주식 정보
          </h1>
        </div>
      </div>

      {/* Market Summary */}
      <div className="bg-white rounded-lg border p-4 mb-6" style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)'
      }}>
        <h3 style={{ 
          fontSize: 'var(--text-lg)', 
          fontWeight: '600', 
          marginBottom: 'var(--space-3)',
          color: 'var(--text-primary)'
        }}>
          시장 현황
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>S&P 500</div>
            <div style={{ color: 'var(--text-primary)', fontSize: 'var(--text-lg)', fontWeight: '600' }}>
              {formatNumber(marketSummary.sp500.value)}
            </div>
            <div style={{ color: getChangeColor(marketSummary.sp500.change), fontSize: 'var(--text-sm)' }}>
              {marketSummary.sp500.change > 0 ? '+' : ''}{marketSummary.sp500.change.toFixed(2)} 
              ({marketSummary.sp500.changePercent > 0 ? '+' : ''}{marketSummary.sp500.changePercent.toFixed(2)}%)
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>NASDAQ</div>
            <div style={{ color: 'var(--text-primary)', fontSize: 'var(--text-lg)', fontWeight: '600' }}>
              {formatNumber(marketSummary.nasdaq.value)}
            </div>
            <div style={{ color: getChangeColor(marketSummary.nasdaq.change), fontSize: 'var(--text-sm)' }}>
              {marketSummary.nasdaq.change > 0 ? '+' : ''}{marketSummary.nasdaq.change.toFixed(2)} 
              ({marketSummary.nasdaq.changePercent > 0 ? '+' : ''}{marketSummary.nasdaq.changePercent.toFixed(2)}%)
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Dow Jones</div>
            <div style={{ color: 'var(--text-primary)', fontSize: 'var(--text-lg)', fontWeight: '600' }}>
              {formatNumber(marketSummary.dow.value)}
            </div>
            <div style={{ color: getChangeColor(marketSummary.dow.change), fontSize: 'var(--text-sm)' }}>
              {marketSummary.dow.change > 0 ? '+' : ''}{marketSummary.dow.change.toFixed(2)} 
              ({marketSummary.dow.changePercent > 0 ? '+' : ''}{marketSummary.dow.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Add Stock Form */}
      <div className="bg-white rounded-lg border p-4 mb-6" style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)'
      }}>
        <h3 style={{ 
          fontSize: 'var(--text-lg)', 
          fontWeight: '600', 
          marginBottom: 'var(--space-3)',
          color: 'var(--text-primary)'
        }}>
          관심 종목 추가
        </h3>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="종목 심볼 (예: AAPL, GOOGL)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            className="flex-1 px-3 py-2 border rounded"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
            onKeyPress={(e) => e.key === 'Enter' && addToWatchlist()}
          />
          <button
            onClick={addToWatchlist}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            추가
          </button>
        </div>
      </div>

      {/* Watchlist */}
      <div className="bg-white rounded-lg border" style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-light)'
      }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h3 style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            관심 종목
          </h3>
        </div>
        
        <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
          {watchlist.map(stock => (
            <div key={stock.symbol} className="p-4 hover:bg-gray-50 transition-colors" style={{
              backgroundColor: 'transparent'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {stock.symbol}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {stock.name}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(stock.price)}
                  </div>
                  <div style={{ color: getChangeColor(stock.change), fontSize: 'var(--text-sm)' }}>
                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} 
                    ({stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
                
                <button
                  onClick={() => removeFromWatchlist(stock.symbol)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              
              {stock.volume && (
                <div className="mt-2 text-sm flex justify-between" style={{ color: 'var(--text-muted)' }}>
                  <span>거래량: {formatNumber(stock.volume)}</span>
                  {stock.marketCap && <span>시가총액: {stock.marketCap}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}