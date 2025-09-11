// Hooks para optimización móvil
export { useIsMobile } from './useIsMobile';
export { useScrollDirection } from './useScrollDirection';
export { useBottomNavbar } from './useBottomNavbar';

// Re-exportar tipos
export type { UseScrollDirectionReturn, ScrollDirection } from './useScrollDirection';
export type { UseBottomNavbarReturn } from './useBottomNavbar';

export interface MobileHooksConfig {
  scrollThreshold?: number;
  hideThreshold?: number;
}