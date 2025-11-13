import { useCallback } from 'react';

type HapticIntensity = 'light' | 'medium' | 'strong';
type HapticFeedbackType = 'success' | 'error' | 'warning';

/**
 * 📳 Hook para vibración/haptic feedback en dispositivos móviles
 * Proporciona feedback táctil para mejorar la experiencia de usuario
 * Compatible con Vibration API (Chrome, Edge, Firefox Mobile, etc.)
 * 
 * @returns Función para disparar feedback háptico
 * 
 * @example
 * const triggerHaptic = useTapFeedback();
 * 
 * <button onClick={() => {
 *   triggerHaptic('medium');
 *   handleClick();
 * }}>
 *   Click me
 * </button>
 */
export function useTapFeedback() {
  const triggerHaptic = useCallback((intensity: HapticIntensity = 'medium') => {
    if ('vibrate' in navigator) {
      const durations: Record<HapticIntensity, number> = {
        light: 10,
        medium: 25,
        strong: 50
      };
      
      try {
        navigator.vibrate(durations[intensity]);
      } catch (error) {
        // Silently fail en navegadores que no soportan
        console.debug('Haptic feedback not supported', error);
      }
    }
  }, []);

  return triggerHaptic;
}

/**
 * 📳 Hook para patrones de vibración más complejos
 * Permite crear secuencias personalizadas de vibración
 * 
 * @returns Función para disparar patrón háptico
 * 
 * @example
 * const triggerPattern = useHapticPattern();
 * 
 * // Patrón: vibra 25ms, pausa 50ms, vibra 25ms
 * triggerPattern([25, 50, 25]);
 */
export function useHapticPattern() {
  const triggerHaptic = useCallback((pattern: number[] = [25, 50, 25]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.debug('Haptic pattern not supported', error);
      }
    }
  }, []);

  return triggerHaptic;
}

/**
 * 📳 Hook para feedback contextual (success/error/warning)
 * Proporciona patrones predefinidos para diferentes estados
 * 
 * @returns Función para disparar feedback háptico por tipo
 * 
 * @example
 * const triggerHaptic = useHapticFeedback();
 * 
 * // Éxito: patrón suave
 * triggerHaptic('success');
 * 
 * // Error: patrón intenso
 * triggerHaptic('error');
 * 
 * // Warning: patrón moderado
 * triggerHaptic('warning');
 */
export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: HapticFeedbackType = 'success') => {
    if ('vibrate' in navigator) {
      const patterns: Record<HapticFeedbackType, number[]> = {
        success: [20, 30, 20],        // ✓ Success pattern (corto, suave)
        error: [50, 20, 50, 20, 50],  // ✗ Error pattern (largo, intenso)
        warning: [30, 20, 30]         // ⚠ Warning pattern (moderado)
      };

      try {
        navigator.vibrate(patterns[type]);
      } catch (error) {
        console.debug('Haptic feedback pattern not supported', error);
      }
    }
  }, []);

  return triggerHaptic;
}

/**
 * 📳 Hook para verificar soporte de Vibration API
 * Útil para mostrar/ocultar opciones de haptic feedback
 * 
 * @returns true si el navegador soporta vibración
 * 
 * @example
 * const hasHapticSupport = useHasHapticSupport();
 * 
 * {hasHapticSupport && (
 *   <button onClick={() => triggerHaptic('medium')}>
 *     Enable Haptic Feedback
 *   </button>
 * )}
 */
export function useHasHapticSupport(): boolean {
  return 'vibrate' in navigator;
}
