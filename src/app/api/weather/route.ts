import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getIP } from '@/lib/rateLimit'

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
    
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      {
        headers: {
          'User-Agent': 'Koouk/1.0'
        }
      }
    )

    if (!weatherResponse.ok) {
      return NextResponse.json(
        { error: 'Weather data unavailable' },
        { status: weatherResponse.status }
      )
    }

    const weatherData = await weatherResponse.json()
    
    // Return only necessary data
    return NextResponse.json({
      location: weatherData.name,
      temperature: Math.round(weatherData.main.temp),
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      icon: weatherData.weather[0].icon
    })

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}