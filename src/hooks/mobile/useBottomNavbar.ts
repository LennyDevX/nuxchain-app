import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from './useIsMobile';
import { useScrollDirection } from './useScrollDirection';

export interface UseBottomNavbarReturn {
  isVisible: boolean;
  isMobile: boolean;
  scrollY: number;
  isAtTop: boolean;
  showNavbar: () => void;
  hideNavbar: () => void;
  toggleNavbar: () => void;
}

/**
 * Hook para manejar la visibilidad del navbar inferior en móviles
 * Se oculta al hacer scroll hacia abajo y permanece oculto hasta scroll hacia arriba
 * @param hideThreshold - Umbral de scroll para ocultar (default: 100)
 * @returns objeto con estado de visibilidad e información del scroll
 */
export const useBottomNavbar = (hideThreshold: number = 100): UseBottomNavbarReturn => {
  const [lastTap, setLastTap] = useState<number>(0);
  const [manuallyHidden, setManuallyHidden] = useState<boolean>(false);
  const [hiddenByScroll, setHiddenByScroll] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { scrollDirection, scrollY } = useScrollDirection();
  const isAtTop = scrollY < 50;

  // Calcular visibilidad final
  const isVisible = !manuallyHidden && !hiddenByScroll;

  // Detectar si estamos al final de la página
  const isAtBottom = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const currentScroll = window.scrollY;
    return scrollHeight - (currentScroll + clientHeight) < 50;
  }, []);

  // Funciones para controlar la visibilidad manualmente
  const showNavbar = useCallback(() => {
    setManuallyHidden(false);
    setHiddenByScroll(false);
  }, []);

  const hideNavbar = useCallback(() => {
    setManuallyHidden(true);
  }, []);

  const toggleNavbar = useCallback(() => {
    setManuallyHidden(prev => !prev);
  }, []);

  // Manejo de doble tap
  const handleTouchStart = useCallback(() => {
    if (!isMobile) return;
    
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
      toggleNavbar();
      setLastTap(0);
      return;
    }
    
    setLastTap(currentTime);
  }, [isMobile, lastTap, toggleNavbar]);

  // Configurar event listeners para doble tap
  useEffect(() => {
    if (!isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isMobile, handleTouchStart]);

  // Manejar scroll para ocultar/mostrar navbar
  useEffect(() => {
    if (!isMobile || manuallyHidden) return;

    // Determinar el nuevo estado de hidden
    let newHiddenState = hiddenByScroll;

    // Si está en la parte superior, mostrar
    if (isAtTop) {
      newHiddenState = false;
    }
    // Si está al final, mantener oculto
    else if (isAtBottom()) {
      newHiddenState = true;
    }
    // Scroll hacia abajo después del umbral: ocultar
    else if (scrollDirection === 'down' && scrollY > hideThreshold) {
      newHiddenState = true;
    }
    // Scroll hacia arriba: mostrar
    else if (scrollDirection === 'up') {
      newHiddenState = false;
    }

    // Solo actualizar si cambió (usando microtask para evitar cascading renders)
    if (newHiddenState !== hiddenByScroll) {
      queueMicrotask(() => setHiddenByScroll(newHiddenState));
    }
  }, [isMobile, scrollDirection, scrollY, isAtTop, hideThreshold, manuallyHidden, hiddenByScroll, isAtBottom]);

  return {
    isVisible: isMobile ? isVisible : false,
    isMobile,
    scrollY,
    isAtTop,
    showNavbar,
    hideNavbar,
    toggleNavbar
  };
};

export default useBottomNavbar;