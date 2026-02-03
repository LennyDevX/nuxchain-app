import { useContext } from 'react';
import { POLPriceContext, type POLPriceContextType } from '../../context/POLPriceContextDef';

/**
 * Hook para usar POL price desde cualquier componente
 * Reemplaza el uso directo de usePOLPrice con el valor del Context
 * 
 * @throws Error si no está dentro de POLPriceProvider
 */
export function usePOLPrice(): POLPriceContextType {
  const context = useContext(POLPriceContext);
  if (!context) {
    throw new Error('usePOLPrice must be used within POLPriceProvider');
  }
  return context;
}
