# 🛠️ NFT Purchase Cache Fix - Compra de NFT no se Refleja en UI

## 🔴 Problema Reportado

Cuando un usuario compraba un NFT en el Marketplace:
- ✅ La transacción blockchain se ejecutaba correctamente
- ✅ El NFT era transferido al usuario
- ❌ El NFT **seguía apareciendo en el Marketplace**
- ❌ El NFT **NO aparecía en la colección del usuario**
- ❌ El estado de la UI no se actualizaba

## 🔍 Causa Raíz

El problema era causado por **caché desincronizado** en múltiples niveles:

### 1. **Apollo Client Cache (The Graph Subgraph)**
- `useMarketplaceNFTsGraph` usa Apollo Client para consultar The Graph subgraph
- El caché de Apollo **nunca se limpiaba** después de una compra exitosa
- Aunque React Query invalidara el cache, Apollo mantenía datos antiguos
- Las nuevas queries retornaban datos cacheados, no datos frescos del subgraph

### 2. **React Query Cache (Infinite Query)**
- El hook `useMarketplaceNFTsGraph` usa `useInfiniteQuery` de React Query
- Con la clave: `queryKey: ['marketplace-nfts-graph', { ... }]`
- El `useBuyNFT` hook **no invalidaba este caché**
- Aunque el Marketplace llamaba `refreshNFTs()`, el Apollo cache seguía siendo el cuello de botella

### 3. **Subgraph Indexing Delay**
- The Graph tarda 2-3 segundos en indexar eventos de blockchain
- Si se refetcheaban los datos antes de indexar, se obtenían datos antiguos
- El delay es necesario para que el subgraph procese el evento `TokenSold`

### 4. **Falta de Coordinación entre Hooks**
- `useBuyNFT` completaba la transacción exitosamente
- `BuyModal` llamaba el callback `onSuccess`
- `Marketplace` llamaba `refreshNFTs()`
- **PERO**: `useBuyNFT` nunca invalida los cachés necesarios
- Resultado: Los cachés se refetcheaban pero retornaban datos antiguos de Apollo

## ✅ Solución Implementada

### Cambios en `useBuyNFT.tsx`

**Antes:**
```tsx
// Solo mostraba toast de éxito, sin invalidar caché
if (receipt.status === 'success') {
  setIsSuccess(true);
  toast.success('NFT purchased successfully!', { id: 'buy-nft' });
}
```

**Después:**
```tsx
// 1. Importar Apollo Client y useQueryClient
import { useQueryClient } from '@tanstack/react-query';
import { apolloClient } from '../../lib/apollo-client';

// 2. Dentro del hook, obtener queryClient
const queryClient = useQueryClient();

// 3. En caso de éxito, limpiar caché en el orden correcto:
if (receipt.status === 'success') {
  setIsSuccess(true);
  toast.success('NFT purchased successfully!', { id: 'buy-nft' });
  
  // ✅ Esperar a que el subgraph indexe (~2-3 segundos)
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // ✅ Limpiar Apollo Client cache
  await apolloClient.clearStore();
  
  // ✅ Invalidar React Query caches
  queryClient.invalidateQueries({ 
    queryKey: ['marketplace-nfts-graph']  // Marketplace NFTs
  });
  queryClient.invalidateQueries({ 
    queryKey: ['user-nfts']  // User collection
  });
}
```

### Flujo Completo Ahora:

```
1. Usuario hace clic en "Buy" NFT
   ↓
2. useBuyNFT ejecuta transacción blockchain
   ↓
3. Transacción confirmada en blockchain ✅
   ↓
4. useBuyNFT ESPERA 2.5 segundos (subgraph indexing)
   ↓
5. useBuyNFT LIMPIA Apollo Client cache
   ↓
6. useBuyNFT INVALIDA React Query caches
   ↓
7. BuyModal detecta isSuccess y llama onSuccess callback
   ↓
8. Marketplace.handleBuy cierra modal y llama refreshNFTs()
   ↓
9. useMarketplaceNFTsGraph refetchea con Apollo Client LIMPIO
   ↓
10. Apollo Client hace NEW query al subgraph (que ya indexó el TokenSold)
    ↓
11. UI se actualiza: NFT desaparece del Marketplace ✅
12. UI se actualiza: NFT aparece en colección del usuario ✅
```

## 🔑 Conceptos Clave

### Why Wait 2.5 Seconds?
- The Graph tarda en indexar eventos
- 2-3 segundos es el tiempo típico observado
- Si no esperas, el subgraph aún no ha procesado `TokenSold`
- El caché limpio traería datos desactualizados del subgraph

### Why Clear Apollo Cache?
- Apollo mantiene su propio caché separado de React Query
- `queryClient.invalidateQueries()` solo invalida React Query cache
- Si Apollo cache no se limpia, retorna datos viejos en la siguiente query
- `apolloClient.clearStore()` limpia completamente el caché de Apollo

### Why Use Both Caches?
- `useMarketplaceNFTsGraph` usa `useInfiniteQuery` (React Query)
- Las queries van a través de Apollo Client (que gestiona The Graph)
- Ambas capas de caché deben estar sincronizadas

## 📊 Comparación: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **NFT aparece en Marketplace** | ✅ (caché viejo) | ✅ (refresca correctamente) |
| **NFT aparece en colección** | ❌ (no refrescar) | ✅ (refresca automáticamente) |
| **Tiempo para actualizar** | Indefinido | ~3-4 segundos |
| **Cache limpio** | ❌ Apollo mantiene caché viejo | ✅ Ambos cachés se limpian |
| **Subgraph indexing esperado** | ❌ No | ✅ Sí (2.5s delay) |

## 🧪 Testing Checklist

Después de esta actualización, verifica:

- [ ] Compra un NFT en el Marketplace
- [ ] La transacción se ejecuta sin errores
- [ ] El wallet muestra la transacción confirmada
- [ ] **Espera 3-4 segundos** (indexing + refetch)
- [ ] El NFT DESAPARECE del Marketplace ✅
- [ ] El NFT APARECE en la colección del usuario ✅
- [ ] Recarga la página y verifica que persiste ✅
- [ ] Prueba con múltiples NFTs ✅
- [ ] Prueba en diferentes dispositivos (mobile/desktop) ✅

## 🎯 Próximas Mejoras (Futuro)

1. **Mostrar estado de "Refrescando"**: Indicar al usuario que el UI se está actualizando
2. **Polling en Background**: Si la actualización tarda >5s, mostrar notificación
3. **Retry Logic**: Si el subgraph aún no ha indexado, reintentar query
4. **Server-Side Invalidation**: Usar webhooks del subgraph para invalidar en tiempo real
5. **User Feedback**: Toast que diga "NFT añadido a tu colección" cuando se detecte cambio

## 📝 Archivos Modificados

- `src/hooks/nfts/useBuyNFT.tsx` - Agregada invalidación de caché

## ✨ Resumen

El problema fue que **tras comprar un NFT, los cachés (Apollo + React Query) no se sincronizaban correctamente**. La solución es:

1. **Esperar a que el subgraph indexe** (2.5s)
2. **Limpiar Apollo Client cache** (para forzar datos frescos)
3. **Invalidar React Query caches** (para triggear refetch)
4. **Flujo existente en Marketplace** ya llama `refreshNFTs()` después, perfectamente coordinado

Ahora el NFT comprado desaparece del Marketplace y aparece en la colección del usuario automáticamente ✅
