/**
 * Local Development Server for Market Data API
 * Usa CoinGecko para datos de mercado públicos sin geo-restricciones
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Firebase Admin (lazy init)
let _db = null;
async function getFirestoreDb() {
  if (_db) return _db;
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    if (getApps().length === 0) {
      const svcAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (svcAccount) {
        // Robust parser: handles newlines inside private_key when dotenv writes multiline values
        let parsed = null;
        let raw = svcAccount.trim();
        // Strip outer quotes if any (some tools add them)
        if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
          raw = raw.slice(1, -1);
        }
        try {
          parsed = JSON.parse(raw);
        } catch (_) {
          // Fix bare newlines inside JSON string values (dotenv preserves actual \n in private_key)
          let inString = false, wasBackslash = false, fixed = '';
          for (const ch of raw) {
            if (wasBackslash) { fixed += ch; wasBackslash = false; }
            else if (ch === '\\' && inString) { fixed += ch; wasBackslash = true; }
            else if (ch === '"') { inString = !inString; fixed += ch; }
            else if (inString && ch === '\n') { fixed += '\\n'; }
            else if (inString && ch === '\r') { /* skip */ }
            else { fixed += ch; }
          }
          parsed = JSON.parse(fixed);
        }
        initializeApp({ credential: cert(parsed) });
      } else {
        // Fallback: try known service account filenames in project root
        const { readFileSync, existsSync } = await import('fs');
        const { resolve } = await import('path');
        const candidatePaths = [
          resolve(process.cwd(), 'serviceAccountKey.json'),
          resolve(process.cwd(), 'nuxchain1-firebase-adminsdk-fbsvc-23b890c5e2.json'),
        ];
        let key = null;
        for (const p of candidatePaths) {
          if (existsSync(p)) { key = JSON.parse(readFileSync(p, 'utf8')); break; }
        }
        if (!key) throw new Error('No Firebase service account found. Set FIREBASE_SERVICE_ACCOUNT env var.');
        initializeApp({ credential: cert(key) });
      }
    }
    _db = getFirestore();
    console.log('✅ Firebase Admin initialized (launchpad)');
  } catch (err) {
    console.error('❌ Firebase Admin init failed:', err.message);
  }
  return _db;
}

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

// ============================================================================
// LAUNCHPAD ENDPOINTS
// ============================================================================

// GET /api/launchpad/verify-whitelist?wallet=<pubkey>
app.get('/api/launchpad/verify-whitelist', async (req, res) => {
  const { wallet } = req.query;
  if (!wallet || typeof wallet !== 'string' || wallet.trim().length < 32) {
    return res.status(400).json({ eligible: false, error: 'Invalid wallet address' });
  }
  try {
    const db = await getFirestoreDb();
    if (!db) return res.status(500).json({ eligible: false, error: 'Database unavailable' });
    const snap = await db
      .collection('nuxchainAirdropRegistrations')
      .where('wallet', '==', wallet.trim())
      .limit(1)
      .get();
    if (snap.empty) {
      return res.json({ eligible: false, reason: 'Wallet not registered in Airdrop' });
    }
    const doc = snap.docs[0].data();
    console.log(`[verify-whitelist] ✅ ${wallet.trim().slice(0, 8)}... is eligible`);
    return res.json({
      eligible: true,
      tier: 1,
      name: doc.name || '',
      registeredAt: doc.createdAt?.toDate?.()?.toISOString() || null,
    });
  } catch (err) {
    console.error('[verify-whitelist] Error:', err.message);
    return res.status(500).json({ eligible: false, error: 'Internal server error' });
  }
});

// GET /api/launchpad/stats
app.get('/api/launchpad/stats', async (req, res) => {
  try {
    const db = await getFirestoreDb();
    if (!db) return res.json({ tier1: { nuxSold: 0, solRaised: 0, participants: 0 }, tier2: { nuxSold: 0, solRaised: 0, participants: 0 }, total: { nuxSold: 0, solRaised: 0, participants: 0 } });

    const snap = await db.collection('launchpadPurchases')
      .where('status', 'in', ['confirmed', 'distributed'])
      .get();

    const stats = {
      tier1: { nuxSold: 0, solRaised: 0, participants: 0 },
      tier2: { nuxSold: 0, solRaised: 0, participants: 0 },
      total: { nuxSold: 0, solRaised: 0, participants: 0 },
    };
    const walletsTier1 = new Set();
    const walletsTier2 = new Set();

    snap.docs.forEach(doc => {
      const d = doc.data();
      const nux = Number(d.nuxAmount) || 0;
      const sol = Number(d.solAmount) || 0;
      if (d.tier === 1) {
        stats.tier1.nuxSold += nux;
        stats.tier1.solRaised += sol;
        walletsTier1.add(d.wallet);
      } else if (d.tier === 2) {
        stats.tier2.nuxSold += nux;
        stats.tier2.solRaised += sol;
        walletsTier2.add(d.wallet);
      }
    });

    stats.tier1.participants = walletsTier1.size;
    stats.tier2.participants = walletsTier2.size;
    stats.total.nuxSold = stats.tier1.nuxSold + stats.tier2.nuxSold;
    stats.total.solRaised = stats.tier1.solRaised + stats.tier2.solRaised;
    stats.total.participants = new Set([...walletsTier1, ...walletsTier2]).size;

    // console.log(`[stats] tier1=${stats.tier1.nuxSold} NUX | tier2=${stats.tier2.nuxSold} NUX | participants=${stats.total.participants}`);
    return res.json(stats);
  } catch (err) {
    console.error('[stats] Error:', err.message);
    return res.json({ tier1: { nuxSold: 0, solRaised: 0, participants: 0 }, tier2: { nuxSold: 0, solRaised: 0, participants: 0 }, total: { nuxSold: 0, solRaised: 0, participants: 0 } });
  }
});

// POST /api/launchpad/burn-record
app.post('/api/launchpad/burn-record', async (req, res) => {
  const { wallet, amount, txSignature } = req.body ?? {};
  if (!wallet || !amount || !txSignature) return res.status(400).json({ error: 'Missing fields' });
  try {
    const db = await getFirestoreDb();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });
    const exists = await db.collection('nuxBurnRecords').where('txSignature', '==', txSignature).limit(1).get();
    if (!exists.empty) return res.json({ success: true, duplicate: true });
    await db.collection('nuxBurnRecords').add({ wallet, amount, txSignature, createdAt: new Date() });
    console.log(`[burn-record] ✅ ${wallet.slice(0, 8)}... burned ${amount} NUX`);
    return res.json({ success: true });
  } catch (err) {
    console.error('[burn-record]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/launchpad/purchase
app.post('/api/launchpad/purchase', async (req, res) => {
  const { wallet, txSignature, tier } = req.body ?? {};

  if (!wallet || !txSignature || !tier) {
    return res.status(400).json({ error: 'Missing required fields: wallet, txSignature, tier' });
  }
  if (![1, 2].includes(Number(tier))) {
    return res.status(400).json({ error: 'Invalid tier. Must be 1 or 2.' });
  }

  const TIER_PRICES = { 1: 0.000015, 2: 0.000025 };
  const TIER_CAPS   = { 1: 8_000_000, 2: 7_000_000 };
  const MIN_BUY     = { 1: 5_000, 2: 1_000 };
  const tierNum = Number(tier);

  const treasuryWallet = process.env.VITE_DEPLOYER_NUX;
  if (!treasuryWallet) {
    console.error('[purchase] VITE_DEPLOYER_NUX not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const db = await getFirestoreDb();
    if (!db) return res.status(500).json({ error: 'Database unavailable' });

    // 1. Check duplicate tx
    const dupSnap = await db.collection('launchpadPurchases').where('txSignature', '==', txSignature).limit(1).get();
    if (!dupSnap.empty) {
      return res.status(409).json({ error: 'Transaction already registered' });
    }

    // 2. Verify on-chain
    const { Connection, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
    const rpcUrl = process.env.SOLANA_RPC_QUICKNODE || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    let txInfo;
    try {
      txInfo = await connection.getParsedTransaction(txSignature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      });
    } catch {
      return res.status(400).json({ error: 'Could not fetch transaction. Please try again.' });
    }

    if (!txInfo || txInfo.meta?.err) {
      return res.status(400).json({ error: 'Transaction failed or not found on-chain' });
    }

    // Find SOL transfer to treasury
    const instructions = txInfo.transaction.message.instructions;
    let solReceived = 0;
    for (const ix of instructions) {
      if (ix.parsed?.type === 'transfer') {
        const info = ix.parsed.info;
        if (info.destination === treasuryWallet && info.source === wallet) {
          solReceived = Number(info.lamports) / LAMPORTS_PER_SOL;
          break;
        }
      }
    }

    if (solReceived <= 0) {
      return res.status(400).json({ error: 'No valid SOL transfer to treasury found in transaction' });
    }

    // 3. Calculate NUX amount
    const price = TIER_PRICES[tierNum];
    const nuxAmount = Math.floor(solReceived / price);
    if (nuxAmount < MIN_BUY[tierNum]) {
      return res.status(400).json({ error: `Minimum purchase is ${MIN_BUY[tierNum].toLocaleString()} NUX for Tier ${tierNum}` });
    }

    // 4. Check tier cap
    const tierSnap = await db.collection('launchpadPurchases')
      .where('tier', '==', tierNum)
      .where('status', 'in', ['confirmed', 'distributed'])
      .get();
    let totalSold = 0;
    tierSnap.docs.forEach(d => { totalSold += Number(d.data().nuxAmount) || 0; });
    if (totalSold + nuxAmount > TIER_CAPS[tierNum]) {
      return res.status(400).json({ error: `Tier ${tierNum} is sold out` });
    }

    // 5. Get user name from airdrop if exists
    let userName = '';
    const airdropSnap = await db.collection('nuxchainAirdropRegistrations').where('wallet', '==', wallet).limit(1).get();
    if (!airdropSnap.empty) userName = airdropSnap.docs[0].data().name || '';

    // 6. Register purchase
    await db.collection('launchpadPurchases').add({
      wallet,
      txSignature,
      tier: tierNum,
      solAmount: solReceived,
      nuxAmount,
      price,
      name: userName,
      status: 'confirmed',
      createdAt: new Date(),
    });

    console.log(`[purchase] ✅ ${wallet.slice(0, 8)}... bought ${nuxAmount} NUX (Tier ${tierNum})`);
    return res.json({ success: true, nuxAmount, solAmount: solReceived, tier: tierNum });
  } catch (err) {
    console.error('[purchase] Error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/launchpad/burn-leaderboard
app.get('/api/launchpad/burn-leaderboard', async (req, res) => {
  try {
    const db = await getFirestoreDb();
    if (!db) return res.json({ entries: [] });
    const snap = await db.collection('nuxBurnRecords').get();
    const map = new Map();
    snap.forEach(doc => {
      const d = doc.data();
      const burnDate = d.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString();
      const ex = map.get(d.wallet);
      if (ex) { ex.totalBurned += Number(d.amount); ex.txCount += 1; if (burnDate > ex.lastBurnAt) ex.lastBurnAt = burnDate; }
      else map.set(d.wallet, { totalBurned: Number(d.amount), txCount: 1, lastBurnAt: burnDate });
    });
    const entries = Array.from(map.entries()).map(([wallet, data]) => ({ wallet, ...data })).sort((a, b) => b.totalBurned - a.totalBurned).slice(0, 50);
    return res.json({ entries, total: snap.size });
  } catch (err) {
    console.error('[burn-leaderboard]', err.message);
    return res.json({ entries: [] });
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
    const w = 52;
    const bar = chalk.gray('─'.repeat(w));
    const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));

    console.log('\n' + bar);
    console.log(
      chalk.bold.cyan(' MARKET') + chalk.bold.white(' DATA SERVER') +
      chalk.dim('  v' + (process.env.npm_package_version || '1.0.0')) +
      '  ' + chalk.green('● ONLINE')
    );
    console.log(bar);
    console.log(chalk.dim('  URL    ') + chalk.cyan(`http://localhost:${PORT}`));
    console.log(chalk.dim('  Mode   ') + chalk.yellow('Development'));
    console.log(bar);
    console.log(chalk.dim('  Endpoints'));
    console.log('');

    const routes = [
      ['GET ', '/api/health/status',                  'Health check'],
      ['GET ', '/api/market/prices',                  'CoinGecko market data'],
      ['GET ', '/api/gridbot/data',                   'BTC price & history'],
      ['GET ', '/api/uniswap/prices',                 'ETH/POL/USDC prices'],
      ['GET ', '/api/launchpad/verify-whitelist',     'Wallet whitelist check'],
      ['GET ', '/api/launchpad/stats',                'Launchpad statistics'],
      ['GET ', '/api/launchpad/burn-leaderboard',     'Top NUX burners'],
      ['POST', '/api/launchpad/burn-record',          'Record NUX burn'],
      ['POST', '/api/launchpad/purchase',             'Register purchase'],
    ];

    routes.forEach(([method, path, desc]) => {
      const mColor = method.trim() === 'GET' ? chalk.green(pad(method, 5)) : chalk.yellow(pad(method, 5));
      console.log(`  ${mColor} ${chalk.white(pad(path, 34))} ${chalk.dim(desc)}`);
    });

    console.log('\n' + bar + '\n');
  });
}

startServer();

export default app;
