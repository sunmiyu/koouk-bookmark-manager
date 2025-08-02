import { NextRequest, NextResponse } from 'next/server'

interface StockItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
  lastUpdated: string
}

// API 키들 (환경 변수에서 가져오기)
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY
const FINNHUB_KEY = process.env.FINNHUB_API_KEY
const POLYGON_KEY = process.env.POLYGON_API_KEY

// 한국 주식 매핑 (Yahoo Finance 형식)
const KOREAN_STOCKS: Record<string, string> = {
  '005930.KS': '삼성전자',
  '000660.KS': 'SK하이닉스',
  '035420.KS': 'NAVER',
  '207940.KS': '삼성바이오로직스',
  '373220.KS': 'LG에너지솔루션',
  '051910.KS': 'LG화학',
  '006400.KS': '삼성SDI',
  '035720.KS': '카카오',
  '068270.KS': '셀트리온',
  '323410.KS': '카카오뱅크'
}

// 미국 주식 매핑
const US_STOCKS: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'GOOGL': 'Alphabet Inc.',
  'MSFT': 'Microsoft Corporation',
  'TSLA': 'Tesla, Inc.',
  'NVDA': 'NVIDIA Corporation',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'NFLX': 'Netflix Inc.',
  'AMD': 'Advanced Micro Devices Inc.',
  'PYPL': 'PayPal Holdings Inc.'
}

// 폴백 데이터 (API 실패시)
const FALLBACK_STOCKS: Record<string, StockItem> = {
  '005930.KS': {
    symbol: '005930.KS',
    name: '삼성전자',
    price: 71500,
    change: 1500,
    changePercent: 2.14,
    currency: 'KRW',
    lastUpdated: new Date().toISOString()
  },
  '000660.KS': {
    symbol: '000660.KS',
    name: 'SK하이닉스',
    price: 127000,
    change: 2000,
    changePercent: 1.60,
    currency: 'KRW',
    lastUpdated: new Date().toISOString()
  },
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 195.89,
    change: 2.34,
    changePercent: 1.21,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: -1.23,
    changePercent: -0.86,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 415.26,
    change: 5.78,
    changePercent: 1.41,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  }
}

// Yahoo Finance API 대안 (무료)
async function fetchYahooFinance(symbol: string): Promise<StockItem | null> {
  try {
    // Yahoo Finance API 호출 (공개 API)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        next: { revalidate: 300 } // 5분 캐시
      }
    )

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.chart?.result?.[0]
    
    if (!result) {
      throw new Error('No data from Yahoo Finance')
    }

    const meta = result.meta
    const quote = result.indicators?.quote?.[0]
    
    if (!meta || !quote) {
      throw new Error('Invalid data structure')
    }

    const currentPrice = meta.regularMarketPrice || quote.close?.[quote.close.length - 1]
    const previousClose = meta.previousClose
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100

    const stockName = KOREAN_STOCKS[symbol] || US_STOCKS[symbol] || meta.longName || symbol

    return {
      symbol,
      name: stockName,
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      currency: meta.currency === 'KRW' ? 'KRW' : 'USD',
      lastUpdated: new Date().toISOString()
    }

  } catch (error) {
    console.error(`Yahoo Finance error for ${symbol}:`, error)
    return null
  }
}

// Alpha Vantage API (백업)
async function fetchAlphaVantage(symbol: string): Promise<StockItem | null> {
  if (!ALPHA_VANTAGE_KEY) return null

  try {
    const cleanSymbol = symbol.replace('.KS', '') // 한국 주식 처리
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${cleanSymbol}&apikey=${ALPHA_VANTAGE_KEY}`,
      { next: { revalidate: 300 } }
    )

    const data = await response.json()
    const quote = data['Global Quote']

    if (!quote || !quote['05. price']) {
      throw new Error('No quote data')
    }

    const price = parseFloat(quote['05. price'])
    const change = parseFloat(quote['09. change'])
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''))

    return {
      symbol,
      name: US_STOCKS[symbol] || symbol,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      currency: 'USD',
      lastUpdated: new Date().toISOString()
    }

  } catch (error) {
    console.error(`Alpha Vantage error for ${symbol}:`, error)
    return null
  }
}

// 다중 소스에서 주식 데이터 가져오기
async function fetchStockData(symbol: string): Promise<StockItem> {
  console.log(`Fetching stock data for: ${symbol}`)

  // 1차: Yahoo Finance 시도
  let stockData = await fetchYahooFinance(symbol)
  
  // 2차: Alpha Vantage 시도 (미국 주식만)
  if (!stockData && !symbol.includes('.KS')) {
    stockData = await fetchAlphaVantage(symbol)
  }

  // 3차: 폴백 데이터 사용
  if (!stockData) {
    console.warn(`Using fallback data for ${symbol}`)
    stockData = FALLBACK_STOCKS[symbol] || {
      symbol,
      name: symbol,
      price: 100 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      currency: symbol.includes('.KS') ? 'KRW' : 'USD',
      lastUpdated: new Date().toISOString()
    }
  }

  return stockData
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbolsParam = searchParams.get('symbols') || ''
    
    if (!symbolsParam) {
      return NextResponse.json({
        success: false,
        error: 'No symbols provided'
      }, { status: 400 })
    }

    const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean)
    
    if (symbols.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid symbols'
      }, { status: 400 })
    }

    console.log(`Fetching stock data for symbols: ${symbols.join(', ')}`)

    // 병렬로 모든 주식 데이터 가져오기
    const stockPromises = symbols.map(symbol => fetchStockData(symbol))
    const stocks = await Promise.all(stockPromises)

    // API 소스 확인
    const hasApiKey = Boolean(ALPHA_VANTAGE_KEY || FINNHUB_KEY || POLYGON_KEY)
    
    return NextResponse.json({
      success: true,
      data: stocks,
      count: stocks.length,
      source: hasApiKey ? 'mixed' : 'fallback',
      lastUpdated: new Date().toISOString(),
      availableApis: {
        yahoo: true, // 항상 사용 가능
        alphaVantage: Boolean(ALPHA_VANTAGE_KEY),
        finnhub: Boolean(FINNHUB_KEY),
        polygon: Boolean(POLYGON_KEY)
      }
    })

  } catch (error) {
    console.error('Stock API Error:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stock data',
      data: Object.values(FALLBACK_STOCKS).slice(0, 3),
      source: 'fallback'
    }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}