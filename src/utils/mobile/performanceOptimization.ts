/**
 * Utilidades para optimización de rendimiento en dispositivos móviles
 */

import { detectDevice, getNetworkInfo } from './deviceDetection';

/**
 * Configuración de optimización para móviles
 */
export interface MobileOptimizationConfig {
  lazyLoadImages: boolean;
  reduceAnimations: boolean;
  compressImages: boolean;
  deferNonCriticalJS: boolean;
  enableVirtualization: boolean;
}

/**
 * Obtiene configuración de optimización basada en el dispositivo
 */
export const getMobileOptimizationConfig = (): MobileOptimizationConfig => {
  const device = detectDevice();
  const network = getNetworkInfo();
  
  // Configuración más agresiva para dispositivos móviles con conexión lenta
  const isSlowConnection = network.effectiveType === '2g' || network.effectiveType === 'slow-2g';
  const isLowEndDevice = device.isMobile && device.screenSize === 'xs';

  return {
    lazyLoadImages: device.isMobile || isSlowConnection,
    reduceAnimations: isLowEndDevice || isSlowConnection || network.saveData,
    compressImages: device.isMobile || isSlowConnection,
    deferNonCriticalJS: device.isMobile,
    enableVirtualization: device.isMobile && device.screenSize === 'xs'
  };
};

/**
 * Debounce function para optimizar eventos de scroll y resize
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Throttle function para limitar la frecuencia de ejecución
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy loading para imágenes
 */
export const createImageLazyLoader = () => {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  return {
    observe: (img: HTMLImageElement) => imageObserver.observe(img),
    unobserve: (img: HTMLImageElement) => imageObserver.unobserve(img),
    disconnect: () => imageObserver.disconnect()
  };
};

/**
 * Optimiza el tamaño de fuente para móviles
 */
export const getOptimizedFontSize = (baseSize: number, isMobile: boolean): number => {
  if (!isMobile) return baseSize;
  
  const device = detectDevice();
  
  // Reducir tamaño de fuente en pantallas muy pequeñas
  if (device.screenSize === 'xs') {
    return Math.max(baseSize * 0.85, 12); // Mínimo 12px
  }
  
  if (device.screenSize === 'sm') {
    return Math.max(baseSize * 0.9, 14); // Mínimo 14px
  }
  
  return baseSize;
};

/**
 * Calcula el número óptimo de columnas para grids en móvil
 */
export const getOptimalGridColumns = (maxColumns: number = 4): number => {
  const device = detectDevice();
  
  if (!device.isMobile) return maxColumns;
  
  switch (device.screenSize) {
    case 'xs':
      return 1;
    case 'sm':
      return Math.min(2, maxColumns);
    default:
      return Math.min(3, maxColumns);
  }
};

/**
 * Optimiza el espaciado para móviles
 */
export const getOptimizedSpacing = (baseSpacing: number, isMobile: boolean): number => {
  if (!isMobile) return baseSpacing;
  
  const device = detectDevice();
  
  // Reducir espaciado en pantallas pequeñas
  if (device.screenSize === 'xs') {
    return baseSpacing * 0.6;
  }
  
  if (device.screenSize === 'sm') {
    return baseSpacing * 0.75;
  }
  
  return baseSpacing;
};