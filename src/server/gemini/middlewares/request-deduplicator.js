/**
 * 🔄 Request Deduplicator Middleware — Local Dev Server
 * ======================================================
 * Prevents duplicate processing of identical in-flight requests within a 5-second window.
 * Uses SWR (stale-while-revalidate) pattern with an in-memory Map.
 *
 * Mirrors production logic from api/_middlewares/request-deduplicator.ts
 * but uses in-memory Map instead of Vercel KV.
 *
 * @module request-deduplicator
 */

const DEDUP_WINDOW = 5000; // 5 seconds

/**
 * Simple non-crypto hash for deduplication keys.
 * Sufficient for identifying duplicate in-flight requests locally.
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // Force unsigned 32-bit
  }
  return hash.toString(36);
}

function buildRequestKey(req) {
  const method = req.method || 'GET';
  const url = req.originalUrl || req.url || '';
  const wallet = req.headers['x-wallet-address'] || '';
  const bodyStr = req.body ? JSON.stringify(req.body) : '';
  return `dedup:${method}:${hashString(url + wallet + bodyStr)}`;
}

// pending: Map<key, { resolve: [], timestamp: number, result: unknown | null }>
const pending = new Map();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of pending) {
    if (now - entry.timestamp > DEDUP_WINDOW) {
      pending.delete(key);
    }
  }
}

// Run cleanup every 30 seconds
setInterval(cleanup, 30_000);

/**
 * Express middleware.
 * For POST requests: deduplicates identical in-flight payloads within 5 seconds.
 * Skips deduplication for GET, streaming responses, and non-matching methods.
 */
const requestDeduplicator = (req, res, next) => {
  // Only deduplicate POST (chat stream, etc.)
  if (req.method !== 'POST') return next();

  const key = buildRequestKey(req);

  cleanup();

  const existing = pending.get(key);
  if (existing && Date.now() - existing.timestamp < DEDUP_WINDOW) {
    console.log(`[RequestDedup] Duplicate detected (key=${key.slice(0, 20)}...) — waiting for original`);

    // Wait for the original request to complete, then return same result
    existing.subscribers.push((data) => {
      if (data?._streamingResponse) {
        // Can't replay a streaming response — just let it proceed
        return next();
      }
      try {
        res.status(data?.status || 200).json(data?.body || { error: 'Deduplicated response' });
      } catch {
        next();
      }
    });
    return;
  }

  // Register this request as in-flight
  const entry = {
    timestamp: Date.now(),
    subscribers: [],
    result: null,
  };
  pending.set(key, entry);

  // Intercept the response to replay to subscribers
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Notify subscribers with the result
    for (const subscriber of entry.subscribers) {
      try { subscriber({ status: res.statusCode, body }); } catch { /* ignore */ }
    }
    pending.delete(key);
    return originalJson(body);
  };

  // On stream/write, clean up silently (streaming can't be replayed)
  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    for (const subscriber of entry.subscribers) {
      try { subscriber({ _streamingResponse: true }); } catch { /* ignore */ }
    }
    pending.delete(key);
    return originalEnd(...args);
  };

  next();
};

export default requestDeduplicator;
