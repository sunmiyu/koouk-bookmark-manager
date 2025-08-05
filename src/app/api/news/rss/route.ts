import { NextRequest, NextResponse } from 'next/server'

interface NewsItem {
  title: string
  url: string
  source: string
  publishedAt: string
}

interface NaverNewsItem {
  title: string
  originallink: string
  link: string
  pubDate: string
}

// 해외 사용자를 위한 주요 뉴스 사이트 링크
const INTERNATIONAL_NEWS_LINKS: NewsItem[] = [
  {
    title: "BBC News - Breaking News, World News",
    url: "https://www.bbc.com/news",
    source: "BBC",
    publishedAt: new Date().toISOString()
  },
  {
    title: "CNN - Breaking News, Latest News and Videos",
    url: "https://www.cnn.com",
    source: "CNN",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Reuters - Business & Financial News",
    url: "https://www.reuters.com",
    source: "Reuters",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Associated Press News",
    url: "https://apnews.com",
    source: "AP News",
    publishedAt: new Date().toISOString()
  },
  {
    title: "The Guardian - International News",
    url: "https://www.theguardian.com/international",
    source: "The Guardian",
    publishedAt: new Date().toISOString()
  },
  {
    title: "TechCrunch - Tech & Startup News",
    url: "https://techcrunch.com",
    source: "TechCrunch",
    publishedAt: new Date().toISOString()
  }
]



// IP 기반 지역 감지 - 개선된 버전
function detectRegionFromIP(request: NextRequest): string {
  // 다양한 헤더에서 국가 정보 확인
  const country = request.headers.get('cf-ipcountry') || 
                 request.headers.get('x-vercel-ip-country') ||
                 request.headers.get('x-country-code') ||
                 request.headers.get('cloudfront-viewer-country')

  // Accept-Language 헤더에서 언어 정보 확인 (fallback)
  const acceptLanguage = request.headers.get('accept-language') || ''
  const hasKorean = acceptLanguage.includes('ko') || acceptLanguage.includes('kr')

  // IP 주소 확인 (추가 fallback)
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') ||
            request.headers.get('cf-connecting-ip')

  console.log('Region detection:', {
    country,
    acceptLanguage,
    hasKorean,
    ip: ip ? ip.substring(0, 8) + '...' : 'unknown'
  })
  
  // 한국 감지 로직
  if (country === 'KR' || country === 'Korea' || hasKorean) {
    console.log('✅ Korean user detected')
    return 'kr'
  }
  
  console.log('🌍 International user detected')
  return 'international'
}

// 네이버 뉴스 API 호출 - 최신 뉴스 Top 10
async function fetchNaverNews(): Promise<NewsItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  console.log('Naver API credentials check:', {
    clientId: clientId ? `Present (${clientId.substring(0, 5)}...)` : 'Missing',
    clientSecret: clientSecret ? `Present (${clientSecret.substring(0, 5)}...)` : 'Missing',
    envKeys: Object.keys(process.env).filter(key => key.includes('NAVER'))
  })

  if (!clientId || !clientSecret) {
    console.warn('Naver API credentials not found')
    return []
  }

  try {
    // 여러 키워드로 최신 뉴스를 가져와서 합치기
    const keywords = ['속보', '뉴스', '오늘', '최신']
    const allNews: NaverNewsItem[] = []

    for (const keyword of keywords) {
      try {
        const query = encodeURIComponent(keyword)
        const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=5&start=1&sort=date`

        console.log(`Fetching news for keyword: ${keyword} from URL: ${url}`)
        
        const response = await fetch(url, {
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
            'User-Agent': 'KooukNews/1.0'
          }
        })

        console.log(`Response status for ${keyword}:`, response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`Data received for ${keyword}:`, {
            total: data.total || 0,
            start: data.start || 0,
            display: data.display || 0,
            itemsCount: data.items ? data.items.length : 0
          })
          
          if (data.items && data.items.length > 0) {
            allNews.push(...data.items)
          }
        } else {
          const errorText = await response.text()
          console.error(`API Error for ${keyword}:`, response.status, errorText)
        }
        
        // API 호출 간격을 두어 rate limit 방지
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch {
        console.warn(`Failed to fetch news for keyword: ${keyword}`)
      }
    }

    if (allNews.length === 0) {
      console.log('⚠️ No news items fetched from any keyword')
      return []
    }
    
    console.log(`✅ Total news items fetched: ${allNews.length}`)

    // 중복 제거 (같은 URL 기준)
    const uniqueNews = allNews.filter((item, index, self) => 
      index === self.findIndex(t => t.originallink === item.originallink || t.link === item.link)
    )

    // 발행 시간 기준으로 정렬하여 최신 10개 선택
    const sortedNews = uniqueNews
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 10)

    // NewsItem 형식으로 변환
    return sortedNews.map((item: NaverNewsItem): NewsItem => ({
      title: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
      url: item.originallink || item.link,
      source: extractSource(item.originallink || item.link) || '네이버뉴스',
      publishedAt: new Date(item.pubDate).toISOString()
    }))

  } catch (error) {
    console.error('Naver News API Error:', error)
    return []
  }
}

// URL에서 언론사 추출
function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname
    
    const sourceMap: Record<string, string> = {
      'yna.co.kr': '연합뉴스',
      'chosun.com': '조선일보',
      'joongang.co.kr': '중앙일보',
      'hankyung.com': '한국경제',
      'mk.co.kr': '매일경제',
      'sedaily.com': '서울경제',
      'hani.co.kr': '한겨레',
      'khan.co.kr': '경향신문',
      'donga.com': '동아일보'
    }

    for (const [domain, source] of Object.entries(sourceMap)) {
      if (hostname.includes(domain)) {
        return source
      }
    }

    return hostname
  } catch {
    return '뉴스'
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('News API called')
    
    // URL 파라미터로 강제 한국 모드 설정 (테스트용)
    const { searchParams } = new URL(request.url)
    const forceKr = searchParams.get('force') === 'kr'
    
    // 지역 감지
    let region = detectRegionFromIP(request)
    
    // 강제 한국 모드 (테스트/개발용)
    if (forceKr) {
      region = 'kr'
      console.log('🔧 Force Korean mode enabled')
    }
    
    console.log('Final region:', region)

    let newsItems: NewsItem[] = []
    let source = 'fallback'

    if (region === 'kr') {
      // 한국 사용자: 네이버 뉴스 API 시도
      console.log('Fetching Naver news for Korean user')
      
      try {
        newsItems = await fetchNaverNews()
        
        if (newsItems.length > 0) {
          source = 'naver'
          console.log(`✅ Fetched ${newsItems.length} items from Naver News API`)
        } else {
          // 네이버 API 실패시 국제 뉴스 링크 제공
          console.log('⚠️ Naver API failed, providing international news links')
          newsItems = INTERNATIONAL_NEWS_LINKS
          source = 'fallback_international'
        }
      } catch (error) {
        console.error('Error fetching Naver news:', error)
        newsItems = INTERNATIONAL_NEWS_LINKS
        source = 'fallback_error'
      }
    } else {
      // 해외 사용자: 주요 뉴스 사이트 링크 제공
      console.log('Providing international news links for overseas user')
      newsItems = INTERNATIONAL_NEWS_LINKS
      source = 'international_links'
    }

    return NextResponse.json({
      success: true,
      items: newsItems,
      count: newsItems.length,
      region,
      lastUpdated: new Date().toISOString(),
      source,
      message: region === 'kr' 
        ? (source === 'naver' ? 'Real-time Naver news' : 'Fallback international news')
        : 'International news links'
    })
    
  } catch (error) {
    console.error('News API Error:', error)
    
    return NextResponse.json({
      success: false,
      items: [],
      count: 0,
      region: 'unknown',
      lastUpdated: new Date().toISOString(),
      source: 'critical_error',
      error: 'Critical API error, no news available'
    })
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}