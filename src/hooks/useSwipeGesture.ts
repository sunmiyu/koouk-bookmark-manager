import { useEffect, useRef, useCallback } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  minDistance?: number
  preventScroll?: boolean
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

export function useSwipeGesture(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minDistance = 50,
    preventScroll = false
  } = options

  const touchStart = useRef<TouchPoint | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    if (preventScroll) {
      e.preventDefault()
    }
  }, [preventScroll])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return

    if (preventScroll) {
      e.preventDefault()
    }
  }, [preventScroll])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.changedTouches[0]
    const touchEnd = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    const deltaX = touchEnd.x - touchStart.current.x
    const deltaY = touchEnd.y - touchStart.current.y
    const deltaTime = touchEnd.time - touchStart.current.time

    // Minimum swipe distance and maximum time for valid swipe
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    const isValidSwipe = (absDeltaX > minDistance || absDeltaY > minDistance) && deltaTime < 300

    if (!isValidSwipe) {
      touchStart.current = null
      return
    }

    // Determine primary swipe direction
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.()
      } else {
        onSwipeUp?.()
      }
    }

    touchStart.current = null

    if (preventScroll) {
      e.preventDefault()
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minDistance, preventScroll])

  const attachListeners = useCallback((element: HTMLElement) => {
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventScroll })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    return attachListeners(element)
  }, [attachListeners])

  const setRef = useCallback((element: HTMLElement | null) => {
    if (elementRef.current && elementRef.current !== element) {
      // Clean up previous element listeners
      const prevElement = elementRef.current
      prevElement.removeEventListener('touchstart', handleTouchStart)
      prevElement.removeEventListener('touchmove', handleTouchMove)
      prevElement.removeEventListener('touchend', handleTouchEnd)
    }

    elementRef.current = element

    if (element) {
      attachListeners(element)
    }
  }, [attachListeners, handleTouchStart, handleTouchMove, handleTouchEnd])

  return { setRef }
}