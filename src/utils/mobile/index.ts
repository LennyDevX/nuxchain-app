// Utilidades para optimización móvil
export * from './deviceDetection';
export * from './performanceOptimization';

// Re-exportar tipos principales
export type { DeviceInfo } from './deviceDetection';
export type { MobileOptimizationConfig } from './performanceOptimization';

// Utilidades de CSS para móviles
export const mobileBreakpoints = {
  xs: '(max-width: 479px)',
  sm: '(max-width: 767px)',
  md: '(max-width: 1023px)',
  lg: '(max-width: 1279px)',
  xl: '(min-width: 1280px)'
} as const;

// Clases CSS comunes para móviles
export const mobileClasses = {
  hideOnMobile: 'hidden md:block',
  showOnMobile: 'block md:hidden',
  mobileFullWidth: 'w-full md:w-auto',
  mobilePadding: 'px-4 md:px-6 lg:px-8',
  mobileText: 'text-sm md:text-base',
  mobileGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  mobileStack: 'flex-col md:flex-row'
} as const;

// Función helper para aplicar clases condicionales
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};