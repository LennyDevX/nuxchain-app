import { useEffect, useRef, useState } from 'react';

/**
 * 📱 Hook para detectar si un elemento está visible en el viewport
 * Útil para lazy loading, triggering animaciones, cargar datos
 * 
 * @param threshold - Porcentaje visible para considerar "in view" (0-1, default: 0.1)
 * @param rootMargin - Margen adicional en pixels (default: "0px")
 * @returns { ref, isInView, isLoaded }
 * 
 * @example
 * const { ref, isInView } = useInViewport(0.2);
 * return <div ref={ref}>{isInView && <ExpensiveComponent />}</div>
 */
export function useInViewport(threshold = 0.1, rootMargin = '0px') {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setIsLoaded(true); // ✅ Una vez loaded, no vuelve a false
        } else {
          setIsInView(false);
        }
      },
      {
        threshold: typeof threshold === 'number' ? threshold : [0.1, 0.5, 0.9],
        rootMargin
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { ref, isInView, isLoaded };
}

/**
 * 📱 Hook para lazy load de imágenes con blur-up effect
 * 
 * @param blurUrl - URL de imagen borrosa (opcional, para placeholder)
 * @returns { ref, imageSrc, isLoaded }
 * 
 * @example
 * const { ref, imageSrc, isLoaded } = useImageLazyLoad('blur.jpg');
 * return (
 *   <div ref={ref}>
 *     <img src={imageSrc} className={isLoaded ? 'opacity-100' : 'opacity-50'} />
 *   </div>
 * );
 */
export function useImageLazyLoad(blurUrl?: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [imageSrc, setImageSrc] = useState(blurUrl);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            // ✅ Preload imagen antes de mostrar
            const preloadImg = new Image();
            preloadImg.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
            };
            preloadImg.src = src;
          }

          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px 0px' }
    );

    if (currentRef?.querySelector('img')) {
      observer.observe(currentRef.querySelector('img')!);
    }

    return () => observer.disconnect();
  }, [blurUrl]);

  return { ref, imageSrc, isLoaded };
}

/**
 * 📱 Hook para detectar scroll hacia arriba/abajo
 * Útil para mostrar/ocultar navbar, footer flotante, etc.
 * 
 * @param threshold - Pixels scrolleados para considerar (default: 100)
 * @returns { scrollDirection, isVisible }
 * 
 * @example
 * const { scrollDirection, isVisible } = useScrollDirection();
 * return <nav className={isVisible ? 'translate-y-0' : '-translate-y-full'} />
 */
export function useScrollDirection(threshold = 100) {
  const [scrollDirection, setScrollDirection] = useState<'UP' | 'DOWN' | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (Math.abs(currentScrollY - lastScrollYRef.current) < threshold) {
            ticking = false;
            return;
          }

          const direction = currentScrollY > lastScrollYRef.current ? 'DOWN' : 'UP';
          setScrollDirection(direction);
          setIsVisible(direction === 'UP');

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return { scrollDirection, isVisible };
}

/**
 * 📱 Hook para lazy load de componentes "costosos"
 * Solo renderiza cuando está visible + con delay configurable
 * 
 * @param delay - Delay en ms antes de renderizar (default: 0)
 * @returns { ref, shouldRender }
 * 
 * @example
 * const { ref, shouldRender } = useComponentLazyLoad(500);
 * return <div ref={ref}>{shouldRender && <HeavyComponent />}</div>
 */
export function useComponentLazyLoad(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !shouldRender) {
          if (delay > 0) {
            setTimeout(() => setShouldRender(true), delay);
          } else {
            setShouldRender(true);
          }
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px 0px' }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [delay, shouldRender]);

  return { ref, shouldRender };
}
