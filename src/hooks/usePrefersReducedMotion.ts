import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/** jsdom (tests) et certains anciens navigateurs n'implémentent pas matchMedia. */
function supportsMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => supportsMatchMedia() && window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    if (!supportsMatchMedia()) return
    const mediaQuery = window.matchMedia(QUERY)
    const onChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return prefersReducedMotion
}
