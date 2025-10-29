import { useState, useCallback } from 'react';

type SwipeDirection = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | null;

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeDetectionResult {
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  direction: SwipeDirection;
  distance: number;
}

/**
 * 👆 Hook para detectar gestos de swipe en dispositivos táctiles
 * Detecta swipes en 4 direcciones: LEFT, RIGHT, UP, DOWN
 * 
 * @param handlers - Callbacks para cada dirección de swipe
 * @param minDistance - Distancia mínima para considerar un swipe (default: 50px)
 * @returns Objeto con handlers y dirección detectada
 * 
 * @example
 * const { handleTouchStart, handleTouchEnd, direction } = useSwipeDetection({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right')
 * });
 * 
 * <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
 *   Swipe me!
 * </div>
 */
export function useSwipeDetection(
  handlers: SwipeHandlers = {},
  minDistance: number = 50
): SwipeDetectionResult {
  const [touchStart, setTouchStart] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [direction, setDirection] = useState<SwipeDirection>(null);
  const [distance, setDistance] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setDirection(null);
    setDistance(0);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart || !touchStartY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const distanceX = Math.abs(touchStart - endX);
      const distanceY = Math.abs(touchStartY - endY);

      setDistance(Math.max(distanceX, distanceY));

      // Determinar dirección según distancia máxima
      if (distanceX > distanceY && distanceX > minDistance) {
        // Swipe horizontal
        if (touchStart - endX > minDistance) {
          setDirection('LEFT');
          handlers.onSwipeLeft?.();
        } else if (endX - touchStart > minDistance) {
          setDirection('RIGHT');
          handlers.onSwipeRight?.();
        }
      } else if (distanceY > minDistance) {
        // Swipe vertical
        if (touchStartY - endY > minDistance) {
          setDirection('UP');
          handlers.onSwipeUp?.();
        } else if (endY - touchStartY > minDistance) {
          setDirection('DOWN');
          handlers.onSwipeDown?.();
        }
      }
    },
    [touchStart, touchStartY, minDistance, handlers]
  );

  return {
    handleTouchStart,
    handleTouchEnd,
    direction,
    distance
  };
}

/**
 * 👆 Hook más simple solo para LEFT/RIGHT swipes
 * Ideal para carruseles y navegación
 * 
 * @param onSwipeLeft - Callback cuando swipe a izquierda
 * @param onSwipeRight - Callback cuando swipe a derecha
 * @param minDistance - Distancia mínima (default: 50)
 * @returns Objeto con handlers de touch
 * 
 * @example
 * const { handleTouchStart, handleTouchEnd } = useHorizontalSwipe(
 *   () => goToNextSlide(),
 *   () => goToPrevSlide()
 * );
 */
export function useHorizontalSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  minDistance: number = 50
): { handleTouchStart: (e: React.TouchEvent) => void; handleTouchEnd: (e: React.TouchEvent) => void } {
  const [touchStart, setTouchStart] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;

      if (Math.abs(diff) > minDistance) {
        if (diff > 0) {
          // Swipe izquierda
          onSwipeLeft?.();
        } else {
          // Swipe derecha
          onSwipeRight?.();
        }
      }
    },
    [touchStart, minDistance, onSwipeLeft, onSwipeRight]
  );

  return { handleTouchStart, handleTouchEnd };
}

/**
 * 👆 Hook para pull-to-refresh
 * Detecta swipe hacia abajo para triggear refresh
 * 
 * @param onRefresh - Callback cuando pull-to-refresh se activa
 * @param threshold - Distancia para activar refresh (default: 100)
 * @returns Objeto con handlers y estado de refresh
 * 
 * @example
 * const { handleTouchStart, handleTouchEnd, isPulling } = usePullToRefresh(
 *   async () => await fetchNewData()
 * );
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  threshold: number = 100
): {
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  isPulling: boolean;
  pullDistance: number;
} {
  const [touchStart, setTouchStart] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setPullDistance(0);
  }, []);

  const handleTouchEnd = useCallback(
    async (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touchEnd = e.changedTouches[0].clientY;
      const distance = touchEnd - touchStart;

      // Solo detectar pull hacia abajo (distancia positiva)
      if (distance > threshold && distance > 0) {
        setIsPulling(true);
        try {
          await onRefresh();
        } finally {
          setIsPulling(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    },
    [touchStart, threshold, onRefresh]
  );

  return {
    handleTouchStart,
    handleTouchEnd,
    isPulling,
    pullDistance
  };
}
