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

// 폴백 뉴스 (한국)
const FALLBACK_KOREAN_NEWS: NewsItem[] = [
  {
    title: "테크 기업들의 AI 투자 급증, 새로운 혁신 동력 확보",
    url: "https://www.hankyung.com/",
    source: "한국경제",
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "글로벌 공급망 안정화 조짐, 반도체 산업 회복세",
    url: "https://www.yna.co.kr/",
    source: "연합뉴스",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "친환경 에너지 전환 가속화, 정부 지원 정책 확대",
    url: "https://www.joongang.co.kr/",
    source: "중앙일보",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "스타트업 생태계 활성화, 벤처 투자 증가세",
    url: "https://www.mk.co.kr/",
    source: "매일경제",
    publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "디지털 헬스케어 시장 확대, 원격의료 서비스 성장",
    url: "https://www.chosun.com/",
    source: "조선일보",
    publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString()
  }
]

// IP 기반 지역 감지
function detectRegionFromIP(request: NextRequest): string {
  // Vercel/Cloudflare headers에서 국가 정보 확인
  const country = request.headers.get('cf-ipcountry') || 
                 request.headers.get('x-vercel-ip-country')

  console.log('Detected country:', country)
  
  // 한국인 경우 'kr', 그외는 'international'
  return country === 'KR' ? 'kr' : 'international'
}

// 네이버 뉴스 API 호출 - 최신 뉴스 Top 10
async function fetchNaverNews(): Promise<NewsItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

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

        const response = await fetch(url, {
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
            'User-Agent': 'KooukNews/1.0'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.items && data.items.length > 0) {
            allNews.push(...data.items)
          }
        }
        
        // API 호출 간격을 두어 rate limit 방지
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch {
        console.warn(`Failed to fetch news for keyword: ${keyword}`)
      }
    }

    if (allNews.length === 0) {
      return []
    }

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
    
    // 지역 감지
    const region = detectRegionFromIP(request)
    console.log('Detected region:', region)

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
          // 네이버 API 실패시 한국 폴백 뉴스 사용
          newsItems = FALLBACK_KOREAN_NEWS
          source = 'fallback_kr'
          console.log('⚠️ Naver API failed, using Korean fallback news')
        }
      } catch (error) {
        console.error('Error fetching Naver news:', error)
        newsItems = FALLBACK_KOREAN_NEWS
        source = 'fallback_kr'
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
        ? (source === 'naver' ? 'Real-time Naver news' : 'Korean fallback news')
        : 'International news links'
    })
    
  } catch (error) {
    console.error('News API Error:', error)
    
    return NextResponse.json({
      success: false,
      items: FALLBACK_KOREAN_NEWS,
      count: FALLBACK_KOREAN_NEWS.length,
      region: 'kr',
      lastUpdated: new Date().toISOString(),
      source: 'error_fallback',
      error: 'API error, using fallback news'
    })
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}