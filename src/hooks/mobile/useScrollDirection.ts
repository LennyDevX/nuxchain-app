import { useState, useEffect } from 'react';

export type ScrollDirection = 'up' | 'down' | 'idle';

export interface UseScrollDirectionReturn {
  scrollDirection: ScrollDirection;
  scrollY: number;
  isScrolling: boolean;
}

/**
 * Hook para detectar la dirección del scroll
 * @param threshold - Umbral mínimo de scroll para detectar cambio (default: 10)
 * @returns objeto con dirección del scroll, posición Y y estado de scroll
 */
export const useScrollDirection = (threshold: number = 10): UseScrollDirectionReturn => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('idle');
  const [scrollY, setScrollY] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const difference = Math.abs(currentScrollY - lastScrollY);

      // Solo actualizar si el cambio es mayor al umbral
      if (difference > threshold) {
        if (currentScrollY > lastScrollY) {
          setScrollDirection('down');
        } else if (currentScrollY < lastScrollY) {
          setScrollDirection('up');
        }
        setLastScrollY(currentScrollY);
      }

      setScrollY(currentScrollY);
      setIsScrolling(true);

      // Resetear estado de scroll después de 150ms de inactividad
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
        setScrollDirection('idle');
      }, 150);
    };

    // Agregar listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY, threshold]);

  return {
    scrollDirection,
    scrollY,
    isScrolling
  };
};

export default useScrollDirection;