// Alternative free API: Finnhub.io
// You can get a free API key from https://finnhub.io/

interface FinnhubQuote {
  c: number // Current price
  d: number // Change
  dp: number // Percent change
  h: number // High price of the day
  l: number // Low price of the day
  o: number // Open price of the day
  pc: number // Previous close price
  t: number // Timestamp
}

// Map Yahoo Finance symbols to Finnhub symbols
// const SYMBOL_MAPPING: Record<string, string> = {
//   '^GSPC': 'SPX', // S&P 500
//   '^IXIC': 'IXIC', // NASDAQ
//   '^DJI': 'DJI', // Dow Jones
//   '^FTSE': 'UKX', // FTSE 100
//   '^GDAXI': 'DAX', // DAX
//   '^FCHI': 'PX1', // CAC 40
//   '^N225': 'NKY', // Nikkei 225
//   '^HSI': 'HSI', // Hang Seng
//   '^KS11': 'KS11', // KOSPI
// }

export async function fetchFromFinnhub(symbol: string): Promise<FinnhubQuote | null> {
  // Free tier allows 60 API calls/minute
  const API_KEY = process.env.FINNHUB_API_KEY || 'demo' // demo key has limited data
  
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`,
      {
        next: { revalidate: 60 } // Cache for 1 minute
      }
    )
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }
    
    const data: FinnhubQuote = await response.json()
    
    // Check if we got valid data
    if (data.c && data.c > 0) {
      return data
    }
    
    return null
    
  } catch (error) {
    console.error(`Failed to fetch ${symbol} from Finnhub:`, error)
    return null
  }
}

// Alpha Vantage as another alternative (also free but requires API key)  
export async function fetchFromAlphaVantage(symbol: string) {
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY
  
  if (!API_KEY) {
    console.warn('Alpha Vantage API key not found')
    return null
  }
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes (free tier limit)
      }
    )
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`)
    }
    
    const data = await response.json()
    const quote = data['Global Quote']
    
    if (quote && quote['05. price']) {
      return {
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        timestamp: quote['07. latest trading day']
      }
    }
    
    return null
    
  } catch (error) {
    console.error(`Failed to fetch ${symbol} from Alpha Vantage:`, error)
    return null
  }
}