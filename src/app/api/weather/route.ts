import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getIP } from '@/lib/rateLimit'

// 서버사이드 메모리 캐시 (6시간)
const serverCache = new Map<string, { data: any, timestamp: number }>()
const SERVER_CACHE_DURATION = 6 * 60 * 60 * 1000 // 6시간

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getIP(request)
    const rateLimitResult = await checkRateLimit('global', ip)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
          }
        }
      )
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Weather service unavailable' },
        { status: 503 }
      )
    }

    // Default to Seoul if no city provided
    const url = new URL(request.url)
    const city = url.searchParams.get('city') || 'Seoul'
    
    // 서버사이드 캐시 확인
    const cacheKey = `weather_${city}`
    const cached = serverCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < SERVER_CACHE_DURATION) {
      console.log('Using server cache for', city)
      return NextResponse.json(cached.data)
    }
    
    // 5-day forecast API로 변경 (3시간 간격)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      {
        headers: {
          'User-Agent': 'Koouk/1.0'
        }
      }
    )

    if (!forecastResponse.ok) {
      return NextResponse.json(
        { error: 'Weather data unavailable' },
        { status: forecastResponse.status }
      )
    }

    const forecastData = await forecastResponse.json()
    
    // 오늘 날짜 구하기 (한국 시간 기준)
    const now = new Date()
    const kstOffset = 9 * 60 // 한국은 UTC+9
    const kstTime = new Date(now.getTime() + (kstOffset * 60 * 1000))
    const today = kstTime.toISOString().split('T')[0] // YYYY-MM-DD 형식
    
    // 오늘의 특정 시간대 예보 찾기
    const findWeatherForTime = (targetHour: number) => {
      const targetTimeStr = `${today} ${targetHour.toString().padStart(2, '0')}:00:00`
      
      // 정확한 시간 매칭 시도
      let exactMatch = forecastData.list.find((item: any) => 
        item.dt_txt === targetTimeStr
      )
      
      if (exactMatch) return exactMatch
      
      // 정확한 시간이 없으면 가장 가까운 시간 찾기
      let closestMatch = null
      let smallestDiff = Infinity
      
      for (const item of forecastData.list) {
        if (!item.dt_txt.startsWith(today)) continue
        
        const itemHour = parseInt(item.dt_txt.split(' ')[1].split(':')[0])
        const diff = Math.abs(itemHour - targetHour)
        
        if (diff < smallestDiff) {
          smallestDiff = diff
          closestMatch = item
        }
      }
      
      return closestMatch
    }
    
    // 아침 8시, 오후 1시(13시), 오후 7시(19시) 예보 찾기
    const morningWeather = findWeatherForTime(8)
    const afternoonWeather = findWeatherForTime(13)
    const eveningWeather = findWeatherForTime(19)
    
    // 현재 온도도 필요하므로 현재 날씨도 가져오기
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      {
        headers: {
          'User-Agent': 'Koouk/1.0'
        }
      }
    )
    
    let currentTemp = 0
    if (currentWeatherResponse.ok) {
      const currentWeatherData = await currentWeatherResponse.json()
      currentTemp = Math.round(currentWeatherData.main.temp)
    }
    
    // Return weather data with specific time forecasts
    const responseData = {
      location: forecastData.city.name,
      temperature: currentTemp,
      morning: morningWeather ? Math.round(morningWeather.main.temp) : currentTemp,
      afternoon: afternoonWeather ? Math.round(afternoonWeather.main.temp) : currentTemp,
      evening: eveningWeather ? Math.round(eveningWeather.main.temp) : currentTemp,
      description: morningWeather ? morningWeather.weather[0].description : 'Clear',
      icon: morningWeather ? morningWeather.weather[0].icon : '01d',
      debug: {
        today: today,
        morningTime: morningWeather?.dt_txt || 'not found',
        afternoonTime: afternoonWeather?.dt_txt || 'not found', 
        eveningTime: eveningWeather?.dt_txt || 'not found'
      }
    }
    
    // 서버사이드 캐시에 저장
    serverCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    })
    
    console.log('Fresh API call for', city)
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}