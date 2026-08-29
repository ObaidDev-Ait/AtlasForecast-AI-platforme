import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook that detects route changes and provides a transitioning state.
 * On every pathname change (after the initial mount), isTransitioning becomes
 * true for `duration` ms, giving the loading overlay time to display.
 */
export default function useRouteTransition(duration = 800) {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip the very first render — startup loader handles that
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), duration)
    return () => clearTimeout(timer)
  }, [location.pathname, duration])

  return isTransitioning
}
