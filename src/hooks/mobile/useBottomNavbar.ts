import { useState, useEffect, useCallback, useRef } from 'react';
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
 * Se oculta al hacer scroll hacia abajo y aparece al hacer scroll hacia arriba o detenerse
 * Incluye funcionalidad de doble toque para mostrar/ocultar manualmente
 * @param hideThreshold - Umbral de scroll para ocultar (default: 100)
 * @returns objeto con estado de visibilidad y información del scroll
 */
export const useBottomNavbar = (hideThreshold: number = 100): UseBottomNavbarReturn => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastTap, setLastTap] = useState<number>(0);
  const [manuallyHidden, setManuallyHidden] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { scrollDirection, scrollY, isScrolling } = useScrollDirection();
  const isAtTop = scrollY < 50;
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Funciones para controlar la visibilidad manualmente
  const showNavbar = useCallback(() => {
    setIsVisible(true);
    setManuallyHidden(false);
    
    // Limpiar timeout anterior
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  const hideNavbar = useCallback(() => {
    setIsVisible(false);
    setManuallyHidden(true);
    
    // Limpiar timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const toggleNavbar = useCallback(() => {
    if (isVisible) {
      hideNavbar();
    } else {
      showNavbar();
    }
  }, [isVisible, showNavbar, hideNavbar]);

  // Manejo de doble tap
  const handleTouchStart = useCallback(() => {
    if (!isMobile) return;
    
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    // Detectar doble tap (menos de 300ms entre taps)
    if (tapLength < 300 && tapLength > 0) {
      // Doble tap detectado - toggle navbar
      toggleNavbar();
      setLastTap(0); // Reset para evitar triple tap
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

  useEffect(() => {
    if (!isMobile) {
      setIsVisible(false);
      return;
    }

    // Si está oculto manualmente, no cambiar por scroll
    if (manuallyHidden) {
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
  }, [isMobile, scrollDirection, scrollY, isScrolling, isAtTop, hideThreshold, manuallyHidden]);

  // Cleanup timeout al desmontar
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    isMobile,
    scrollY,
    isAtTop,
    showNavbar,
    hideNavbar,
    toggleNavbar
  };
};

export default useBottomNavbar;