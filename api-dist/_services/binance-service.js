/**
 * Binance Futures API Service
 * Servicio para obtener información de Grid Trading Bots
 *
 * Endpoints utilizados:
 * - /fapi/v3/balance - Balance de cuenta de futuros
 * - /fapi/v3/account - Información completa de cuenta con posiciones
 * - /fapi/v1/openOrders - Órdenes abiertas (grid lines)
 */
import crypto from 'crypto';
// ============================================================================
// SIGNATURE & REQUEST HELPERS
// ============================================================================
/**
 * Genera firma HMAC SHA256 para autenticación con Binance
 */
function generateSignature(queryString, secretKey) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(queryString)
        .digest('hex');
}
/**
 * Construye query string con timestamp y firma
 */
function buildSignedQueryString(params, secretKey) {
    const timestamp = Date.now();
    const queryParams = new URLSearchParams({
        ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
        timestamp: String(timestamp),
        recvWindow: '5000'
    });
    const queryString = queryParams.toString();
    const signature = generateSignature(queryString, secretKey);
    return `${queryString}&signature=${signature}`;
}
/**
 * Realiza petición autenticada a Binance Futures API
 */
async function binanceRequest(endpoint, credentials, params = {}) {
    const baseUrl = 'https://fapi.binance.com';
    const signedQuery = buildSignedQueryString(params, credentials.secretKey);
    const url = `${baseUrl}${endpoint}?${signedQuery}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'X-MBX-APIKEY': credentials.apiKey,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Binance API Error: ${response.status} - ${errorData.msg || response.statusText}`);
    }
    return response.json();
}
// ============================================================================
// API METHODS
// ============================================================================
/**
 * Obtiene balance de la cuenta de futuros
 */
export async function getFuturesBalance(credentials) {
    return binanceRequest('/fapi/v3/balance', credentials);
}
/**
 * Obtiene información completa de cuenta (balance + posiciones)
 */
export async function getAccountInfo(credentials) {
    return binanceRequest('/fapi/v3/account', credentials);
}
/**
 * Obtiene órdenes abiertas (para ver grid lines)
 */
export async function getOpenOrders(credentials, symbol) {
    const params = symbol ? { symbol } : {};
    return binanceRequest('/fapi/v1/openOrders', credentials, params);
}
/**
 * Obtiene información de posición para un símbolo específico
 */
export async function getPositionRisk(credentials, symbol) {
    const params = symbol ? { symbol } : {};
    return binanceRequest('/fapi/v2/positionRisk', credentials, params);
}
// ============================================================================
// GRID BOT ANALYSIS
// ============================================================================
/**
 * Analiza órdenes abiertas para identificar patrones de Grid Bot
 */
function analyzeGridBots(orders) {
    // Agrupar órdenes por símbolo
    const ordersBySymbol = orders.reduce((acc, order) => {
        if (!acc[order.symbol]) {
            acc[order.symbol] = [];
        }
        acc[order.symbol].push(order);
        return acc;
    }, {});
    const gridBots = [];
    for (const [symbol, symbolOrders] of Object.entries(ordersBySymbol)) {
        // Filtrar solo órdenes LIMIT (típicas de grid)
        const limitOrders = symbolOrders.filter(o => o.type === 'LIMIT' && parseFloat(o.price) > 0);
        // Si hay múltiples órdenes limit en ambos lados, probablemente es un grid
        const buyOrders = limitOrders.filter(o => o.side === 'BUY');
        const sellOrders = limitOrders.filter(o => o.side === 'SELL');
        // Heurística: si hay al menos 3 órdenes en cada lado, parece un grid
        if (buyOrders.length >= 2 || sellOrders.length >= 2) {
            const allPrices = limitOrders.map(o => parseFloat(o.price));
            gridBots.push({
                symbol,
                totalOrders: limitOrders.length,
                buyOrders: buyOrders.length,
                sellOrders: sellOrders.length,
                priceRange: {
                    min: Math.min(...allPrices),
                    max: Math.max(...allPrices)
                },
                gridLines: limitOrders
                    .map(o => ({
                    price: parseFloat(o.price),
                    side: o.side,
                    quantity: parseFloat(o.origQty)
                }))
                    .sort((a, b) => a.price - b.price)
            });
        }
    }
    return gridBots;
}
// ============================================================================
// MAIN EXPORT: GET INVESTMENT SUMMARY
// ============================================================================
/**
 * Obtiene un resumen completo de inversiones para mostrar en la web
 * Esta es la función principal que combina toda la información
 */
export async function getInvestmentSummary(credentials) {
    // Obtener datos en paralelo para eficiencia
    const [accountInfo, openOrders] = await Promise.all([
        getAccountInfo(credentials),
        getOpenOrders(credentials)
    ]);
    // Filtrar posiciones activas (con cantidad > 0)
    const activePositions = accountInfo.positions.filter(p => parseFloat(p.positionAmt) !== 0);
    // Analizar grid bots
    const gridBots = analyzeGridBots(openOrders);
    // Calcular métricas de rendimiento
    const totalUnrealizedPnL = parseFloat(accountInfo.totalUnrealizedProfit);
    const totalBalance = parseFloat(accountInfo.totalWalletBalance);
    const pnlPercentage = totalBalance > 0
        ? (totalUnrealizedPnL / totalBalance) * 100
        : 0;
    // Formatear posiciones para el frontend
    const formattedPositions = activePositions.map(p => {
        const size = Math.abs(parseFloat(p.positionAmt));
        const entryPrice = parseFloat(p.entryPrice || '0');
        const markPrice = parseFloat(p.markPrice || p.entryPrice || '0');
        const unrealizedPnL = parseFloat(p.unrealizedProfit);
        const margin = parseFloat(p.initialMargin || '0');
        return {
            symbol: p.symbol,
            side: parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT',
            size,
            entryPrice,
            markPrice,
            unrealizedPnL,
            leverage: parseInt(p.leverage || '1'),
            margin,
            pnlPercentage: margin > 0 ? (unrealizedPnL / margin) * 100 : 0
        };
    });
    return {
        lastUpdate: new Date().toISOString(),
        account: {
            totalBalance: parseFloat(accountInfo.totalWalletBalance),
            availableBalance: parseFloat(accountInfo.availableBalance),
            unrealizedPnL: totalUnrealizedPnL,
            totalMargin: parseFloat(accountInfo.totalInitialMargin),
            currency: 'USDT'
        },
        positions: formattedPositions,
        gridBots,
        performance: {
            totalPnL: totalUnrealizedPnL,
            pnlPercentage,
            activePositions: activePositions.length,
            activeGridBots: gridBots.length
        }
    };
}
/**
 * Obtiene una versión sanitizada del resumen (sin datos sensibles)
 * Para mostrar públicamente
 */
export async function getPublicInvestmentSummary(credentials) {
    const fullSummary = await getInvestmentSummary(credentials);
    // Versión pública: mostrar porcentajes y tendencias, no cantidades exactas
    return {
        lastUpdate: fullSummary.lastUpdate,
        performance: {
            totalPnL: fullSummary.performance.totalPnL,
            pnlPercentage: fullSummary.performance.pnlPercentage,
            activePositions: fullSummary.performance.activePositions,
            activeGridBots: fullSummary.performance.activeGridBots
        },
        positions: fullSummary.positions.map(p => ({
            ...p,
            // Ocultar tamaño exacto de posición para privacidad
            size: 0,
            margin: 0
        })),
        gridBots: fullSummary.gridBots.map(g => ({
            ...g,
            gridLines: [] // No mostrar órdenes específicas públicamente
        }))
    };
}
// ============================================================================
// HEALTH CHECK
// ============================================================================
/**
 * Verifica conectividad con Binance API
 */
export async function checkBinanceConnection(credentials) {
    try {
        await getFuturesBalance(credentials);
        return true;
    }
    catch {
        return false;
    }
}
export default {
    getFuturesBalance,
    getAccountInfo,
    getOpenOrders,
    getPositionRisk,
    getInvestmentSummary,
    getPublicInvestmentSummary,
    checkBinanceConnection
};
