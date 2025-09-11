import { useState, useEffect, useCallback } from 'react';
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
  const isMobile = useIsMobile();

  // Funciones para controlar la visibilidad
  const showNavbar = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideNavbar = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleNavbar = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  // Manejo de gestos táctiles
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    const windowHeight = window.innerHeight;
    const bottomThreshold = windowHeight - 100; // Área de 100px desde abajo
    
    // Solo activar si el toque está en la parte inferior de la pantalla
    if (touch.clientY > bottomThreshold) {
      setStartY(touch.clientY);
      setIsDragging(true);
    }
  }, [isMobile]);

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

  // Auto-ocultar en desktop
  useEffect(() => {
    if (!isMobile) {
      setIsVisible(false);
    }
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