'use client'

import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

interface DeviceInfo {
  type: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

export const useDevice = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    isMobile: false,
    isTablet: false, 
    isDesktop: true,
    width: 1024,
    height: 768
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      let type: DeviceType = 'desktop'
      if (width < 768) {
        type = 'mobile'
      } else if (width < 1024) {
        type = 'tablet'
      }

      setDeviceInfo({
        type,
        isMobile: type === 'mobile',
        isTablet: type === 'tablet',
        isDesktop: type === 'desktop',
        width,
        height
      })
    }

    // 초기 설정
    updateDeviceInfo()
    
    // 리사이즈 리스너
    window.addEventListener('resize', updateDeviceInfo)
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}