import { useEffect, useRef, useState } from 'react'

interface UseLazyRenderOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
  isMobile?: boolean
}

/**
 * Hook para lazy render de elementos cuando entran en viewport
 * Mejora rendimiento evitando renderizar elementos fuera de vista
 * Optimizado para mobile con rootMargin reducido
 * 
 * @param options Opciones del IntersectionObserver
 * @returns { ref, isVisible } - ref para el elemento, isVisible para el estado
 */
export const useLazyRender = (options: UseLazyRenderOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin: customRootMargin,
    once = true,
    isMobile = false
  } = options

  // Mobile: 50px para cargar más cerca al viewport (menos memoria)
  // Desktop: 100px para preloading suave
  const rootMargin = customRootMargin || (isMobile ? '50px 0px' : '100px 0px')

  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const refElement = ref.current
    if (!refElement) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < (isMobile ? 50 : 100)) {
          setIsVisible(true)
          // Si once es true, dejar de observar después de renderizar
          if (once && refElement) {
            observer.unobserve(refElement)
          }
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(refElement)

    return () => {
      if (refElement) observer.unobserve(refElement)
    }
  }, [threshold, rootMargin, once, isMobile])

  return { ref, isVisible }
}

export default useLazyRender
