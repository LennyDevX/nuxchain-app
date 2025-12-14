/**
 * useLiveGridBot Hook - OPTIMIZED V2
 * Hook para manejar Grid Bot con datos de Binance Futures
 * 
 * MEJORAS v2:
 * ✅ Binance Futures data (mark price, funding rate)
 * ✅ WebSocket para actualizaciones en tiempo real
 * ✅ Fallback a REST API cada 30s
 * ✅ Indicadores de fuente de datos
 * ✅ Métricas de riesgo
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GridBotConfig, GridBotMetrics } from '../components/investments/grid-bot-calculator';
import { calculatePnL, forceSaveBotState } from '../components/investments/grid-bot-calculator';

// API endpoints
const GRIDBOT_API = import.meta.env.DEV 
  ? 'http://localhost:3003/api/gridbot/data'
  : '/api/gridbot/data';

// WebSocket endpoint (Binance Futures)
const BINANCE_WS = 'wss://fstream.binance.com/ws/btcusdt@markPrice';

// Intervals
const REST_UPDATE_INTERVAL = 30000;  // 30 segundos para REST fallback
const WS_RECONNECT_DELAY = 5000;     // 5 segundos para reconectar WS
const MAX_WS_RETRIES = 5;

// Fallback prices
const FALLBACK_PRICE = 94500;

interface ApiResponse {
  success?: boolean;
  price?: number;
  markPrice?: number;
  fundingRate?: number;
  nextFundingTime?: number;
  history?: Array<{ timestamp: number; price: number }>;
  source?: 'binance' | 'coingecko' | 'fallback';
}

interface WebSocketMessage {
  e: string;           // Event type
  E: number;           // Event time
  s: string;           // Symbol
  p: string;           // Mark price
  i: string;           // Index price
  P: string;           // Estimated settle price
  r: string;           // Funding rate
  T: number;           // Next funding time
}

interface UseLiveGridBotReturn {
  metrics: GridBotMetrics | null;
  currentPrice: number | null;
  markPrice: number | null;
  fundingRate: number | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  dataSource: 'websocket' | 'binance' | 'coingecko' | 'fallback';
  isConnected: boolean;
}

/**
 * Hook principal para obtener métricas del Grid Bot en tiempo real
 */
export function useLiveGridBot(config: GridBotConfig): UseLiveGridBotReturn {
  // State
  const [metrics, setMetrics] = useState<GridBotMetrics | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [markPrice, setMarkPrice] = useState<number | null>(null);
  const [fundingRate, setFundingRate] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<'websocket' | 'binance' | 'coingecko' | 'fallback'>('fallback');
  const [isConnected, setIsConnected] = useState(false);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const wsRetriesRef = useRef(0);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const priceHistoryRef = useRef<number[]>([]);

  // Keep priceHistoryRef in sync
  useEffect(() => {
    priceHistoryRef.current = priceHistory;
  }, [priceHistory]);

  /**
   * Calcula métricas con datos actuales
   */
  const updateMetricsWithPrice = useCallback((
    price: number,
    mark: number,
    funding: number,
    history: number[]
  ) => {
    try {
      const calculatedMetrics = calculatePnL(config, price, history, funding, mark);
      setMetrics(calculatedMetrics);
      setCurrentPrice(price);
      setMarkPrice(mark);
      setFundingRate(funding);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating metrics');
    }
  }, [config]);

  /**
   * Fetch inicial y fallback vía REST API
   */
  const fetchFromREST = useCallback(async (includeHistory = false): Promise<void> => {
    try {
      setIsLoading(true);
      
      const type = includeHistory || priceHistoryRef.current.length === 0 ? 'all' : 'current';
      const response = await fetch(`${GRIDBOT_API}?type=${type}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json() as ApiResponse;
      
      const price = data.markPrice || data.price || FALLBACK_PRICE;
      const mark = data.markPrice || price;
      const funding = data.fundingRate || 0.0001;
      
      // Actualizar historial si se recibió
      let history = priceHistoryRef.current;
      if (data.history && data.history.length > 0) {
        history = data.history.map(h => h.price);
        setPriceHistory(history);
      }
      
      // Actualizar source
      if (data.source) {
        setDataSource(data.source);
      }
      
      updateMetricsWithPrice(price, mark, funding, history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      setIsLoading(false);
    }
  }, [updateMetricsWithPrice]);

  /**
   * Conectar WebSocket para actualizaciones en tiempo real
   */
  const connectWebSocket = useCallback(() => {
    // No conectar en SSR
    if (typeof window === 'undefined') {
      return;
    }

    // Evitar conexiones duplicadas
    if (wsRef.current) {
      const state = wsRef.current.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        return;
      }
      // Cerrar conexión anterior si existe
      try {
        wsRef.current.close();
      } catch {
        // Silencioso
      }
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket(BINANCE_WS);

      ws.onopen = () => {
        setIsConnected(true);
        setDataSource('websocket');
        wsRetriesRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          
          if (data.e === 'markPriceUpdate' && data.s === 'BTCUSDT') {
            const price = parseFloat(data.p);
            const funding = parseFloat(data.r);
            
            updateMetricsWithPrice(
              price,
              price, // Mark price
              funding,
              priceHistoryRef.current
            );
          }
        } catch {
          // Parse error silencioso
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        
        // Limpiar referencia solo si es esta misma instancia
        if (wsRef.current === ws) {
          wsRef.current = null;
        }

        // Reconectar solo si no fue cierre intencional y no hay demasiados intentos
        if (event.code !== 1000 && wsRetriesRef.current < MAX_WS_RETRIES) {
          wsRetriesRef.current++;
          
          // Esperar antes de reconectar
          setTimeout(() => {
            // Verificar que no se haya conectado mientras tanto
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
              connectWebSocket();
            }
          }, WS_RECONNECT_DELAY);
        } else if (wsRetriesRef.current >= MAX_WS_RETRIES) {
          setDataSource('binance');
        }
      };

      wsRef.current = ws;
    } catch {
      setIsConnected(false);
      wsRef.current = null;
    }
  }, [updateMetricsWithPrice]);

  /**
   * Desconectar WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Efecto principal: inicialización y cleanup
  useEffect(() => {
    // Fetch inicial con historial
    fetchFromREST(true);

    // Conectar WebSocket para tiempo real
    connectWebSocket();

    // REST fallback cada 30 segundos (backup si WS falla)
    restIntervalRef.current = setInterval(() => {
      // Solo usar REST si WebSocket no está conectado
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        fetchFromREST(false);
      }
    }, REST_UPDATE_INTERVAL);

    // Guardar estado periódicamente
    const saveInterval = setInterval(() => {
      forceSaveBotState();
    }, 60000); // Cada minuto

    // Cleanup
    return () => {
      disconnectWebSocket();
      
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
      
      clearInterval(saveInterval);
      
      // Guardar estado final
      forceSaveBotState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch historial cada 5 minutos para mantener curva actualizada
  useEffect(() => {
    const historyInterval = setInterval(() => {
      fetchFromREST(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(historyInterval);
  }, [fetchFromREST]);

  return {
    metrics,
    currentPrice,
    markPrice,
    fundingRate,
    isLoading,
    error,
    lastUpdate,
    dataSource,
    isConnected,
  };
}

/**
 * Hook para múltiples Grid Bots (si se necesita en el futuro)
 */
export function useMultipleGridBots(configs: GridBotConfig[]) {
  const [botsMetrics, setBotsMetrics] = useState<Map<string, GridBotMetrics>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateAllBots = async () => {
      setIsLoading(true);
      const newMetrics = new Map<string, GridBotMetrics>();
      
      try {
        const response = await fetch(`${GRIDBOT_API}?type=current`);
        const data = await response.json() as ApiResponse;
        const price = data.markPrice || data.price || FALLBACK_PRICE;
        const mark = data.markPrice || price;
        const funding = data.fundingRate || 0.0001;
        
        for (const config of configs) {
          const metrics = calculatePnL(config, price, [], funding, mark);
          newMetrics.set(config.symbol, metrics);
        }
      } catch {
        // Error silencioso
      }
      
      setBotsMetrics(newMetrics);
      setIsLoading(false);
    };

    updateAllBots();
    const interval = setInterval(updateAllBots, REST_UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [configs]);

  return { botsMetrics, isLoading };
}

/**
 * Hook para obtener solo precio actual (ligero)
 */
export function useBTCPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`${GRIDBOT_API}?type=current`);
        const data = await response.json() as ApiResponse;
        setPrice(data.markPrice || data.price || null);
      } catch {
        // Error silencioso
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrice();
    const interval = setInterval(fetchPrice, REST_UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);
  
  return { price, isLoading };
}
