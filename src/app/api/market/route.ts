import { NextResponse } from 'next/server'
import { fetchFromFinnhub } from '@/utils/finnhubApi'

// Interface for Yahoo Finance response (for future use)
// interface YahooFinanceQuote {
//   symbol: string
//   shortName: string
//   regularMarketPrice: number
//   regularMarketChange: number
//   regularMarketChangePercent: number
//   regularMarketTime: number
//   marketState: string
//   region: string
// }

interface MarketIndex {
  symbol: string
  name: string
  region: string
  value: number
  change: number
  changePercent: number
  lastUpdated: string
  marketState: string
}

// Market indices mapping
const MARKET_INDICES = {
  // Americas
  '^GSPC': { name: 'S&P 500', region: 'Americas' },
  '^IXIC': { name: 'NASDAQ Composite', region: 'Americas' },
  '^DJI': { name: 'Dow Jones', region: 'Americas' },
  
  // Europe  
  '^FTSE': { name: 'FTSE 100', region: 'Europe' },
  '^GDAXI': { name: 'DAX', region: 'Europe' },
  '^FCHI': { name: 'CAC 40', region: 'Europe' },
  
  // Asia-Pacific
  '^N225': { name: 'Nikkei 225', region: 'Asia-Pacific' },
  '^HSI': { name: 'Hang Seng', region: 'Asia-Pacific' },
  '^KS11': { name: 'KOSPI', region: 'Asia-Pacific' },
}

// Fallback data for when APIs fail
const generateFallbackData = (): MarketIndex[] => {
  return Object.entries(MARKET_INDICES).map(([symbol, info]) => {
    const baseValue = Math.random() * 5000 + 15000
    const change = (Math.random() - 0.5) * 200
    const changePercent = (change / baseValue) * 100
    
    return {
      symbol,
      name: info.name,
      region: info.region,
      value: parseFloat(baseValue.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      lastUpdated: new Date().toISOString(),
      marketState: 'CLOSED'
    }
  })
}

// Fetch from Yahoo Finance (unofficial method)
async function fetchYahooFinanceData(symbols: string[]): Promise<MarketIndex[]> {
  const results: MarketIndex[] = []
  
  try {
    // Method 1: Try Yahoo Finance API v8 (unofficial)
    const symbolsStr = symbols.join(',')
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbolsStr}?range=1d&interval=1d&includePrePost=true`
    
    console.log('🔄 Fetching from Yahoo Finance:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 60 } // Cache for 1 minute
    })

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.chart?.result) {
      for (const result of data.chart.result) {
        const symbol = result.meta?.symbol
        const quote = result.meta
        
        if (symbol && quote && MARKET_INDICES[symbol as keyof typeof MARKET_INDICES]) {
          const info = MARKET_INDICES[symbol as keyof typeof MARKET_INDICES]
          
          results.push({
            symbol,
            name: info.name,
            region: info.region,
            value: quote.regularMarketPrice || quote.previousClose || 0,
            change: (quote.regularMarketPrice || quote.previousClose || 0) - (quote.previousClose || 0),
            changePercent: ((quote.regularMarketPrice || quote.previousClose || 0) - (quote.previousClose || 0)) / (quote.previousClose || 1) * 100,
            lastUpdated: new Date((quote.regularMarketTime || Date.now()) * 1000).toISOString(),
            marketState: quote.marketState || 'CLOSED'
          })
        }
      }
    }
    
    console.log(`✅ Successfully fetched ${results.length} market indices from Yahoo Finance`)
    return results
    
  } catch (error) {
    console.error('❌ Yahoo Finance fetch failed:', error)
    throw error
  }
}

// Alternative method using individual symbol requests
async function fetchYahooFinanceAlternative(symbols: string[]): Promise<MarketIndex[]> {
  const results: MarketIndex[] = []
  
  for (const symbol of symbols) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const result = data.chart?.result?.[0]
        
        if (result && MARKET_INDICES[symbol as keyof typeof MARKET_INDICES]) {
          const info = MARKET_INDICES[symbol as keyof typeof MARKET_INDICES]
          const quote = result.meta
          
          results.push({
            symbol,
            name: info.name,
            region: info.region,
            value: quote.regularMarketPrice || quote.previousClose || 0,
            change: (quote.regularMarketPrice || quote.previousClose || 0) - (quote.previousClose || 0),
            changePercent: ((quote.regularMarketPrice || quote.previousClose || 0) - (quote.previousClose || 0)) / (quote.previousClose || 1) * 100,
            lastUpdated: new Date((quote.regularMarketTime || Date.now()) * 1000).toISOString(),
            marketState: quote.marketState || 'CLOSED'
          })
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error)
    }
  }
  
  return results
}

// Fetch from Finnhub as backup
async function fetchFinnhubData(symbols: string[]): Promise<MarketIndex[]> {
  const results: MarketIndex[] = []
  
  for (const symbol of symbols) {
    try {
      // Convert Yahoo symbol to appropriate format for Finnhub
      let finnhubSymbol = symbol.replace('^', '')
      if (finnhubSymbol === 'GSPC') finnhubSymbol = 'SPX'
      
      const data = await fetchFromFinnhub(finnhubSymbol)
      
      if (data && data.c > 0 && MARKET_INDICES[symbol as keyof typeof MARKET_INDICES]) {
        const info = MARKET_INDICES[symbol as keyof typeof MARKET_INDICES]
        
        results.push({
          symbol,
          name: info.name,
          region: info.region,
          value: data.c,
          change: data.d,
          changePercent: data.dp,
          lastUpdated: new Date(data.t * 1000).toISOString(),
          marketState: 'REGULAR' // Finnhub doesn't provide market state
        })
      }
      
      // Rate limiting for free tier
      await new Promise(resolve => setTimeout(resolve, 50))
      
    } catch (error) {
      console.error(`Failed to fetch ${symbol} from Finnhub:`, error)
    }
  }
  
  return results
}

export async function GET() {
  try {
    console.log('📊 Market API called')
    
    const symbols = Object.keys(MARKET_INDICES)
    let marketData: MarketIndex[] = []
    let source = 'fallback'
    
    try {
      // Try primary Yahoo Finance method
      marketData = await fetchYahooFinanceData(symbols)
      
      if (marketData.length > 0) {
        source = 'yahoo_finance'
      } else {
        throw new Error('No data from primary method')
      }
      
    } catch {
      console.warn('Primary Yahoo Finance method failed, trying alternative...')
      
      try {
        // Try alternative method
        marketData = await fetchYahooFinanceAlternative(symbols)
        
        if (marketData.length > 0) {
          source = 'yahoo_finance_alt'
        } else {
          throw new Error('No data from alternative method')
        }
        
      } catch {
        console.warn('Alternative Yahoo method failed, trying Finnhub...')
        
        try {
          // Try Finnhub as third option
          marketData = await fetchFinnhubData(symbols)
          
          if (marketData.length > 0) {
            source = 'finnhub'
          } else {
            throw new Error('No data from Finnhub')
          }
          
        } catch {
          console.warn('All APIs failed, using fallback data')
          marketData = generateFallbackData()
          source = 'fallback'
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: marketData,
      count: marketData.length,
      source,
      lastUpdated: new Date().toISOString(),
      disclaimer: source === 'fallback' 
        ? 'Using simulated data - Yahoo Finance API unavailable'
        : 'Data provided by Yahoo Finance (unofficial API)'
    })
    
  } catch (error) {
    console.error('Market API Error:', error)
    
    // Return fallback data even on critical error
    const fallbackData = generateFallbackData()
    
    return NextResponse.json({
      success: false,
      data: fallbackData,
      count: fallbackData.length,
      source: 'fallback_error',
      error: 'Market API temporarily unavailable',
      lastUpdated: new Date().toISOString(),
      disclaimer: 'Using simulated data due to API error'
    })
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}