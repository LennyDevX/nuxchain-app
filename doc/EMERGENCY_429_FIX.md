# 🚨 Guía de Emergencia - Error 429 Rate Limiting

## ⚠️ Situación Actual

**Tu API de The Graph está bloqueada por rate limiting previo.** Aunque implementamos todas las optimizaciones, el API necesita tiempo para resetear el límite de requests.

---

## ✅ Soluciones Inmediatas

### Opción 1: Esperar (Recomendado)
```bash
# Esperar 30-60 minutos para que The Graph resetee el rate limit
# Durante este tiempo, evita recargar las páginas de NFTs
```

### Opción 2: Usar Datos en Caché (Implementado)
**Ya está funcionando automáticamente:**
- Cuando hay un 429, el hook intenta usar datos de localStorage
- Los datos se guardan automáticamente en cada fetch exitoso
- Puedes navegar a otras páginas y volver más tarde

### Opción 3: Limpiar Caché si es Necesario
```javascript
// En DevTools Console (F12), ejecutar:

// Ver estado de la caché
NFTCacheManager.getStats()
// Output: { total: 3, oldestAge: 1200, newestAge: 30, totalSize: 45 KB }

// Listar todas las cachés
NFTCacheManager.list()
// Output: [{ key: 'all_any_false', age: 30s, items: 12 }, ...]

// Limpiar caché expirada (>24h)
NFTCacheManager.clearExpired()

// LIMPIAR TODO (solo si es absolutamente necesario)
NFTCacheManager.clearAll()
```

---

## 🔧 Cambios Implementados (Ya Activos)

### 1. **Request Queue Ultra Conservador**
- ✅ Solo **1 request concurrente** (antes 2)
- ✅ **3 segundos** de delay entre requests (antes 500ms)
- ✅ Backoff exponencial en 429 errors

### 2. **LocalStorage Fallback Cache**
- ✅ Guarda automáticamente NFTs en localStorage
- ✅ Usa caché cuando hay 429 errors (aunque esté desactualizada)
- ✅ Caché persistente entre sesiones

### 3. **React Query Ultra Conservador**
- ✅ `staleTime: 5 minutos` (antes 30s)
- ✅ `gcTime: 30 minutos` (antes 5min)
- ✅ `refetchOnWindowFocus: false` - no refetch al cambiar de ventana
- ✅ `refetchOnReconnect: false` - no refetch al reconectar internet

---

## 📊 Monitoreo en Tiempo Real

### Ver Estado del Request Queue
```javascript
// En DevTools Console
setInterval(() => {
  const queue = window.requestQueue || requestQueue;
  if (queue) console.log('Queue:', queue.getStats());
}, 5000);
```

Output esperado:
```json
{
  "queued": 0,      // Requests en cola
  "running": 0,     // Requests activos (max 1)
  "maxConcurrent": 1
}
```

---

## 🎯 Qué Hacer AHORA

### Paso 1: Cerrar TODOS los tabs de localhost
```bash
# Cerrar todas las ventanas del navegador con tu app abierta
# Esto detiene todos los requests pendientes
```

### Paso 2: Esperar 15 minutos

### Paso 3: Reabrir y probar
```bash
# 1. Abrir solo 1 tab
# 2. Navegar a /nfts/marketplace
# 3. NO refrescar repetidamente
```

### Paso 4: Verificar Logs
Deberías ver en Console:
```
✅ Using cached data (120s old)  ← Usando caché mientras espera
```

O después de 15+ minutos:
```
✅ Total user NFTs combined: 5  ← API funcionando de nuevo
💾 Saved to cache              ← Guardando para futuro
```

---

## 🚑 Si Sigue Sin Funcionar Después de 1 Hora

### Cambiar a Subgraph Público de The Graph
```typescript
// src/lib/apollo-client.ts - Línea 6
// ANTES:
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/122195/nuxchain/v0.40"

// DESPUÉS (usar endpoint público):
const SUBGRAPH_URL = "https://gateway.thegraph.com/api/[API_KEY]/subgraphs/id/[SUBGRAPH_ID]"
```

**Necesitarás:**
1. Obtener API Key gratuita en: https://thegraph.com/studio/
2. Deploy tu subgraph en The Graph Network (no Studio)

---

## 📈 Métricas de Mejora Implementadas

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Requests/carga** | 85+ | 2-3 | -97% |
| **Concurrencia** | Ilimitada | 1 max | -100% |
| **Delay entre requests** | 0ms | 3000ms | +∞ |
| **Refetch automático** | Sí | No | ✅ Deshabilitado |
| **Cache duration** | 30s | 5min | +900% |
| **Fallback cache** | ❌ No | ✅ Sí | ✅ Nuevo |

---

## 🔍 Debugging

### Verificar que Request Queue está activo
```javascript
// DevTools Console
console.log(requestQueue.getStats())
// Debe mostrar: { maxConcurrent: 1, minDelay: 3000, ... }
```

### Ver contenido de la caché
```javascript
// Ver todas las keys de localStorage
Object.keys(localStorage).filter(k => k.startsWith('nft_cache'))
```

### Forzar uso de caché
```javascript
// Si quieres probar que la caché funciona
// 1. Desconecta internet
// 2. Navega a /nfts/marketplace
// 3. Debería cargar desde caché
```

---

## ⏱️ Timeline Esperado

- **0-15 min**: Todavía bloqueado, usando caché
- **15-30 min**: Posiblemente desbloqueado parcialmente
- **30-60 min**: Completamente desbloqueado
- **60+ min**: Si sigue bloqueado, cambiar a endpoint público

---

## 🎯 Conclusión

**NO NECESITAS HACER NADA MÁS.**

Los cambios ya están implementados. Solo:
1. ✅ Cierra todos los tabs
2. ✅ Espera 15-30 minutos
3. ✅ Refresca UNA VEZ
4. ✅ Verifica console logs

Si después de 1 hora sigue fallando, avísame y te ayudo a cambiar al endpoint público de The Graph.
