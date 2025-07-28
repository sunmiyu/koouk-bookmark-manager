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

    // 2. 브라우저 언어 설정 확인
    const language = navigator.language || navigator.languages?.[0] || ''
    const isKoreanLanguage = language.startsWith('ko')

    // 3. IP 기반 지역 감지 (여러 무료 서비스 시도)
    let country = 'Unknown'
    
    // 첫 번째 시도: ipapi.co
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(3000) // 3초 타임아웃
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.country_code && data.country_code !== 'undefined') {
          country = data.country_code
        }
      }
    } catch (error) {
      console.warn('ipapi.co failed:', error)
      
      // 두 번째 시도: ip-api.com
      try {
        const backupResponse = await fetch('https://ip-api.com/json/', {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        })
        
        if (backupResponse.ok) {
          const backupData = await backupResponse.json()
          if (backupData.countryCode && backupData.countryCode !== 'undefined') {
            country = backupData.countryCode
          }
        }
      } catch (backupError) {
        console.warn('ip-api.com also failed:', backupError)
      }
    }

    // 판별 로직 강화: 타임존, 언어, IP 종합 고려
    const isKorea = country === 'KR' || (isKoreaTimezone && isKoreanLanguage) || (country === 'Unknown' && isKoreaTimezone)

    console.log('Location detection result:', { 
      country, 
      timezone, 
      language, 
      isKoreaTimezone, 
      isKoreanLanguage, 
      finalIsKorea: isKorea 
    })

    return {
      country,
      isKorea,
      timezone
    }
  } catch (error) {
    console.error('Location detection error:', error)
    
    // 폴백: 타임존과 언어로 판별
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const language = navigator.language || ''
    const isKoreanLanguage = language.startsWith('ko')
    const isKoreaTimezone = timezone === 'Asia/Seoul'
    
    return {
      country: 'Unknown',
      isKorea: isKoreaTimezone && isKoreanLanguage,
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
      // 24시간 캐시 (하루에 한 번만 체크)
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
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