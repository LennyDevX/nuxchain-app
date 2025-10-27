# 🧪 NFT API - Local Testing Guide

## Quick Start

### 1. Set Environment Variables

**Frontend (.env.local):**
```env
VITE_API_KEY=dev-api-key-123
VITE_PINATA_JWT=your_pinata_jwt_here
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

**Backend (.env - if using local Express server):**
```env
SERVER_API_KEY=dev-api-key-123
NODE_ENV=development
PORT=5000
```

### 2. Start the Application

```bash
# Terminal 1: Frontend development server
npm run dev

# Terminal 2: Backend server (if using local Express, not needed for Vercel)
npm run server
# OR for local development on Vercel functions:
vercel dev
```

## Testing the Endpoint

### Option A: Browser Console

```javascript
// In browser console on NFTs page
fetch('/api/nfts?limit=24')
  .then(res => res.json())
  .then(data => console.log(data))
```

### Option B: cURL Commands

```bash
# Development (no auth required)
curl "http://localhost:5173/api/nfts?limit=24"

# With API key (testing production behavior)
curl -H "X-API-Key: dev-api-key-123" "http://localhost:5173/api/nfts?limit=24"

# With cursor pagination
curl "http://localhost:5173/api/nfts?limit=24&cursor=MjQ="

# Production (with API key query param)
curl "http://localhost:5173/api/nfts?limit=24&apiKey=dev-api-key-123"
```

### Option C: JavaScript/Node

```javascript
// In Node.js or browser
const apiKey = 'dev-api-key-123';

// Test basic request
const res = await fetch('/api/nfts?limit=24', {
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  }
});

const data = await res.json();
console.log('NFTs fetched:', data.items.length);
console.log('Has more:', data.hasMore);
console.log('Next cursor:', data.nextCursor);
```

## Testing React Query Integration

### 1. Open NFTs Page

Navigate to `http://localhost:5173/nfts` in your browser.

### 2. Check Console

You should see:
- ✅ GET request to `/api/nfts?limit=24`
- ✅ Response with 24 mock NFTs
- ✅ Progress bar showing "0 of 150 NFTs"
- ✅ NFT cards rendering

### 3. Test Infinite Scroll

```
1. Scroll down the page
2. When ~200px from bottom, next page prefetches automatically
3. Scroll more to trigger load
4. Progress bar updates
5. New NFTs appear
```

### 4. Test Error Scenarios

```javascript
// Test with invalid API key (if in production mode)
fetch('/api/nfts', {
  headers: { 'X-API-Key': 'wrong-key' }
})
// Should return 403 Forbidden

// Test without API key (in production)
fetch('/api/nfts')
// Should return 401 Unauthorized (in production)

// Test with invalid method
fetch('/api/nfts', { method: 'POST' })
// Should return 405 Method Not Allowed
```

## Monitoring

### Browser DevTools

**Network Tab:**
- Filter by `api/nfts`
- Check request headers (X-API-Key)
- Verify response structure
- Monitor cache behavior

**Console Tab:**
- React Query debug logs
- Prefetch triggers
- Error messages
- Image preload status

**React DevTools (if installed):**
- Check component tree
- Monitor InfiniteScrollNFTGrid state
- Check re-render counts

### React Query DevTools

If installed, visit `http://localhost:5173/#__react-query` to see:
- Query status (pending, success, error)
- Cache state
- Stale time remaining
- GC time remaining
- Query history

## Common Test Scenarios

### Scenario 1: First Page Load

```
1. Navigate to /nfts
2. Component mounts
3. useInfiniteNFTs hook fires
4. Fetch GET /api/nfts?limit=24
5. State updates with 24 NFTs
6. IntersectionObserver attached to load-more element
7. Progress: "0 of 150 NFTs (0%)"
```

### Scenario 2: Scroll and Prefetch

```
1. User scrolls down
2. Observer detects 200px margin
3. Prefetch triggered (no visible change)
4. Next page fetched in background
5. Cache updated
6. User continues scrolling
7. Load more triggers
8. New page rendered immediately (from cache)
```

### Scenario 3: Pagination Limit

```
1. Total: 150 NFTs
2. Page size: 24
3. Page 1: items 0-23, cursor: MjQ=
4. Page 2: items 24-47, cursor: NDg=
5. Page 3: items 48-71, cursor: NzI=
6. Page 4: items 72-95, cursor: OTY=
7. Page 5: items 96-119, cursor: MTIw
8. Page 6: items 120-143, cursor: MTQ0
9. Page 7: items 144-149, nextCursor: null, hasMore: false
10. "You've reached the end" message shows
```

### Scenario 4: Network Error Recovery

```
1. Network error occurs during fetch
2. React Query retries (2 attempts)
3. If still fails after retries:
   - Error message shown
   - "Try Again" button appears
   - onClick calls location.reload()
   - Full page resets and retries
```

## Performance Testing

### Measure Load Time

```javascript
// In console
performance.mark('nft-fetch-start');
fetch('/api/nfts?limit=24').then(() => {
  performance.mark('nft-fetch-end');
  performance.measure('NFT Fetch', 'nft-fetch-start', 'nft-fetch-end');
  const measure = performance.getEntriesByName('NFT Fetch')[0];
  console.log(`Time: ${measure.duration}ms`);
});
```

### Cache Hit Rate

```javascript
// In React Query DevTools or console
// Check "Cache miss" vs "Cache hit" patterns
// Should see improvement after first fetch
```

### Prefetch Effectiveness

```
Expected behavior:
- First page: 2-3s (network delay)
- Scroll past margin: prefetch starts
- User continues scrolling: loads from cache (instant)
- Next page: ~500ms (cache + rendering)
```

## Debugging Tips

### 1. Enable Query Debug Logging

```typescript
// In main.tsx or entry point
if (process.env.NODE_ENV === 'development') {
  // Enable React Query logs
  console.log('React Query initialized');
}
```

### 2. Check API Key

```bash
# Verify .env.local
cat .env.local | grep VITE_API_KEY

# Verify backend .env
cat .env | grep SERVER_API_KEY
```

### 3. Test Cursor Encoding

```javascript
// Encoding
const cursor = Buffer.from('24').toString('base64');
console.log(cursor); // "MjQ="

// Decoding
const offset = parseInt(Buffer.from('MjQ=', 'base64').toString(), 10);
console.log(offset); // 24
```

### 4. Monitor Fetch Calls

```javascript
// Add request interceptor
const originalFetch = window.fetch;
window.fetch = (...args) => {
  console.log('FETCH:', args[0], args[1]?.headers);
  return originalFetch(...args);
};
```

## Verification Checklist

After testing, verify:

- [ ] First page loads correctly with 24 NFTs
- [ ] Progress bar shows correct percentage
- [ ] Scroll triggers prefetch (check Network tab)
- [ ] Load more renders new NFTs
- [ ] API key sent in headers or query
- [ ] Cache working (check React Query DevTools)
- [ ] End of collection shows "You've reached the end"
- [ ] No console errors
- [ ] Mobile layout responsive (test with DevTools)
- [ ] Image preloading visible (check Network tab)
- [ ] Prefetch debounce prevents hammering API

## Production Testing

Before deploying to Vercel:

1. **Set production .env:**
   ```env
   NODE_ENV=production
   SERVER_API_KEY=your-production-key
   ```

2. **Test authentication rejection:**
   ```bash
   curl "http://localhost:5173/api/nfts"
   # Should return 401 Unauthorized
   ```

3. **Test with valid key:**
   ```bash
   curl -H "X-API-Key: your-production-key" "http://localhost:5173/api/nfts"
   # Should return 200 OK with NFTs
   ```

4. **Test edge cases:**
   - Empty limit: `?limit=0` → should default to 24
   - Large limit: `?limit=1000` → should cap at 100
   - Invalid cursor: `?cursor=invalid` → should default to 0
   - Missing required fields → should handle gracefully

## Cleanup

After testing:

```bash
# Remove test environment variables
unset VITE_API_KEY
unset SERVER_API_KEY

# Clear React Query cache
# In browser console:
localStorage.clear()

# Restart development server
# Ctrl+C to stop
# npm run dev to restart
```
