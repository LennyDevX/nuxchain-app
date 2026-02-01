/**
 * Debounce function to limit the rate at which a function can fire
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @param immediate - Whether to execute immediately on the leading edge
 * @returns The debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function to limit the rate at which a function can fire
 * @param func - The function to throttle
 * @param limit - The number of milliseconds to limit
 * @returns The throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Advanced debounce with requestAnimationFrame for UI updates
 * @param func - The function to debounce
 * @returns The debounced function
 */
export function debounceRAF<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;
  
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    if (rafId) cancelAnimationFrame(rafId);
    
    timeout = setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        func.apply(this, args);
      });
    }, 16); // ~60fps
  };
}