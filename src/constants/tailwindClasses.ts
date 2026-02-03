/**
 * 🎨 TAILWIND UTILITY CLASSES CONSTANTS
 * Sistema centralizado de clases Tailwind reutilizables
 * Objetivo: Eliminar inconsistencias y duplicación de código
 * Mobile First Approach
 */

// 1. Padding responsive estandarizado
export const RESPONSIVE_PADDING = {
  xs: 'p-2',
  mobile: 'p-3 sm:p-4',
  tablet: 'md:p-5 lg:p-6',
  desktop: 'lg:p-8 xl:p-10'
} as const;

// 2. Gap/espaciado entre elementos
export const RESPONSIVE_GAP = {
  mobile: 'gap-2 sm:gap-3',
  tablet: 'md:gap-4 lg:gap-5',
  desktop: 'lg:gap-6 xl:gap-8'
} as const;

// 3. Escalas tipográficas
export const TEXT_SIZES = {
  xs: 'text-xs md:text-xs lg:text-sm',
  sm: 'text-xs md:text-sm lg:text-sm',
  base: 'text-sm md:text-base lg:text-base',
  lg: 'text-base md:text-lg lg:text-lg',
  xl: 'text-lg md:text-xl lg:text-xl',
  '2xl': 'text-xl md:text-2xl lg:text-2xl',
  '3xl': 'text-2xl md:text-3xl lg:text-3xl',
  '4xl': 'text-3xl md:text-4xl lg:text-4xl'
} as const;

// 4. Grids responsivos predefinidos
export const RESPONSIVE_GRID = {
  cols1: 'grid-cols-1',
  cols2Mobile: 'grid-cols-1 sm:grid-cols-2',
  cols3Mobile: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  cols4Desktop: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  colsMasonry: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-max'
} as const;

// 5. Alturas de componentes
export const COMPONENT_HEIGHTS = {
  badge: 'h-6',
  button: 'h-10 md:h-11 lg:h-12',
  input: 'h-10 md:h-11 lg:h-12',
  card: 'min-h-64 md:min-h-72 lg:min-h-80'
} as const;

// 6. Radios de esquinas estandarizados
export const BORDER_RADIUS = {
  button: 'rounded-lg',
  card: 'rounded-xl',
  badge: 'rounded-full',
  input: 'rounded-lg'
} as const;

// 7. Sombras por profundidad
export const SHADOWS = {
  card: 'shadow-lg shadow-black/20',
  hover: 'hover:shadow-xl hover:shadow-black/30',
  active: 'shadow-2xl shadow-black/40'
} as const;

// 8. Breakpoints como constantes
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// 9. Transiciones estandarizadas
export const TRANSITIONS = {
  fast: 'transition-all duration-150 ease-out',
  normal: 'transition-all duration-300 ease-out',
  slow: 'transition-all duration-500 ease-out',
  smooth: 'transition-all duration-700 ease-in-out'
} as const;

// 10. Combinaciones comunes para Mobile First
export const MOBILE_FIRST = {
  containerPadding: 'p-3 sm:p-4 md:p-6 lg:p-8',
  sectionSpacing: 'mb-6 md:mb-8 lg:mb-12',
  gridLayout: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6',
  flex: 'flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4',
  textBase: 'text-sm md:text-base lg:text-lg leading-relaxed'
} as const;

// 11. Estados de interacción
export const INTERACTIVE_STATES = {
  hover: 'hover:scale-105 hover:shadow-xl',
  active: 'active:scale-95',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  focus: 'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
} as const;

// 12. Backgrounds con gradientes
export const BACKGROUNDS = {
  primaryGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
  secondaryGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
  darkGradient: 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900',
  glassEffect: 'bg-white/10 backdrop-blur-md border border-white/20'
} as const;

// 13. Touch target sizes (WCAG)
export const TOUCH_TARGETS = {
  minimum: 'min-h-[44px] min-w-[44px]', // iOS HIG
  recommended: 'min-h-[48px] min-w-[48px]', // Material Design
  comfortable: 'min-h-[56px] min-w-[56px]'
} as const;

// 14. Z-Index layers
export const Z_INDEX = {
  dropdown: 'z-10',
  sticky: 'z-20',
  modal: 'z-30',
  popover: 'z-40',
  tooltip: 'z-50'
} as const;

// 15. Utilidades comunes
export const UTILITIES = {
  centerAbsolute: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  centerFlex: 'flex items-center justify-center',
  truncate: 'truncate overflow-hidden text-ellipsis whitespace-nowrap',
  lineClamp2: 'line-clamp-2',
  lineClamp3: 'line-clamp-3'
} as const;
