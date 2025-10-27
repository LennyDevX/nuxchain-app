# NFT API Integration Guide - IPFS + Pinata + Authentication

## 📋 Overview

El endpoint `/api/nfts` ha sido creado para manejar la obtención de NFTs con:
- ✅ Autenticación API Key (opcional en desarrollo, requerida en producción)
- ✅ Cursor-based pagination (para eficiencia en datasets grandes)
- ✅ Compatible con Vercel serverless y servidor local Express
- ✅ CORS habilitado
- ✅ Manejo de errores robusto

## 🔐 Authentication

### Configuración de API Key

El endpoint admite autenticación mediante:

1. **Header HTTP:**
```bash
X-API-Key: your-secret-api-key-here
```

2. **Query Parameter:**
```bash
?apiKey=your-secret-api-key-here
```

### Variables de Entorno Requeridas

**.env.local** (Frontend - Desarrollo):
```env
VITE_API_KEY=your-development-api-key
```

**.env** (Backend - Servidor Express):
```env
SERVER_API_KEY=your-secret-api-key-here
NODE_ENV=production
```

### Comportamiento por Entorno

```typescript
// Development (NODE_ENV=development)
- API Key: OPCIONAL
- Permite requests sin autenticación
- Más permisivo para testing

// Production (NODE_ENV=production)  
- API Key: REQUERIDA
- Valida X-API-Key header o apiKey query param
- Devuelve 401 si falta, 403 si es inválida
```

## 📡 Endpoint Specification

### GET /api/nfts

**Request:**
```
GET /api/nfts?limit=24&cursor=abc123
Headers: {
  "X-API-Key": "your-api-key",  // Optional in dev, required in prod
  "Content-Type": "application/json"
}
```

**Query Parameters:**
| Param  | Type   | Default | Description                    |
|--------|--------|---------|--------------------------------|
| limit  | number | 24      | Items per page (max 100)       |
| cursor | string | null    | Pagination cursor from prev response |

**Response (200 OK):**
```json
{
  "items": [
    {
      "tokenId": "1",
      "uniqueId": "nft-1",
      "name": "NFT #1",
      "description": "Description",
      "image": "https://...",
      "attributes": [
        { "trait_type": "category", "value": "art" }
      ],
      "owner": "0x...",
      "creator": "0x...",
      "price": "1000000000000000000",
      "isForSale": true,
      "likes": "42",
      "category": "art",
      "contract": "0x...",
      "tokenURI": "ipfs://..."
    }
    // ... more NFTs
  ],
  "nextCursor": "xyz789",
  "hasMore": true,
  "total": 150
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "API key required in production..."
}

// 403 Forbidden
{
  "error": "Forbidden",
  "message": "Invalid API key"
}

// 405 Method Not Allowed
{
  "error": "Method not allowed"
}

// 500 Internal Server Error
{
  "error": "Failed to fetch NFTs",
  "message": "Error details..."
}
```

## 🖼️ IPFS + Pinata Integration

### Frontend Upload (Tokenization Page)

El cliente sube archivos a Pinata directamente desde el navegador:

```typescript
// src/utils/ipfs/ipfsUtils.ts

// Upload image a IPFS via Pinata
const imageHash = await uploadFileToIPFS(imageFile);
// Returns: https://gateway.pinata.cloud/ipfs/QmHash...

// Upload metadata a IPFS via Pinata  
const metadataHash = await uploadJsonToIPFS(nftMetadata);
// Returns: https://gateway.pinata.cloud/ipfs/QmHash...
```

### Backend NFT Fetch

El servidor obtiene NFTs (actualmente mock, en producción vendría de blockchain):

```typescript
// /api/nfts endpoint
- Lee desde smart contract o database
- Construye URLs de IPFS con Pinata gateway
- Retorna metadata completo en respuesta
```

### Gateway Fallback System

Si Pinata falla, el cliente intenta múltiples gateways:

```typescript
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs',              // ✅ Protocol Labs - always works
  'https://dweb.link/ipfs',            // ✅ Alternative gateway
  'https://gateway.pinata.cloud/ipfs', // ✅ Pinata (has rate limits)
];
```

### Configuración Requerida

**VITE variables (.env.local):**
```env
VITE_PINATA_JWT=your_pinata_jwt_token_here
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

**Cómo obtener Pinata JWT:**
1. Ir a https://app.pinata.cloud/
2. Sign in / Create account
3. API Keys → New Key
4. Enable: `pinFileToIPFS` + `pinJSONToIPFS`
5. Copy JWT y agregar a .env.local

## 🚀 Implementation Stack

### Frontend (React + React Query)

```typescript
// src/hooks/nfts/useInfiniteNFTs.ts
- useInfiniteQuery hook para cursor pagination
- Fetch con API Key header
- Automatic prefetch on scroll
- Cache management (5 min stale time)

// src/components/nfts/InfiniteScrollNFTGrid.tsx  
- Renderiza grid de NFTs
- Infinite scroll trigger
- Progress bar (totalCount protection)
- Loading/error states

// src/pages/NFTs.tsx
- Página simplificada
- Solo UI, sin lógica de estado
```

### Backend (Vercel + Express)

```typescript
// api/nfts/index.ts (Vercel serverless)
- GET /api/nfts handler
- CORS configured
- Authentication check
- Cursor-based pagination logic
- TODO: Integrate with blockchain/database

// local server (Express)
- Same endpoint, different deployment
- Security middleware integration
- Rate limiting
```

## 🔄 Data Flow

```
┌─────────────────────┐
│   NFTs Page (React) │
│  useInfiniteNFTs()  │
└──────────┬──────────┘
           │
           │ fetch(/api/nfts?limit=24&cursor=...)
           │ X-API-Key: header/query
           │
    ┌──────▼──────────┐
    │  /api/nfts      │
    │  endpoint       │
    └──────┬──────────┘
           │
      ┌────▼────────────────────┐
      │ 1. Validate API Key    │
      │ 2. Parse query params  │
      │ 3. Decode cursor       │
      │ 4. Generate mock NFTs  │ ← TODO: blockchain/db
      │ 5. Encode next cursor  │
      │ 6. Return JSON         │
      └────┬───────────────────┘
           │
      ┌────▼──────────────────────┐
      │ {items, nextCursor, ...}  │
      │ ← Cache with React Query   │
      └────┬──────────────────────┘
           │
      ┌────▼────────────────────┐
      │ Display NFT Grid        │
      │ Show progress bar       │
      │ Enable infinite scroll  │
      └─────────────────────────┘
```

## 📦 Production Deployment Checklist

### Before Deploying:

- [ ] **Vercel Serverless:**
  ```bash
  # Set environment variables in Vercel dashboard
  - SERVER_API_KEY = your-production-key
  - NODE_ENV = production
  ```

- [ ] **Local Server:**
  ```bash
  # .env file
  SERVER_API_KEY=your-production-key
  NODE_ENV=production
  VITE_API_KEY=your-client-key
  ```

- [ ] **Replace Mock Data:**
  ```typescript
  // In /api/nfts/index.ts
  // Replace generateMockNFTs() with actual blockchain queries
  // Query smart contract or database for real NFT data
  ```

- [ ] **Integrate Pinata:**
  ```typescript
  // In /api/nfts/index.ts
  // Use process.env.VITE_PINATA_GATEWAY
  // Return actual IPFS URLs from Pinata
  ```

- [ ] **Test Authentication:**
  ```bash
  # Without API key (should fail in prod)
  curl https://api.nuxchain.com/api/nfts
  
  # With API key (should work)
  curl -H "X-API-Key: your-key" https://api.nuxchain.com/api/nfts
  ```

### After Deploying:

- [ ] Monitor logs for 401/403 errors
- [ ] Test pagination with large datasets
- [ ] Verify Pinata gateway responses
- [ ] Check cache hit rates
- [ ] Monitor API call frequency
- [ ] Set up alerts for errors

## 🐛 Troubleshooting

### Issue: 401 Unauthorized

**Causes:**
- API key not provided (production)
- API key environment variable not set
- Using wrong API key format

**Solution:**
```bash
# Check environment variables
echo $SERVER_API_KEY
echo $VITE_API_KEY

# Test with curl
curl -H "X-API-Key: your-key" http://localhost:5173/api/nfts

# Check if development (should allow without key)
echo $NODE_ENV  # Should be 'development'
```

### Issue: 403 Forbidden

**Causes:**
- API key doesn't match server key
- Typo in API key
- Using different key than configured

**Solution:**
- Verify API key matches exactly (case-sensitive)
- Check for extra spaces in .env file
- Regenerate new key and update both client/server

### Issue: CORS Error

**Causes:**
- Origin not allowed
- Preflight request failing

**Solution:**
```typescript
// CORS headers in /api/nfts:
res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'X-API-Key');

// OPTIONS request handled automatically
```

### Issue: Slow Response

**Causes:**
- Mock data generation taking too long
- No caching (React Query cache empty)
- Network latency

**Solution:**
- Enable React Query caching (automatic)
- Replace mock data with indexed queries
- Use Vercel Edge Functions for lower latency
- Add CDN for IPFS gateway responses

## 📚 Related Documentation

- **REACT_QUERY_NFT_IMPLEMENTATION.md** - Complete React Query setup
- **src/utils/ipfs/ipfsUtils.ts** - IPFS/Pinata upload functions
- **src/security/security-middleware.js** - Authentication patterns
- **api/nfts/index.ts** - Endpoint implementation

## 🔗 References

- [React Query Documentation](https://tanstack.com/query/latest)
- [Pinata API Docs](https://docs.pinata.cloud)
- [IPFS Gateway Reference](https://docs.ipfs.tech/how-to/address-ipfs-on-web/#http-gateways)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
