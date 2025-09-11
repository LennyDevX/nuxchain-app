import { useState, useEffect } from 'react';

/**
 * Hook para detectar si el dispositivo es móvil
 * @returns boolean - true si es móvil, false si es desktop
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Verificar por ancho de pantalla
      const screenWidth = window.innerWidth <= 768;
      
      // Verificar por user agent
      const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Verificar por touch support
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(screenWidth || (userAgent && touchSupport));
    };

    // Verificar al montar
    checkIsMobile();

    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export default useIsMobile;