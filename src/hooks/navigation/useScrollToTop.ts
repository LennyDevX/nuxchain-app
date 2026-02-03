import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para scroll automático al top cuando cambia la ruta
 * Usa 'instant' para evitar problemas de renderizado con viewport
 */
export function useScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll al top de forma instantánea para evitar problemas con whileInView
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
  }, [location.pathname]); // Solo se ejecuta cuando cambia la ruta
}

