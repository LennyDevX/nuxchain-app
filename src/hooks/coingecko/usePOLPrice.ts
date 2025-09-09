import { useState, useEffect } from 'react';

interface POLPriceData {
  usd: number;
  usd_24h_change: number;
}

interface UsePOLPriceReturn {
  polPrice: number | null;
  priceChange24h: number | null;
  loading: boolean;
  error: string | null;
  convertPOLToUSD: (polAmount: number) => string;
}

const usePOLPrice = (): UsePOLPriceReturn => {
  const [polPrice, setPOLPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPOLPrice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using CoinGecko's free API endpoint for POL (polygon-ecosystem-token)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd&include_24hr_change=true'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const polData: POLPriceData = data['polygon-ecosystem-token'];
      
      if (polData) {
        setPOLPrice(polData.usd);
        setPriceChange24h(polData.usd_24h_change);
      } else {
        throw new Error('POL price data not found');
      }
    } catch (err) {
      console.error('Error fetching POL price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch POL price');
    } finally {
      setLoading(false);
    }
  };

  const convertPOLToUSD = (polAmount: number): string => {
    if (!polPrice) return '$0.00';
    const usdValue = polAmount * polPrice;
    return `$${usdValue.toFixed(2)}`;
  };

  useEffect(() => {
    fetchPOLPrice();
    
    // Refresh price every 5 minutes to respect rate limits
    const interval = setInterval(fetchPOLPrice, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    polPrice,
    priceChange24h,
    loading,
    error,
    convertPOLToUSD
  };
};

export default usePOLPrice;