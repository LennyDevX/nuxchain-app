import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para scroll automático al top cuando cambia la ruta
 * Se ejecuta sin dependencias innecesarias para máxima eficiencia
 */
export function useScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll al top de forma suave
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]); // Solo se ejecuta cuando cambia la ruta
}
