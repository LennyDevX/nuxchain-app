import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsMobile } from './useIsMobile';

export interface UseChatNavbarReturn {
  isVisible: boolean;
  isHidden: boolean;
  showNavbar: () => void;
  hideNavbar: () => void;
  toggleNavbar: () => void;
  isMobile: boolean;
  isDragging: boolean;
  dragY: number;
}

/**
 * Hook especializado para manejar el navbar en la página de chat
 * - Auto-oculta el navbar al entrar en chat
 * - Permite mostrar/ocultar con gestos de deslizamiento
 * - Optimiza el viewport para el input text area
 */
export const useChatNavbar = (): UseChatNavbarReturn => {
  const [isVisible, setIsVisible] = useState<boolean>(false); // Oculto por defecto en chat
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragY, setDragY] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [lastTap, setLastTap] = useState<number>(0);
  const isMobile = useIsMobile();
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Funciones para controlar la visibilidad
  const showNavbar = useCallback(() => {
    setIsVisible(true);
    
    // Limpiar timeout anterior
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Auto-ocultar después de 5 segundos de inactividad
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, []);

  const hideNavbar = useCallback(() => {
    setIsVisible(false);
    
    // Limpiar timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const toggleNavbar = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  // Manejo de gestos táctiles y doble tap
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    const windowHeight = window.innerHeight;
    const bottomThreshold = windowHeight - 100; // Área de 100px desde abajo
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
    
    // Solo activar deslizamiento si el toque está en la parte inferior de la pantalla
    if (touch.clientY > bottomThreshold) {
      setStartY(touch.clientY);
      setIsDragging(true);
    }
  }, [isMobile, lastTap, toggleNavbar]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !isMobile) return;
    
    const touch = e.touches[0];
    const deltaY = startY - touch.clientY;
    setDragY(deltaY);
    
    // Prevenir scroll del body durante el drag
    e.preventDefault();
  }, [isDragging, startY, isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !isMobile) return;
    
    const threshold = 50; // Umbral mínimo para activar
    
    if (dragY > threshold) {
      // Deslizamiento hacia arriba - mostrar navbar
      showNavbar();
    } else if (dragY < -threshold) {
      // Deslizamiento hacia abajo - ocultar navbar
      hideNavbar();
    }
    
    // Reset del estado de drag
    setIsDragging(false);
    setDragY(0);
    setStartY(0);
  }, [isDragging, dragY, isMobile, showNavbar, hideNavbar]);

  // Configurar event listeners para gestos táctiles
  useEffect(() => {
    if (!isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Auto-ocultar en desktop y cleanup
  useEffect(() => {
    if (!isMobile) {
      setIsVisible(false);
    }
    
    // Cleanup timeout al desmontar
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isMobile]);

  return {
    isVisible,
    isHidden: !isVisible,
    showNavbar,
    hideNavbar,
    toggleNavbar,
    isMobile,
    isDragging,
    dragY
  };
};

export default useChatNavbar;