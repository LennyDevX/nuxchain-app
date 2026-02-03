import { createContext } from 'react';

export interface POLPriceContextType {
  polPrice: number | null;
  priceChange24h: number | null;
  loading: boolean;
  error: string | null;
  convertPOLToUSD: (polAmount: number) => string;
  refreshPrice: () => Promise<void>;
}

export const POLPriceContext = createContext<POLPriceContextType | undefined>(undefined);
