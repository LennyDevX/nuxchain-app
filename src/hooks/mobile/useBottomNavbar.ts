import { useState, useEffect } from 'react';
import { useIsMobile } from './useIsMobile';
import { useScrollDirection } from './useScrollDirection';

export interface UseBottomNavbarReturn {
  isVisible: boolean;
  isMobile: boolean;
  scrollY: number;
  isAtTop: boolean;
}

/**
 * Hook para manejar la visibilidad del navbar inferior en móviles
 * Se oculta al hacer scroll hacia abajo y aparece al hacer scroll hacia arriba o detenerse
 * @param hideThreshold - Umbral de scroll para ocultar (default: 100)
 * @returns objeto con estado de visibilidad y información del scroll
 */
export const useBottomNavbar = (hideThreshold: number = 100): UseBottomNavbarReturn => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const isMobile = useIsMobile();
  const { scrollDirection, scrollY, isScrolling } = useScrollDirection();
  const isAtTop = scrollY < 50;

  useEffect(() => {
    if (!isMobile) {
      setIsVisible(false);
      return;
    }

    // Siempre visible en la parte superior
    if (isAtTop) {
      setIsVisible(true);
      return;
    }

    // Ocultar al hacer scroll hacia abajo después del umbral
    if (scrollDirection === 'down' && scrollY > hideThreshold) {
      setIsVisible(false);
    }
    
    // Mostrar al hacer scroll hacia arriba o cuando se detiene el scroll
    else if (scrollDirection === 'up' || (!isScrolling && scrollDirection === 'idle')) {
      setIsVisible(true);
    }
  }, [isMobile, scrollDirection, scrollY, isScrolling, isAtTop, hideThreshold]);

  return {
    isVisible,
    isMobile,
    scrollY,
    isAtTop
  };
};

export default useBottomNavbar;