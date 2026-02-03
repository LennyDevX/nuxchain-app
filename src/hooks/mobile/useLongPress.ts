import { useState, useCallback, useRef, useEffect } from 'react';

interface LongPressOptions {
  threshold?: number; // Duración en ms para considerar long press (default: 500ms)
  onStart?: () => void; // Se ejecuta al iniciar el press
  onEnd?: () => void; // Se ejecuta al terminar el press
  onCancel?: () => void; // Se ejecuta si se cancela el press
}

interface LongPressResult {
  bind: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  isPressed: boolean;
  progress: number; // 0-100, útil para mostrar progreso visual
}

/**
 * 👇 Hook para detectar long press (mantener presión)
 * Detecta cuando el usuario mantiene presionado un elemento por una duración
 * 
 * @param callback - Función a ejecutar cuando se complete el long press
 * @param options - Opciones (threshold, onStart, onEnd, onCancel)
 * @returns Objeto con bind handlers e información de estado
 * 
 * @example
 * const { bind, isPressed, progress } = useLongPress(
 *   () => console.log('Long pressed!'),
 *   { threshold: 500, onStart: () => console.log('Started') }
 * );
 * 
 * <button {...bind}>
 *   Press and hold {isPressed && `(${progress}%)`}
 * </button>
 */
export function useLongPress(
  callback: () => void,
  options: LongPressOptions = {}
): LongPressResult {
  const { threshold = 500, onStart, onEnd, onCancel } = options;
  
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Iniciar long press
  const handleStart = useCallback(() => {
    setIsPressed(true);
    setProgress(0);
    startTimeRef.current = Date.now();
    onStart?.();

    // Actualizar progreso visual cada 10ms
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min((elapsed / threshold) * 100, 100);
      setProgress(currentProgress);
    }, 10);

    // Timer para completar el long press
    timeoutRef.current = setTimeout(() => {
      callback();
      onEnd?.();
      setIsPressed(false);
      setProgress(100);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, threshold);
  }, [threshold, callback, onStart, onEnd]);

  // Cancelar long press
  const handleEnd = useCallback(() => {
    setIsPressed(false);
    setProgress(0);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Si se ejecutó antes de completar el threshold, ejecutar onCancel
    if (Date.now() - startTimeRef.current < threshold) {
      onCancel?.();
    }
  }, [threshold, onCancel]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    bind: {
      onMouseDown: () => handleStart(),
      onMouseUp: () => handleEnd(),
      onMouseLeave: () => handleEnd(),
      onTouchStart: () => handleStart(),
      onTouchEnd: () => handleEnd(),
    },
    isPressed,
    progress,
  };
}

/**
 * 👇 Hook para context menu (long press con opciones)
 * Abre un menú de contexto al long press
 * 
 * @param items - Array de opciones del menú
 * @param onSelect - Callback cuando selecciona una opción
 * @returns Objeto con bind handlers y posición del menú
 * 
 * @example
 * const { bind, showMenu, menuX, menuY } = useContextMenu(
 *   [
 *     { label: 'Edit', action: () => {} },
 *     { label: 'Delete', action: () => {} }
 *   ]
 * );
 */
interface ContextMenuItem {
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  isDangerous?: boolean;
}

interface ContextMenuResult {
  bind: {
    onContextMenu: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  showMenu: boolean;
  menuX: number;
  menuY: number;
  closeMenu: () => void;
  executeAction: (item: ContextMenuItem) => void;
}

export function useContextMenu(
  threshold: number = 500
): ContextMenuResult {
  const [showMenu, setShowMenu] = useState(false);
  const [menuX, setMenuX] = useState(0);
  const [menuY, setMenuY] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuX(e.clientX);
    setMenuY(e.clientY);
    setShowMenu(true);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startTimeRef.current = Date.now();
    startXRef.current = e.targetTouches[0].clientX;
    startYRef.current = e.targetTouches[0].clientY;

    timeoutRef.current = setTimeout(() => {
      setMenuX(startXRef.current);
      setMenuY(startYRef.current);
      setShowMenu(true);
    }, threshold);
  }, [threshold]);

  const handleTouchEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const closeMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  const executeAction = useCallback((item: ContextMenuItem) => {
    item.action();
    closeMenu();
  }, [closeMenu]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Cerrar menú al hacer click afuera
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = () => {
      closeMenu();
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu, closeMenu]);

  return {
    bind: {
      onContextMenu: handleContextMenu,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
    showMenu,
    menuX,
    menuY,
    closeMenu,
    executeAction,
  };
}

/**
 * 👇 Hook para double tap
 * Detecta doble toque en dispositivos táctiles
 * 
 * @param callback - Función a ejecutar en double tap
 * @param threshold - Tiempo máximo entre taps (default: 300ms)
 * @returns Objeto con bind handlers
 * 
 * @example
 * const { bind } = useDoubleTap(() => console.log('Double tapped!'));
 * 
 * <div {...bind}>
 *   Double tap me
 * </div>
 */
export function useDoubleTap(
  callback: () => void,
  threshold: number = 300
): {
  bind: {
    onTouchEnd: (e: React.TouchEvent) => void;
  };
} {
  const lastTapRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchEnd = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < threshold) {
      // Double tap detectado
      callback();
      lastTapRef.current = 0;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      lastTapRef.current = now;

      // Reset después del threshold
      timeoutRef.current = setTimeout(() => {
        lastTapRef.current = 0;
      }, threshold);
    }
  }, [callback, threshold]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    bind: {
      onTouchEnd: handleTouchEnd,
    },
  };
}
