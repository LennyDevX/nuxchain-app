import { useState, useEffect } from 'react'

/**
 * 🎯 Hook para detectar preferencia de usuario por movimiento reducido
 * Detecta la media query prefers-reduced-motion para cumplir con WCAG 2.1
 * 
 * @returns {boolean} true si el usuario prefiere movimiento reducido
 * 
 * @example
 * const prefersReducedMotion = usePrefersReducedMotion()
 * const duration = prefersReducedMotion ? 0.1 : 0.6
 * 
 * <motion.div
 *   animate={{ opacity: 1 }}
 *   transition={{ duration }}
 * />
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Initialize with media query value during first render
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    // Check if window and matchMedia are available (SSR safety)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Handle changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } 
    // Legacy browsers (Safari < 14)
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * 🎯 Obtiene la duración de animación ajustada según preferencias
 * 
 * @param normalDuration - Duración normal en segundos
 * @param reducedDuration - Duración reducida (default: 0.1s)
 * @returns Duración ajustada
 * 
 * @example
 * const duration = getMotionDuration(0.6, 0.1)
 */
export function getMotionDuration(
  normalDuration: number,
  reducedDuration: number = 0.1
): number {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return normalDuration
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return prefersReduced ? reducedDuration : normalDuration
}
