/**
 * Distributed Rate Limiter using Firestore
 * Solves the problem of in-memory rate limiting in serverless environments
 * Works across multiple Vercel instances
 */
import { getDb } from './firebase-admin.js';
const db = getDb();
const RATE_LIMIT_COLLECTION = 'rateLimits';
/**
 * Get client identifier from request
 */
function getClientIdentifier(req) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const ip = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : '') ||
        (typeof realIp === 'string' ? realIp : '') ||
        'unknown';
    return ip;
}
/**
 * Check rate limit using Firestore (distributed)
 */
export async function checkDistributedRateLimit(req, config = {
    windowMs: 60000, // 1 minute
    maxRequests: 3, // 3 requests per minute per IP
}) {
    const clientId = getClientIdentifier(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;
    try {
        const rateLimitDoc = db.collection(RATE_LIMIT_COLLECTION).doc(clientId);
        // Use transaction to ensure atomicity
        const result = await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(rateLimitDoc);
            let requests = [];
            if (doc.exists) {
                const data = doc.data();
                requests = (data?.requests || []);
            }
            // Filter out old requests outside the time window
            requests = requests.filter(timestamp => timestamp > windowStart);
            // Check if limit exceeded
            if (requests.length >= config.maxRequests) {
                const oldestRequest = requests[0];
                const resetTime = oldestRequest + config.windowMs;
                const retryAfter = Math.ceil((resetTime - now) / 1000);
                return {
                    allowed: false,
                    remaining: 0,
                    resetTime,
                    retryAfter,
                };
            }
            // Add current request
            requests.push(now);
            // Update Firestore
            transaction.set(rateLimitDoc, {
                requests,
                lastUpdated: now,
                expiresAt: now + config.windowMs,
            }, { merge: true });
            const remaining = config.maxRequests - requests.length;
            const resetTime = now + config.windowMs;
            return {
                allowed: true,
                remaining,
                resetTime,
            };
        });
        return result;
    }
    catch (error) {
        console.error('❌ Distributed rate limit error:', error);
        // In case of error, allow the request (fail open)
        // But log for investigation
        return {
            allowed: true,
            remaining: config.maxRequests,
            resetTime: now + config.windowMs,
        };
    }
}
/**
 * Cleanup old rate limit records (run periodically)
 * Optional: Can be called from a scheduled Cloud Function
 */
export async function cleanupExpiredRateLimits() {
    const now = Date.now();
    let deletedCount = 0;
    try {
        const snapshot = await db.collection(RATE_LIMIT_COLLECTION)
            .where('expiresAt', '<', now)
            .limit(500)
            .get();
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            deletedCount++;
        });
        await batch.commit();
        console.log(`🧹 Cleaned up ${deletedCount} expired rate limit records`);
        return deletedCount;
    }
    catch (error) {
        console.error('❌ Error cleaning rate limits:', error);
        return 0;
    }
}
