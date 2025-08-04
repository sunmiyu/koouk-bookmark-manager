'use client'

import { useState, useEffect } from 'react'
import { cachedFetch, cacheKeys } from '@/utils/apiCache'

interface MarketIndex {
  symbol: string
  name: string
  region: string
  value: number
  change: number
  changePercent: number
  lastUpdated: string
}

interface MarketData {
  [key: string]: MarketIndex
}

// Market indices are now fetched from API, this is kept for reference
// const MARKET_INDICES = {
//   // Americas
//   'SPX': { name: 'S&P 500', region: 'Americas' },
//   'IXIC': { name: 'NASDAQ', region: 'Americas' },
//   'DJI': { name: 'Dow Jones', region: 'Americas' },
//   
//   // Europe  
//   'UKX': { name: 'FTSE 100', region: 'Europe' },
//   'DAX': { name: 'DAX', region: 'Europe' },
//   'CAC': { name: 'CAC 40', region: 'Europe' },
//   
//   // Asia-Pacific
//   'NKY': { name: 'Nikkei 225', region: 'Asia-Pacific' },
//   'HSI': { name: 'Hang Seng', region: 'Asia-Pacific' },
//   'KOSPI': { name: 'KOSPI', region: 'Asia-Pacific' },
// }

// Convert API data to MarketData format
const processMarketData = (apiData: MarketIndex[]): MarketData => {
  const marketData: MarketData = {}
  
  apiData.forEach((item) => {
    marketData[item.symbol] = {
      symbol: item.symbol,
      name: item.name,
      region: item.region,
      value: item.value,
      change: item.change,
      changePercent: item.changePercent,
      lastUpdated: item.lastUpdated
    }
  })
  
  return marketData
}

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['Americas', 'Europe', 'Asia-Pacific'])
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string>('loading')

  // Fetch market data with caching
  const fetchMarketData = async (force = false) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const apiResponse = await cachedFetch.market(
        cacheKeys.marketOverview(),
        async () => {
          console.log('🔄 Fetching fresh market data from API...')
          const response = await fetch('/api/market')
          
          if (!response.ok) {
            throw new Error(`Market API error: ${response.status}`)
          }
          
          return await response.json()
        },
        force
      )
      
      if (apiResponse.success && apiResponse.data) {
        const processedData = processMarketData(apiResponse.data)
        setMarketData(processedData)
        setDataSource(apiResponse.source || 'unknown')
        setLastRefresh(new Date())
        console.log(`✅ Market data loaded from ${apiResponse.source} (${apiResponse.count} indices)`)
      } else {
        throw new Error(apiResponse.error || 'Invalid API response')
      }
    } catch (err) {
      console.error('Failed to fetch market data:', err)
      setError('Failed to load market data')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchMarketData()
  }, [])

  // Group indices by region
  const groupedData = Object.values(marketData).reduce((groups, index) => {
    if (!groups[index.region]) {
      groups[index.region] = []
    }
    groups[index.region].push(index)
    return groups
  }, {} as Record<string, MarketIndex[]>)

  // Filter by selected regions
  const filteredData = Object.keys(groupedData)
    .filter(region => selectedRegions.includes(region))
    .reduce((filtered, region) => {
      filtered[region] = groupedData[region]
      return filtered
    }, {} as Record<string, MarketIndex[]>)

  const formatValue = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatChange = (change: number, isPercent = false): string => {
    const formatted = Math.abs(change).toFixed(2)
    const sign = change >= 0 ? '+' : '-'
    return `${sign}${formatted}${isPercent ? '%' : ''}`
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Market Overview
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${
              isLoading 
                ? 'text-yellow-400 bg-yellow-400/10'
                : dataSource === 'yahoo_finance' || dataSource === 'yahoo_finance_alt'
                ? 'text-green-400 bg-green-400/10'
                : dataSource === 'finnhub'
                ? 'text-blue-400 bg-blue-400/10'
                : dataSource === 'fallback' || dataSource === 'fallback_error'
                ? 'text-orange-400 bg-orange-400/10'
                : 'text-gray-400 bg-gray-400/10'
            }`}>
              {isLoading 
                ? 'Loading...'
                : dataSource === 'yahoo_finance' || dataSource === 'yahoo_finance_alt'
                ? 'Live Data'
                : dataSource === 'finnhub'
                ? 'Real-time'
                : dataSource === 'fallback' || dataSource === 'fallback_error'
                ? 'Demo Data'
                : '15min delay'}
            </span>
            {error && (
              <span className="text-xs text-yellow-400" title={error}>⚠️</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Region Filter */}
          <div className="hidden sm:flex items-center gap-1">
            {['Americas', 'Europe', 'Asia-Pacific'].map(region => (
              <button
                key={region}
                onClick={() => {
                  setSelectedRegions(prev => 
                    prev.includes(region) 
                      ? prev.filter(r => r !== region)
                      : [...prev, region]
                  )
                }}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedRegions.includes(region)
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'bg-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
              >
                {region === 'Americas' ? 'US' : region === 'Asia-Pacific' ? 'APAC' : region}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchMarketData(true)}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data (force)"
          >
            <svg 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && Object.keys(marketData).length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded mb-3 w-24"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="bg-gray-800/30 rounded-lg p-3">
                    <div className="h-3 bg-gray-700/50 rounded mb-2"></div>
                    <div className="h-6 bg-gray-700/50 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Market Data */
        <div className="space-y-6">
          {Object.keys(filteredData).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p>Select regions to view market data</p>
            </div>
          ) : (
            Object.entries(filteredData).map(([region, indices]) => (
              <div key={region}>
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {region}
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {indices.map((index) => (
                    <button
                      key={index.symbol}
                      className="bg-gray-800/30 hover:bg-gray-800/50 rounded-lg p-3 sm:p-4 text-left transition-all duration-200 border border-transparent hover:border-gray-600/30 group"
                      onClick={() => {
                        // TODO: Open detailed view or redirect to financial site
                        window.open(`https://finance.yahoo.com/quote/${index.symbol}`, '_blank')
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h5 className="text-xs sm:text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                          {index.name}
                        </h5>
                        <span className="text-xs text-gray-500 mt-1 sm:mt-0">{index.symbol}</span>
                      </div>
                      
                      <div className="mb-2">
                        <span className="text-base sm:text-lg font-semibold text-white">
                          {formatValue(index.value)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${
                          index.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <svg className={`w-2 h-2 sm:w-3 sm:h-3 ${index.change >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          {formatChange(index.change)}
                        </span>
                        <span className={`text-xs sm:text-sm ${
                          index.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ({formatChange(index.changePercent, true)})
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Last Updated */}
      {lastRefresh && (
        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}