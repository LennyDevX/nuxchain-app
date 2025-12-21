/**
 * Grid Bot Data API - OPTIMIZED V2
 * Endpoint para obtener datos de Binance Futures (Mark Price, Funding Rate)
 * con fallback a CoinGecko
 *
 * MEJORAS v2:
 * ✅ Binance Futures API (mark price, funding rate)
 * ✅ CoinGecko como fallback
 * ✅ Cache inteligente por tipo de dato
 * ✅ Klines para historial de precios
 */
import { withEnhancedSecurity } from '../_middlewares/enhanced-security.js';
// APIs
const BINANCE_FUTURES_API = 'https://fapi.binance.com/fapi/v1';
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
// Cache con TTLs diferentes por tipo de dato
const cache = new Map();
// TTLs (en ms)
const TTL = {
    MARK_PRICE: 5000, // 5 segundos (más frecuente)
    FUNDING_RATE: 60000, // 1 minuto (cambia cada 8h)
    KLINES: 60000, // 1 minuto (historial)
    COINGECKO: 30000, // 30 segundos (rate limited)
};
/**
 * Obtener del cache si no ha expirado
 */
function getFromCache(key, ttl) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }
    return null;
}
/**
 * Guardar en cache
 */
function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}
/**
 * Obtiene Mark Price y Funding Rate de Binance Futures
 */
async function getBinanceMarkPrice() {
    const cacheKey = 'binance_mark_price';
    const cached = getFromCache(cacheKey, TTL.MARK_PRICE);
    if (cached)
        return cached;
    try {
        const response = await fetch(`${BINANCE_FUTURES_API}/premiumIndex?symbol=BTCUSDT`, {
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            console.warn('[Binance API] Error:', response.status);
            return null;
        }
        const data = await response.json();
        const result = {
            markPrice: parseFloat(data.markPrice),
            lastFundingRate: parseFloat(data.lastFundingRate),
            nextFundingTime: data.nextFundingTime,
        };
        setCache(cacheKey, result);
        return result;
    }
    catch (error) {
        console.error('[getBinanceMarkPrice] Error:', error);
        return null;
    }
}
/**
 * Obtiene historial de precios (Klines) de Binance Futures
 * Intervalo: 1h, Límite: 24 (últimas 24 horas)
 */
async function getBinanceKlines() {
    const cacheKey = 'binance_klines';
    const cached = getFromCache(cacheKey, TTL.KLINES);
    if (cached)
        return cached;
    try {
        const response = await fetch(`${BINANCE_FUTURES_API}/klines?symbol=BTCUSDT&interval=1h&limit=24`, {
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            console.warn('[Binance Klines] Error:', response.status);
            return [];
        }
        const data = await response.json();
        const history = data.map((kline) => ({
            timestamp: kline[0],
            price: parseFloat(kline[4]), // Close price
        }));
        setCache(cacheKey, history);
        return history;
    }
    catch (error) {
        console.error('[getBinanceKlines] Error:', error);
        return [];
    }
}
/**
 * Fallback: Obtiene precio de CoinGecko
 */
async function getCoinGeckoPrice() {
    const cacheKey = 'coingecko_price';
    const cached = getFromCache(cacheKey, TTL.COINGECKO);
    if (cached)
        return cached;
    try {
        const response = await fetch(`${COINGECKO_API_BASE}/simple/price?ids=bitcoin&vs_currencies=usd`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Nuxchain-App/2.0',
            },
        });
        if (!response.ok) {
            console.warn('[CoinGecko] Error:', response.status);
            return null;
        }
        const data = await response.json();
        const price = data.bitcoin?.usd;
        if (price) {
            setCache(cacheKey, price);
        }
        return price || null;
    }
    catch (error) {
        console.error('[getCoinGeckoPrice] Error:', error);
        return null;
    }
}
/**
 * Fallback: Obtiene historial de CoinGecko
 */
async function getCoinGeckoHistory() {
    const cacheKey = 'coingecko_history';
    const cached = getFromCache(cacheKey, TTL.COINGECKO);
    if (cached)
        return cached;
    try {
        const response = await fetch(`${COINGECKO_API_BASE}/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Nuxchain-App/2.0',
            },
        });
        if (!response.ok) {
            console.warn('[CoinGecko History] Error:', response.status);
            return [];
        }
        const data = await response.json();
        const history = data.prices.map(([timestamp, price]) => ({
            timestamp,
            price,
        }));
        setCache(cacheKey, history);
        return history;
    }
    catch (error) {
        console.error('[getCoinGeckoHistory] Error:', error);
        return [];
    }
}
/**
 * Obtiene todos los datos necesarios con fallbacks
 */
async function getAllData() {
    // Intentar Binance primero
    const binanceData = await getBinanceMarkPrice();
    const binanceHistory = await getBinanceKlines();
    if (binanceData && binanceHistory.length > 0) {
        return {
            price: binanceData.markPrice,
            markPrice: binanceData.markPrice,
            fundingRate: binanceData.lastFundingRate,
            nextFundingTime: binanceData.nextFundingTime,
            history: binanceHistory,
            source: 'binance',
        };
    }
    // Fallback a CoinGecko
    const coinGeckoPrice = await getCoinGeckoPrice();
    const coinGeckoHistory = await getCoinGeckoHistory();
    if (coinGeckoPrice) {
        return {
            price: coinGeckoPrice,
            markPrice: coinGeckoPrice,
            fundingRate: 0.0001, // Default funding rate
            nextFundingTime: getNextFundingTime(),
            history: coinGeckoHistory,
            source: 'coingecko',
        };
    }
    // Último fallback: precio hardcoded
    return {
        price: 94500, // Precio aproximado actual
        markPrice: 94500,
        fundingRate: 0.0001,
        nextFundingTime: getNextFundingTime(),
        history: [],
        source: 'fallback',
    };
}
/**
 * Calcula el próximo funding time (cada 8 horas: 00:00, 08:00, 16:00 UTC)
 */
function getNextFundingTime() {
    const now = new Date();
    const hours = now.getUTCHours();
    let nextHour;
    if (hours < 8) {
        nextHour = 8;
    }
    else if (hours < 16) {
        nextHour = 16;
    }
    else {
        nextHour = 24; // Midnight next day
    }
    const next = new Date(now);
    next.setUTCHours(nextHour % 24, 0, 0, 0);
    if (nextHour === 24) {
        next.setUTCDate(next.getUTCDate() + 1);
    }
    return next.getTime();
}
/**
 * Handler principal
 */
export default withEnhancedSecurity(async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
        });
    }
    try {
        const { type } = req.query;
        // Solo mark price (más rápido)
        if (type === 'current') {
            const binanceData = await getBinanceMarkPrice();
            if (binanceData) {
                return res.status(200).json({
                    success: true,
                    price: binanceData.markPrice,
                    markPrice: binanceData.markPrice,
                    fundingRate: binanceData.lastFundingRate,
                    nextFundingTime: binanceData.nextFundingTime,
                    source: 'binance',
                    timestamp: Date.now(),
                });
            }
            // Fallback
            const coinGeckoPrice = await getCoinGeckoPrice();
            return res.status(200).json({
                success: true,
                price: coinGeckoPrice || 94500,
                markPrice: coinGeckoPrice || 94500,
                fundingRate: 0.0001,
                nextFundingTime: getNextFundingTime(),
                source: coinGeckoPrice ? 'coingecko' : 'fallback',
                timestamp: Date.now(),
            });
        }
        // Solo historial
        if (type === 'history') {
            let history = await getBinanceKlines();
            let source = 'binance';
            if (history.length === 0) {
                history = await getCoinGeckoHistory();
                source = 'coingecko';
            }
            return res.status(200).json({
                success: true,
                history,
                source,
                timestamp: Date.now(),
            });
        }
        // Todos los datos (default)
        if (type === 'all' || !type) {
            const allData = await getAllData();
            return res.status(200).json({
                success: true,
                price: allData.price,
                markPrice: allData.markPrice,
                fundingRate: allData.fundingRate,
                nextFundingTime: allData.nextFundingTime,
                history: allData.history,
                source: allData.source,
                timestamp: Date.now(),
            });
        }
        // Solo funding rate
        if (type === 'funding') {
            const binanceData = await getBinanceMarkPrice();
            return res.status(200).json({
                success: true,
                fundingRate: binanceData?.lastFundingRate || 0.0001,
                nextFundingTime: binanceData?.nextFundingTime || getNextFundingTime(),
                source: binanceData ? 'binance' : 'fallback',
                timestamp: Date.now(),
            });
        }
        return res.status(400).json({
            success: false,
            error: 'Invalid type parameter. Use: current, history, all, or funding',
        });
    }
    catch (error) {
        console.error('[Grid Bot Data API] Error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            timestamp: Date.now(),
        });
    }
});
