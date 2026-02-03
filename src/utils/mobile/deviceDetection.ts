/**
 * Utilidades para detección de dispositivos móviles
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation: 'portrait' | 'landscape';
}

/**
 * Detecta el tipo de dispositivo basado en user agent y dimensiones
 */
export const detectDevice = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Detectar sistema operativo
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  // Detectar tipo de dispositivo
  const isMobile = width <= 768 || /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent);
  const isTablet = (width > 768 && width <= 1024) || /ipad|tablet/.test(userAgent);
  const isDesktop = width > 1024 && !isMobile && !isTablet;

  // Determinar tamaño de pantalla
  let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  if (width < 480) screenSize = 'xs';
  else if (width < 768) screenSize = 'sm';
  else if (width < 1024) screenSize = 'md';
  else if (width < 1280) screenSize = 'lg';
  else screenSize = 'xl';

  // Detectar orientación
  const orientation = height > width ? 'portrait' : 'landscape';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    screenSize,
    orientation
  };
};

/**
 * Verifica si el dispositivo soporta touch
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Obtiene información sobre la conexión de red (si está disponible)
 */
export const getNetworkInfo = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connection = (navigator as any).connection || 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (navigator as any).mozConnection || 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (navigator as any).webkitConnection;
  
  if (!connection) {
    return {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false
    };
  }

  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false
  };
};

/**
 * Detecta si el usuario prefiere reducir movimiento/animaciones
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Detecta el tema preferido del sistema
 */
export const getPreferredColorScheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};