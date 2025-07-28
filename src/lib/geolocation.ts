'use client'

// 지역 감지 유틸리티
export const detectUserLocation = async (): Promise<{
  country: string
  isKorea: boolean
  timezone: string
}> => {
  try {
    // 1. 브라우저 타임존으로 1차 판별
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const isKoreaTimezone = timezone === 'Asia/Seoul'

    // 2. IP 기반 지역 감지 (무료 서비스 사용)
    let country = 'Unknown'
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        country = data.country_code || 'Unknown'
      }
    } catch (error) {
      console.warn('IP location detection failed:', error)
    }

    const isKorea = country === 'KR' || isKoreaTimezone

    return {
      country,
      isKorea,
      timezone
    }
  } catch (error) {
    console.error('Location detection error:', error)
    
    // 폴백: 타임존만으로 판별
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return {
      country: 'Unknown',
      isKorea: timezone === 'Asia/Seoul',
      timezone
    }
  }
}

// localStorage에 지역 정보 캐싱
export const getCachedLocation = () => {
  try {
    const cached = localStorage.getItem('koouk_user_location')
    if (cached) {
      const data = JSON.parse(cached)
      // 1시간 캐시
      if (Date.now() - data.timestamp < 60 * 60 * 1000) {
        return data.location
      }
    }
  } catch (error) {
    console.error('Failed to get cached location:', error)
  }
  return null
}

export const setCachedLocation = (location: { country: string; isKorea: boolean; timezone: string }) => {
  try {
    localStorage.setItem('koouk_user_location', JSON.stringify({
      location,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error('Failed to cache location:', error)
  }
}