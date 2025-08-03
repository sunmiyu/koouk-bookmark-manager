import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getIP } from '@/lib/rateLimit'

interface WeatherResponse {
  location: string
  temperature: number
  morning: number
  afternoon: number
  evening: number
  description: string
  icon: string
  hourlyData: {
    time: string
    temperature: number
    hour: number
    condition: string
  }[]
  debug: {
    today: string
    morningTime: string
    afternoonTime: string
    eveningTime: string
  }
}

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

    // Get location parameters
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const lat = url.searchParams.get('lat')
    const lon = url.searchParams.get('lon')
    
    // Build API query
    let weatherQuery = ''
    
    if (city) {
      weatherQuery = `q=${encodeURIComponent(city)}`
    } else if (lat && lon) {
      weatherQuery = `lat=${lat}&lon=${lon}`
    } else {
      // Default to Seoul
      weatherQuery = 'q=Seoul'
    }
    
    console.log('🚀 Making API call for', weatherQuery)
    
    // 5-day forecast API로 변경 (3시간 간격)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?${weatherQuery}&appid=${apiKey}&units=metric`,
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
      const exactMatch = forecastData.list.find((item: { dt_txt: string }) => 
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
      `https://api.openweathermap.org/data/2.5/weather?${weatherQuery}&appid=${apiKey}&units=metric`,
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
    
    // Generate hourly data for temperature graph (current time ±6 hours)
    const currentTime = new Date()
    const nowKST = new Date(currentTime.getTime() + (kstOffset * 60 * 1000))
    const currentHour = nowKST.getHours()
    
    // Get data points around current time (±8 hours to get good coverage)
    const processedItems = forecastData.list
      .map((item: {dt: number, dt_txt: string, main: {temp: number}, weather: [{main: string, description: string}]}) => {
        const itemTime = new Date(item.dt * 1000)
        const itemTimeKST = new Date(itemTime.getTime() + (kstOffset * 60 * 1000))
        const itemHour = itemTimeKST.getHours()
        const hourDiff = Math.abs(itemHour - currentHour)
        
        return {
          ...item,
          itemTimeKST,
          itemHour,
          hourDiff
        }
      })
      .filter((item: {hourDiff: number, itemTimeKST: Date}) => {
        // Include items within ±8 hours or same day
        return item.hourDiff <= 8 || item.itemTimeKST.toDateString() === nowKST.toDateString()
      })
      .sort((a: {itemTimeKST: Date}, b: {itemTimeKST: Date}) => a.itemTimeKST.getTime() - b.itemTimeKST.getTime())
      .slice(0, 15) // Limit to ~15 points max
    
    const hourlyData = processedItems.map((item: {dt_txt: string, main: {temp: number}, itemHour: number, weather: [{main: string, description: string}]}, index: number) => {
        const condition = item.weather?.[0]?.main?.toLowerCase() || 'clear'
        // Debug first few items
        if (index < 3) {
          console.log(`🔍 Item ${index} weather data:`, item.weather)
          console.log(`🔍 Raw condition: "${item.weather?.[0]?.main}" → "${condition}"`)
        }
        return {
          time: item.dt_txt,
          temperature: Math.round(item.main.temp),
          hour: item.itemHour,
          condition: condition
        }
      })

    // Return weather data with specific time forecasts and hourly data
    const responseData = {
      location: forecastData.city.name,
      temperature: currentTemp,
      morning: morningWeather ? Math.round(morningWeather.main.temp) : currentTemp,
      afternoon: afternoonWeather ? Math.round(afternoonWeather.main.temp) : currentTemp,
      evening: eveningWeather ? Math.round(eveningWeather.main.temp) : currentTemp,
      description: morningWeather ? morningWeather.weather[0].description : 'Clear',
      icon: morningWeather ? morningWeather.weather[0].icon : '01d',
      hourlyData: hourlyData,
      debug: {
        today: today,
        morningTime: morningWeather?.dt_txt || 'not found',
        afternoonTime: afternoonWeather?.dt_txt || 'not found', 
        eveningTime: eveningWeather?.dt_txt || 'not found'
      }
    }
    
    console.log('🔍 Weather API Debug for', city || `${lat},${lon}`)
    console.log('📊 Raw weather conditions from OpenWeather:')
    console.log('  - Current weather:', currentWeatherResponse.ok ? await currentWeatherResponse.clone().json().then(d => d.weather[0]) : 'failed')
    console.log('  - Morning weather:', morningWeather?.weather[0])
    console.log('  - Afternoon weather:', afternoonWeather?.weather[0])
    console.log('  - Evening weather:', eveningWeather?.weather[0])
    console.log('💾 Hourly conditions sent to frontend:')
    hourlyData.forEach((item: {time: string, condition: string, temperature: number}, i: number) => {
      if (i < 5) console.log(`  ${item.time}: ${item.condition} (${item.temperature}°)`)
    })
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}