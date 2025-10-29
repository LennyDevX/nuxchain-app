import { useState, useEffect, useCallback } from 'react';

/**
 * 🎯 Hook para debounce de valores
 * Ideal para búsquedas, filtros y inputs en mobile
 * Reduce llamadas a APIs y mejora performance
 * 
 * @param value - Valor a debounce
 * @param delay - Delay en ms (default: 300ms)
 * @returns Valor debounced
 * 
 * @example
 * const searchQuery = 'nft airdrops';
 * const debouncedSearch = useDebounce(searchQuery, 500);
 * 
 * useEffect(() => {
 *   // Solo se ejecuta después de 500ms sin cambios
 *   fetchNFTs(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establece timer para actualizar valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancela timer si el valor cambia antes de que se dispare
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 🎯 Hook alternativo con callback
 * Mejor rendimiento cuando necesitas ejecutar función directamente
 * 
 * @param callback - Función a ejecutar con debounce
 * @param delay - Delay en ms (default: 300ms)
 * @returns Función debounced
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((query: string) => {
 *   fetchNFTs(query);
 * }, 500);
 * 
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [callback, delay, timeoutId]);
}

/**
 * 🎯 Hook avanzado con estado de carga
 * Incluye indicador de "isDebouncing" para mostrar feedback visual
 * 
 * @param value - Valor a debounce
 * @param delay - Delay en ms (default: 300ms)
 * @returns [debouncedValue, isDebouncing]
 * 
 * @example
 * const [debouncedSearch, isDebouncing] = useDebouncedValue(searchQuery, 500);
 * 
 * {isDebouncing && <Spinner />}
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number = 300
): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    // Marca como debouncing al inicio (fuera del effect)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  // Detectar cambio de valor para isDebouncing
  useEffect(() => {
    setIsDebouncing(value !== debouncedValue);
  }, [value, debouncedValue]);

  return [debouncedValue, isDebouncing];
}
