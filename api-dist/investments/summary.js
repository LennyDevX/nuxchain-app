/**
 * API Endpoint: GET /api/investments/summary
 *
 * Obtiene un resumen de inversiones desde Binance Futures API
 * Este endpoint actúa como proxy seguro para proteger las API keys
 *
 * Headers requeridos:
 * - X-API-Key: SERVER_API_KEY para autenticación
 *
 * Query params opcionales:
 * - public: boolean - Si es true, retorna versión sanitizada sin datos sensibles
 */
import { withSecurity } from '../_middlewares/serverless-security';
import { withErrorHandling, ApiError } from '../_middlewares/error-handler';
import { getInvestmentSummary, getPublicInvestmentSummary } from '../_services/binance-service';
const CACHE_DURATION = 60 * 1000; // 1 minuto para datos financieros
let summaryCache = null;
let publicSummaryCache = null;
// ============================================================================
// RATE LIMITING
// ============================================================================
const requestLog = new Map();
const RATE_LIMIT_REQUESTS = 10; // Más restrictivo para API de terceros
const RATE_LIMIT_WINDOW = 60 * 1000;
function isRateLimited(ip) {
    const now = Date.now();
    const clientRequests = requestLog.get(ip) || [];
    const recentRequests = clientRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (recentRequests.length >= RATE_LIMIT_REQUESTS) {
        return true;
    }
    recentRequests.push(now);
    requestLog.set(ip, recentRequests);
    return false;
}
// ============================================================================
// CREDENTIALS HELPER
// ============================================================================
function getBinanceCredentials() {
    const apiKey = process.env.BINANCE_API_KEY;
    const secretKey = process.env.BINANCE_SECRET_KEY;
    if (!apiKey || !secretKey) {
        throw new ApiError('Binance credentials not configured', 500, 'Configuration Error');
    }
    return { apiKey, secretKey };
}
// ============================================================================
// HANDLER
// ============================================================================
async function handler(req, res) {
    // Solo GET permitido
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    // Rate limiting
    if (isRateLimited(clientIp)) {
        res.status(429).json({
            error: 'Rate limited',
            message: 'Too many requests. Please try again later.'
        });
        return;
    }
    // Determinar si es request público o privado
    const isPublic = req.query.public === 'true' || req.query.public === '1';
    // Para requests privados, verificar autenticación
    if (!isPublic) {
        const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.toString().replace('Bearer ', '');
        const serverApiKey = process.env.SERVER_API_KEY;
        if (!apiKey || apiKey !== serverApiKey) {
            // Si no hay auth, forzar modo público
            res.redirect(307, '/api/investments/summary?public=true');
            return;
        }
    }
    try {
        const credentials = getBinanceCredentials();
        // Verificar cache primero
        const cache = isPublic ? publicSummaryCache : summaryCache;
        if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('Cache-Control', 'public, max-age=60');
            res.status(200).json({
                success: true,
                cached: true,
                data: cache.data
            });
            return;
        }
        // Obtener datos frescos de Binance
        const data = isPublic
            ? await getPublicInvestmentSummary(credentials)
            : await getInvestmentSummary(credentials);
        // Actualizar cache
        if (isPublic) {
            publicSummaryCache = { data, timestamp: Date.now() };
        }
        else {
            summaryCache = { data, timestamp: Date.now() };
        }
        // Headers de respuesta
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json({
            success: true,
            cached: false,
            data
        });
        return;
    }
    catch (error) {
        console.error('[Investments API] Error:', error);
        // Si hay cache antiguo, usarlo como fallback
        const cache = isPublic ? publicSummaryCache : summaryCache;
        if (cache) {
            res.setHeader('X-Cache', 'STALE');
            res.status(200).json({
                success: true,
                cached: true,
                stale: true,
                data: cache.data,
                warning: 'Using cached data due to API error'
            });
            return;
        }
        throw error;
    }
}
// ============================================================================
// EXPORT WITH MIDDLEWARE
// ============================================================================
const wrappedHandler = withErrorHandling(handler);
export default withSecurity(async (req, res) => {
    await wrappedHandler(req, res);
    return;
});
