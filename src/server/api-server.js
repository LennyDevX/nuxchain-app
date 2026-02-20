/**
 * Local Development Server for Market Data API
 * Usa CoinGecko para datos de mercado públicos sin geo-restricciones
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener directorio actual en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// CACHE
// ============================================================================
const CACHE_DURATION = 30 * 1000; // 30 segundos
const priceCache = new Map();

function getCached(key) {
  const entry = priceCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  priceCache.delete(key);
  return null;
}

function setCached(key, data) {
  priceCache.set(key, { data, timestamp: Date.now() });
}

// ============================================================================
// ENDPOINTS
// ============================================================================

// Health check
app.get('/api/health/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Market Data API (CoinGecko)',
    environment: 'development'
  });
});

// ============================================================================
// MARKET PRICES ENDPOINT - COINGECKO PROXY
// ============================================================================

async function fetchMarketData() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[fetchMarketData] Error:', error.message);
    throw error;
  }
}

app.get('/api/market/prices', async (req, res) => {
  try {
    const { action, symbol, symbols, limit = '10' } = req.query;
    const limitNum = parseInt(limit, 10);

    // Check cache first
    const cacheKey = `market_${action || 'all'}_${limit}_${symbol || symbols || ''}`;
    const cached = getCached(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // Fetch fresh data
    const marketData = await fetchMarketData();

    // Si no hay acción, retornar todo
    if (!action) {
      const gainers = marketData
        .filter(coin => coin.price_change_percentage_24h > 0)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, limitNum);

      const losers = marketData
        .filter(coin => coin.price_change_percentage_24h < 0)
        .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        .slice(0, limitNum);

      const trending = marketData
        .sort((a, b) => (b.total_volume / b.market_cap) - (a.total_volume / a.market_cap))
        .slice(0, limitNum);

      const result = {
        success: true,
        timestamp: Date.now(),
        data: { gainers, losers, trending, total: marketData.length }
      };

      setCached(cacheKey, result);
      return res.json(result);
    }

    // Manejo de acciones específicas
    switch (action) {
      case 'gainers': {
        const gainers = marketData
          .filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
          .slice(0, limitNum);

        const result = {
          success: true,
          timestamp: Date.now(),
          data: gainers
        };
        setCached(cacheKey, result);
        return res.json(result);
      }

      case 'losers': {
        const losers = marketData
          .filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
          .slice(0, limitNum);

        const result = {
          success: true,
          timestamp: Date.now(),
          data: losers
        };
        setCached(cacheKey, result);
        return res.json(result);
      }

      case 'volume': {
        const highVolume = marketData
          .sort((a, b) => (b.total_volume / b.market_cap) - (a.total_volume / a.market_cap))
          .slice(0, limitNum);

        const result = {
          success: true,
          timestamp: Date.now(),
          data: highVolume
        };
        setCached(cacheKey, result);
        return res.json(result);
      }

      case 'price': {
        if (!symbol) {
          return res.status(400).json({
            error: 'Bad request',
            message: 'Symbol parameter is required for price action'
          });
        }

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
        );

        const priceData = await response.json();
        const result = {
          success: true,
          timestamp: Date.now(),
          data: priceData
        };
        setCached(cacheKey, result);
        return res.json(result);
      }

      case 'prices': {
        if (!symbols) {
          return res.status(400).json({
            error: 'Bad request',
            message: 'Symbols parameter is required for prices action'
          });
        }

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
        );

        const pricesData = await response.json();
        const result = {
          success: true,
          timestamp: Date.now(),
          data: pricesData
        };
        setCached(cacheKey, result);
        return res.json(result);
      }

      default:
        return res.status(400).json({
          error: 'Bad request',
          message: `Unknown action: ${action}. Available: gainers, losers, volume, price, prices`
        });
    }

  } catch (error) {
    console.error('[Market API Error]', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// ============================================================================
// GRID BOT DATA ENDPOINT - COINGECKO + FALLBACK
// ============================================================================

// Precio base de BTC aproximado actual
const BTC_BASE_PRICE = 90565; // Precio aproximado actual de BTC/USDT

const gridBotCache = new Map();

// Intentar obtener precio real de CoinGecko
async function fetchBTCPriceFromCoinGecko() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data.bitcoin?.usd;

    if (price && !isNaN(price)) {
      console.log(`✓ Got real BTC price from CoinGecko: $${price.toFixed(2)}`);
      return price;
    }

    throw new Error('Invalid price data from CoinGecko');
  } catch (error) {
    console.warn(`⚠ CoinGecko API failed: ${error.message}`);
    return null;
  }
}

// Intentar obtener historial de CoinGecko
async function fetchBTCHistoryFromCoinGecko() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly',
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.prices && Array.isArray(data.prices)) {
      const history = data.prices.map(([timestamp, price]) => ({
        timestamp,
        price
      }));
      console.log(`✓ Got ${history.length} hours of BTC history from CoinGecko`);
      return history;
    }

    throw new Error('Invalid history data from CoinGecko');
  } catch (error) {
    console.warn(`⚠ CoinGecko history API failed: ${error.message}`);
    return null;
  }
}

// Generar precio simulado como fallback
function generateSimulatedPrice() {
  // Variación de ±0.5% alrededor del precio base
  const variation = (Math.random() - 0.5) * 0.01 * BTC_BASE_PRICE;
  return BTC_BASE_PRICE + variation;
}

// Generar historial de precios simulado para las últimas 24 horas
function generateSimulatedHistory() {
  const history = [];
  const now = Date.now();

  // Generar 24 puntos de datos (uno por hora) con variaciones más realistas
  for (let i = 23; i >= 0; i--) {
    const timestamp = now - (i * 3600000); // 1 hora en ms

    // Variación más realista basada en:
    // 1. Onda sinusoidal (simula ciclos de mercado)
    // 2. Ruido aleatorio (volatilidad)
    // 3. Tendencia gradual
    const hourProgress = (23 - i) / 23;
    const sinWave = Math.sin(hourProgress * Math.PI * 4) * 800; // ±$800
    const noise = (Math.random() - 0.5) * 600; // ±$300
    const trend = (hourProgress - 0.5) * 400; // Tendencia de ±$200

    const totalVariation = sinWave + noise + trend;
    const price = BTC_BASE_PRICE + totalVariation;

    history.push({
      timestamp,
      price: parseFloat(price.toFixed(2))
    });
  }

  console.log(`✓ Generated simulated price history: ${history.length} data points`);
  return history;
}

async function getCurrentPrice() {
  const cacheKey = 'btc_price';
  const cached = gridBotCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Intentar CoinGecko primero
  let price = await fetchBTCPriceFromCoinGecko();

  if (price === null) {
    // Fallback a precio simulado
    console.log('⚠ Falling back to simulated price');
    price = generateSimulatedPrice();
  }

  gridBotCache.set(cacheKey, { data: price, timestamp: Date.now() });
  return price;
}

async function getPriceHistory() {
  const cacheKey = 'btc_history';
  const cached = gridBotCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Intentar CoinGecko primero
  let history = await fetchBTCHistoryFromCoinGecko();

  if (history === null) {
    // Fallback a historial simulado
    console.log('⚠ Falling back to simulated history');
    history = generateSimulatedHistory();
  }

  gridBotCache.set(cacheKey, { data: history, timestamp: Date.now() });
  return history;
}

app.get('/api/gridbot/data', async (req, res) => {
  try {
    const { type = 'current' } = req.query;

    if (type === 'current') {
      try {
        const price = await getCurrentPrice();
        res.json({ price, success: true });
      } catch (error) {
        console.error('Failed to get current price:', error);
        // Retornar un precio simulado si no se puede obtener de CoinGecko
        res.json({ price: 95000 + Math.random() * 5000, success: false, fallback: true });
      }
    } else if (type === 'history') {
      try {
        const history = await getPriceHistory();
        res.json({ history, success: true });
      } catch (error) {
        console.error('Failed to get price history:', error);
        // Generar historial simulado
        const history = Array.from({ length: 24 }, (_, i) => ({
          timestamp: Date.now() - (23 - i) * 3600000,
          price: 90000 + Math.random() * 10000
        }));
        res.json({ history, success: false, fallback: true });
      }
    } else if (type === 'all') {
      try {
        const [price, history] = await Promise.all([
          getCurrentPrice(),
          getPriceHistory()
        ]);
        res.json({ price, history, success: true });
      } catch (error) {
        console.error('Failed to get price data:', error);
        const price = 95000 + Math.random() * 5000;
        const history = Array.from({ length: 24 }, (_, i) => ({
          timestamp: Date.now() - (23 - i) * 3600000,
          price: 90000 + Math.random() * 10000
        }));
        res.json({ price, history, success: false, fallback: true });
      }
    } else {
      res.status(400).json({
        error: 'Invalid type parameter. Use: current, history, or all',
        success: false
      });
    }
  } catch (error) {
    console.error('[Grid Bot API] Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
});

// ============================================================================
// UNISWAP PRICE FEED ENDPOINT - COINGECKO PROXY (dev fallback)
// ============================================================================

const TRACKED_TOKENS_DEV = [
  { id: 'eth',   symbol: 'ETH',  name: 'Ethereum',        coingeckoId: 'ethereum',                color: '#627EEA' },
  { id: 'pol',   symbol: 'POL',  name: 'Polygon',          coingeckoId: 'polygon-ecosystem-token', color: '#8247E5' },
  { id: 'usdc',  symbol: 'USDC', name: 'USD Coin',         coingeckoId: 'usd-coin',                color: '#2775CA' },
  { id: 'wbtc',  symbol: 'WBTC', name: 'Wrapped Bitcoin',  coingeckoId: 'wrapped-bitcoin',         color: '#F7931A' },
  { id: 'uni',   symbol: 'UNI',  name: 'Uniswap',          coingeckoId: 'uniswap',                 color: '#FF007A' },
];

app.get('/api/uniswap/prices', async (req, res) => {
  try {
    const cacheKey = 'uniswap_prices_dev';
    const cached = getCached(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const ids = TRACKED_TOKENS_DEV.map(t => t.coingeckoId).join(',');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NuxChain-Dev/1.0'
        }
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinGecko error: ${response.status}`);
    }

    const cgData = await response.json();

    const prices = TRACKED_TOKENS_DEV.map(token => {
      const cg = cgData[token.coingeckoId] || {};
      return {
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        price: cg.usd ?? 0,
        change24h: cg.usd_24h_change ?? 0,
        volume24h: cg.usd_24h_vol ?? 0,
        color: token.color,
        source: 'coingecko',
      };
    });

    const result = {
      success: true,
      data: prices,
      timestamp: Date.now(),
      cached: false,
      source: 'coingecko',
    };

    setCached(cacheKey, result);
    res.setHeader('X-Cache', 'MISS');
    return res.json(result);

  } catch (error) {
    console.error('[Uniswap Prices Dev] Error:', error.message);
    const fallback = TRACKED_TOKENS_DEV.map(t => ({
      id: t.id, symbol: t.symbol, name: t.name,
      price: 0, change24h: 0, volume24h: 0,
      color: t.color, source: 'fallback',
    }));
    return res.json({ success: false, data: fallback, timestamp: Date.now() });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /api/health/status',
      'GET /api/market/prices',
      'GET /api/uniswap/prices',
      'GET /api/gridbot/data?type=current',
      'GET /api/gridbot/data?type=history',
      'GET /api/gridbot/data?type=all'
    ]
  });
});

// Start server
function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Market Data API Server running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints available:`);
    console.log(`   - GET  /api/health/status`);
    console.log(`   - GET  /api/gridbot/data (types: current, history, all)`);
    console.log(`\n📊 Using simulated data (BTC base: $${BTC_BASE_PRICE})\n`);
  });
}

startServer();

export default app;
