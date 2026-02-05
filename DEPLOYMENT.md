# 🚀 Deployment Guide - NuxChain App (Optimized)

## Pre-requisitos

- [x] Upstash Redis KV creado en Vercel
- [x] Variables de entorno KV copiadas en `.env`
- [x] Build exitoso (`npm run build`)
- [x] Dependencias instaladas (`npm install`)

---

## 📋 Checklist de Deployment

### **Paso 1: Verificar Variables de Entorno en Vercel**

Ve a **Vercel Dashboard** → **Tu Proyecto** → **Settings** → **Environment Variables**

Verifica que existan (auto-inyectadas por KV):
```
✅ KV_URL
✅ KV_REST_API_URL
✅ KV_REST_API_TOKEN
✅ KV_REST_API_READ_ONLY_TOKEN
```

**Opcional**: Agregar para proteger endpoint de inicialización:
```
ADMIN_SECRET_KEY=tu_clave_secreta_aqui
```

---

### **Paso 2: Build Local (Verificación Final)**

```powershell
# Limpiar cache
Remove-Item -Recurse -Force dist, node_modules/.vite

# Build
npm run build
```

**Resultado esperado**: 
```
✓ build complete in XXs
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.js       XXX.XX kB
```

---

### **Paso 3: Deploy a Vercel**

```powershell
# Deploy a producción
vercel --prod
```

**Output esperado**:
```
✅ Deployed to production. https://nuxchain.com
```

---

### **Paso 4: Inicializar Embeddings Cache (Opcional pero Recomendado)**

**Opción A: Con ADMIN_SECRET_KEY configurado**
```powershell
curl -H "Authorization: Bearer tu_clave_secreta_aqui" https://nuxchain.com/api/init-cache/embeddings
```

**Opción B: Sin protección (solo si no configuraste ADMIN_SECRET_KEY)**
```powershell
curl https://nuxchain.com/api/init-cache/embeddings
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Embeddings cache initialized successfully",
  "duration": "25.3s",
  "timestamp": "2026-02-05T12:34:56.789Z"
}
```

> ⚠️ **Importante**: Ejecutar solo UNA VEZ después del primer deploy. Esto cachea los embeddings del knowledge base en KV.

---

### **Paso 5: Verificar Optimizaciones**

#### **A. Verificar Cache de Precios POL**

```powershell
# Primera request (MISS)
curl https://nuxchain.com/api/price/pol

# Segunda request inmediata (HIT)
curl https://nuxchain.com/api/price/pol
```

**Headers esperados**:
```
X-Cache: HIT
Cache-Control: public, max-age=60
```

#### **B. Verificar Rate Limiting**

```powershell
# Hacer 35 requests rápidas (debería bloquear después de 30)
for ($i=1; $i -le 35; $i++) { 
  curl https://nuxchain.com/api/price/pol
  Write-Host "Request $i"
}
```

**Respuesta esperada en request 31+**:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again after...",
  "retryAfter": 45
}
```

**Headers de rate limit**:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1675451234000
```

#### **C. Verificar Web Scraper con Fallback**

```powershell
# Test con URL lenta (debería usar fallback OpenGraph)
curl -X POST https://nuxchain.com/api/chat/stream `
  -H "Content-Type: application/json" `
  -d '{"message":"Explain this URL: https://very-slow-site.com"}'
```

**Metadata esperada**:
```json
{
  "metadata": {
    "fastExtraction": true,
    "ogImage": "...",
    ...
  }
}
```

---

### **Paso 6: Monitorear Métricas en Vercel**

1. **Ir a Vercel Dashboard** → **Tu Proyecto** → **Analytics** → **Usage**

2. **Monitorear por 24-48 horas**:
   - **Fast Data Transfer**: Debería reducirse ~50%
   - **Edge Requests**: Debería reducirse ~30%
   - **Function Invocations**: Debería reducirse ~40%

3. **Ver Top Paths**:
   ```
   Usage → Top Paths → Filter by: Bandwidth
   ```
   - `/api/price/pol` debería tener más hits de cache
   - `/api/chat/stream` debería tener menos invocations por dedup

4. **Monitoring Tab** (Query avanzado):
   ```sql
   SELECT 
     request_path,
     COUNT(*) as requests,
     AVG(request_duration) as avg_duration
   FROM requests
   WHERE request_path LIKE '/api/%'
   GROUP BY request_path
   ORDER BY requests DESC
   ```

---

## 📊 Métricas Esperadas (Comparación)

### **Antes de Optimizaciones**
| Métrica | Valor |
|---------|-------|
| Fast Data Transfer | 267 GB/mes |
| Edge Requests | ~500K/mes |
| Function Duration (avg) | 850ms |
| Cache Hit Rate | ~5% |

### **Después de Optimizaciones** (Objetivo)
| Métrica | Valor | Mejora |
|---------|-------|--------|
| Fast Data Transfer | ~130 GB/mes | **-51%** ✅ |
| Edge Requests | ~350K/mes | **-30%** ✅ |
| Function Duration (avg) | ~400ms | **-53%** ✅ |
| Cache Hit Rate | ~60% | **+1100%** ✅ |

---

## 🔍 Troubleshooting

### **Error: "kv is not defined"**
**Causa**: Variables KV no configuradas

**Solución**:
1. Vercel Dashboard → Storage → KV → Copy env vars
2. Agregar a Project Settings → Environment Variables
3. Redeploy: `vercel --prod`

---

### **Error: "Rate limit not working"**
**Causa**: Middleware no se ejecuta en Vercel Functions (solo en Edge)

**Solución**: 
- El rate limiting ahora está integrado en cada endpoint usando KV
- Ver `api/price/pol.ts` línea 35-45 como ejemplo

---

### **Embeddings cache no inicializa**
**Causa**: Gemini API key no válida o rate limit

**Solución**:
```powershell
# Verificar API key
vercel env pull .env.local
grep GEMINI_API_KEY .env.local

# Reintentar con delay entre batches (ya implementado automáticamente)
curl https://nuxchain.com/api/init-cache/embeddings
```

---

### **Cache no se invalida**
**Causa**: TTL muy alto o KV no conectado

**Solución**:
```powershell
# Ver keys en KV
vercel kv list

# Borrar cache manualmente
vercel kv del "prices:pol-price"

# Verificar conexión
vercel kv get "prices:pol-price"
```

---

## 🔐 Seguridad Post-Deployment

### **1. Proteger endpoint de inicialización**

Agregar en Vercel Environment Variables:
```
ADMIN_SECRET_KEY=clave_super_secreta_aleatoria_12345
```

### **2. Configurar CORS específico (Opcional)**

En `vercel.json`, cambiar:
```json
"Access-Control-Allow-Origin": "*"
```
Por:
```json
"Access-Control-Allow-Origin": "https://nuxchain.com"
```

### **3. Habilitar Vercel Firewall (Pro plan)**

Vercel Dashboard → Security → Firewall:
- ✅ Enable DDoS protection
- ✅ Block known malicious IPs
- ✅ Rate limiting per IP (adicional al implementado)

---

## 📈 Optimizaciones Futuras (Opcionales)

### **1. Batch Solana RPC Calls** (1h implementación)
```typescript
// api/airdrop/validate-and-register.ts
const wallets = [...]; // Array de wallets
const batchSize = 10;

for (let i = 0; i < wallets.length; i += batchSize) {
  const batch = wallets.slice(i, i + batchSize);
  await Promise.all(batch.map(w => validateWallet(w)));
}
```
**Ahorro estimado**: -80% tiempo validación airdrop

### **2. Migrate Gemini to Viem Direct Calls** (5h implementación)
```typescript
// En lugar de: Gemini API → "Get POL price"
// Usar: Direct contract read
const price = await publicClient.readContract({
  address: POL_PRICE_ORACLE,
  abi: priceOracleABI,
  functionName: 'getLatestPrice'
});
```
**Ahorro estimado**: -70% Gemini token usage en blockchain queries

---

## ✅ Deployment Checklist Final

- [ ] Variables KV configuradas en Vercel
- [ ] Build local exitoso
- [ ] Deploy a producción (`vercel --prod`)
- [ ] Embeddings cache inicializado (opcional)
- [ ] Cache de precios verificado (HIT en segunda request)
- [ ] Rate limiting verificado (429 después de 30 req)
- [ ] Monitoreo activado en Vercel Dashboard
- [ ] Métricas baseline capturadas (Fast Data Transfer, Edge Requests)
- [ ] Programar revisión en 48h para comparar métricas

---

## 📞 Soporte

- **Documentación completa**: Ver [OPTIMIZATION_GUIDE.md](OPTIMIZATION_GUIDE.md)
- **Vercel Logs**: `vercel logs --follow`
- **KV Dashboard**: Vercel Dashboard → Storage → KV
- **Analytics**: Vercel Dashboard → Analytics → Usage

---

**Última actualización**: Febrero 5, 2026  
**Versión**: 1.0 (Post-Optimizaciones)
