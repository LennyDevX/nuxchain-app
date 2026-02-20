/**
 * Uniswap Price Feed API - Vercel Serverless Function
 * Endpoint: GET /api/uniswap/prices
 *
 * Obtiene precios de tokens usando la Uniswap Trading API (quote EXACT_INPUT).
 * La API key se mantiene segura en el servidor — nunca se expone al frontend.
 * Fallback automático a CoinGecko si la Uniswap API falla.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const UNISWAP_API_BASE = 'https://trade-api.gateway.uniswap.org/v1';
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 30 * 1000; // 30 segundos

// Dirección nula usada como swapper placeholder para quotes de precio
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

// USDC en Ethereum (token base para calcular precios)
const USDC_ETH = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const CHAIN_ETHEREUM = 1;
const CHAIN_POLYGON = 137;

// Tokens a trackear: { id, symbol, name, address, chainId, coingeckoId, decimals }
const TRACKED_TOKENS = [
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    chainId: CHAIN_ETHEREUM,
    coingeckoId: 'ethereum',
    decimals: 18,
    color: '#627EEA',
  },
  {
    id: 'pol',
    symbol: 'POL',
    name: 'Polygon',
    address: '0x0000000000000000000000000000000000001010', // POL native on Polygon
    chainId: CHAIN_POLYGON,
    coingeckoId: 'polygon-ecosystem-token',
    decimals: 18,
    color: '#8247E5',
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    address: USDC_ETH,
    chainId: CHAIN_ETHEREUM,
    coingeckoId: 'usd-coin',
    decimals: 6,
    color: '#2775CA',
  },
  {
    id: 'wbtc',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    chainId: CHAIN_ETHEREUM,
    coingeckoId: 'wrapped-bitcoin',
    decimals: 8,
    color: '#F7931A',
  },
  {
    id: 'uni',
    symbol: 'UNI',
    name: 'Uniswap',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    chainId: CHAIN_ETHEREUM,
    coingeckoId: 'uniswap',
    decimals: 18,
    color: '#FF007A',
  },
];

export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  color: string;
  source: 'uniswap' | 'coingecko' | 'fallback';
}

interface CacheEntry {
  data: TokenPrice[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getFromCache(key: string): TokenPrice[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: TokenPrice[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Obtiene precio via Uniswap Trading API usando un quote de 1000 USDC → token.
 * Devuelve el precio en USD o null si falla.
 */
async function getUniswapPrice(
  tokenAddress: string,
  chainId: number,
  decimals: number,
  apiKey: string
): Promise<number | null> {
  try {
    // Para USDC en sí, el precio es siempre ~1
    if (tokenAddress.toLowerCase() === USDC_ETH.toLowerCase()) {
      return 1.0;
    }

    // Quote: 1000 USDC → token (EXACT_INPUT)
    const amountIn = (1000 * 1e6).toString(); // 1000 USDC en unidades base (6 decimales)

    const body = {
      tokenIn: USDC_ETH,
      tokenOut: tokenAddress,
      tokenInChainId: CHAIN_ETHEREUM,
      tokenOutChainId: chainId,
      type: 'EXACT_INPUT',
      amount: amountIn,
      swapper: NULL_ADDRESS,
      autoSlippage: 'DEFAULT',
    };

    const response = await fetch(`${UNISWAP_API_BASE}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = await response.json() as Record<string, unknown>;

    // Extraer outputAmount del classicQuote
    const classicQuote = data.quote as Record<string, unknown> | undefined;
    if (!classicQuote) return null;

    const outputAmount = classicQuote.outputAmount as string | undefined;
    if (!outputAmount) return null;

    // price = 1000 USDC / outputAmount (en unidades base del token)
    const outputTokens = Number(outputAmount) / Math.pow(10, decimals);
    if (outputTokens === 0) return null;

    return 1000 / outputTokens;
  } catch {
    return null;
  }
}

/**
 * Obtiene precios de todos los tokens via CoinGecko (fallback)
 */
async function getCoinGeckoPrices(): Promise<TokenPrice[]> {
  const ids = TRACKED_TOKENS.map(t => t.coingeckoId).join(',');
  const response = await fetch(
    `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
    {
      headers: { 'Accept': 'application/json', 'User-Agent': 'NuxChain-Backend/1.0' },
      signal: AbortSignal.timeout(6000),
    }
  );

  if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);

  const data = await response.json() as Record<string, Record<string, number>>;

  return TRACKED_TOKENS.map(token => {
    const cg = data[token.coingeckoId];
    return {
      id: token.id,
      symbol: token.symbol,
      name: token.name,
      price: cg?.usd ?? 0,
      change24h: cg?.usd_24h_change ?? 0,
      volume24h: cg?.usd_24h_vol ?? 0,
      color: token.color,
      source: 'coingecko' as const,
    };
  });
}

/**
 * Obtiene precios via Uniswap API con fallback a CoinGecko para change24h y volume
 */
async function getUniswapPrices(apiKey: string): Promise<TokenPrice[]> {
  // Siempre traemos CoinGecko para change24h y volume (Uniswap API no los provee directamente)
  const cgPrices = await getCoinGeckoPrices().catch(() => null);

  const results: TokenPrice[] = await Promise.all(
    TRACKED_TOKENS.map(async (token) => {
      const cgData = cgPrices?.find(p => p.id === token.id);

      const uniswapPrice = await getUniswapPrice(
        token.address,
        token.chainId,
        token.decimals,
        apiKey
      );

      return {
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        price: uniswapPrice ?? cgData?.price ?? 0,
        change24h: cgData?.change24h ?? 0,
        volume24h: cgData?.volume24h ?? 0,
        color: token.color,
        source: uniswapPrice !== null ? ('uniswap' as const) : ('coingecko' as const),
      };
    })
  );

  return results;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const cached = getFromCache('uniswap_prices');
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.status(200).json({ success: true, data: cached, timestamp: Date.now(), cached: true });
      return;
    }

    const apiKey = process.env.UNISWAP_API_KEY;

    let prices: TokenPrice[];

    if (apiKey) {
      prices = await getUniswapPrices(apiKey);
    } else {
      // Sin API key, usar solo CoinGecko
      prices = await getCoinGeckoPrices();
    }

    setCache('uniswap_prices', prices);

    res.setHeader('X-Cache', 'MISS');
    res.status(200).json({
      success: true,
      data: prices,
      timestamp: Date.now(),
      cached: false,
      source: apiKey ? 'uniswap+coingecko' : 'coingecko',
    });
  } catch (error) {
    console.error('[Uniswap Prices API Error]', error);

    // Fallback: devolver precios estáticos de referencia
    const fallback: TokenPrice[] = TRACKED_TOKENS.map(t => ({
      id: t.id,
      symbol: t.symbol,
      name: t.name,
      price: 0,
      change24h: 0,
      volume24h: 0,
      color: t.color,
      source: 'fallback' as const,
    }));

    res.status(200).json({
      success: false,
      data: fallback,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
