# 🚀 Binance API Read-Only - Guía de Casos de Uso

Con **solo "Enable Reading"** en tu API de Binance, puedes implementar muchas funcionalidades valiosas para tus usuarios.

## 📊 CASOS DE USO IMPLEMENTADOS

### 1. **Dashboard de Monitoreo de Mercado** 
Muestra tendencias, ganadores y perdedores del mercado.

```typescript
import { useTopGainers, useTopLosers, useHighestVolume } from '@/hooks/useMarketData';

function MarketOverview() {
  const { data: gainers } = useTopGainers(10);
  const { data: losers } = useTopLosers(10);
  const { data: volume } = useHighestVolume(10);
  
  return (
    <div>
      <section>
        <h2>🟢 Top Gainers (24h)</h2>
        {gainers?.map(coin => (
          <div key={coin.symbol}>
            {coin.symbol}: +{coin.changePercent24h.toFixed(2)}%
          </div>
        ))}
      </section>
      
      <section>
        <h2>🔴 Top Losers (24h)</h2>
        {losers?.map(coin => (
          <div key={coin.symbol}>
            {coin.symbol}: {coin.changePercent24h.toFixed(2)}%
          </div>
        ))}
      </section>
      
      <section>
        <h2>📈 Máximo Volumen</h2>
        {volume?.map(coin => (
          <div key={coin.symbol}>
            {coin.symbol}: ${coin.quoteVolume24h.toFixed(0)}
          </div>
        ))}
      </section>
    </div>
  );
}
```

### 2. **Monitor de Precios en Tiempo Real**
Seguimiento del precio actual de cualquier criptomoneda.

```typescript
import { useSymbolPrice } from '@/hooks/useMarketData';

function PriceTracker({ symbol }: { symbol: string }) {
  const { data: price, loading, error } = useSymbolPrice(symbol);
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  const isProfitable = price!.change24h >= 0;
  
  return (
    <div>
      <h2>{symbol}</h2>
      <p>Precio: ${price?.price.toFixed(2)}</p>
      <p className={isProfitable ? 'text-green-500' : 'text-red-500'}>
        24h: {isProfitable ? '+' : ''}{price?.changePercent24h.toFixed(2)}%
      </p>
      <p>Alto: ${price?.high24h.toFixed(2)} | Bajo: ${price?.low24h.toFixed(2)}</p>
      <p>Volumen: ${price?.quoteVolume24h.toFixed(0)}</p>
    </div>
  );
}
```

### 3. **Cartera Pública** (Ya implementada - `/investments`)
Muestra:
- Balance actual
- Posiciones abiertas
- Grid Bots activos
- PnL no realizado
- Rendimiento histórico

### 4. **Tabla Comparativa de Múltiples Activos**
Monitorear varias criptos simultáneamente.

```typescript
import { useMultiplePrices } from '@/hooks/useMarketData';

function PortfolioComparison() {
  const { data: prices } = useMultiplePrices(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'DOGEUSDT']);
  
  return (
    <table>
      <thead>
        <tr>
          <th>Símbolo</th>
          <th>Precio</th>
          <th>24h Change</th>
          <th>Alto/Bajo</th>
          <th>Volumen</th>
        </tr>
      </thead>
      <tbody>
        {prices?.map(coin => (
          <tr key={coin.symbol}>
            <td>{coin.symbol}</td>
            <td>${coin.price.toFixed(2)}</td>
            <td className={coin.changePercent24h >= 0 ? 'text-green-500' : 'text-red-500'}>
              {coin.changePercent24h >= 0 ? '+' : ''}{coin.changePercent24h.toFixed(2)}%
            </td>
            <td>${coin.low24h.toFixed(2)} - ${coin.high24h.toFixed(2)}</td>
            <td>${(coin.quoteVolume24h / 1000000).toFixed(2)}M</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 5. **Notificaciones Inteligentes**
Alertas cuando precios alcanzan ciertos niveles.

```typescript
import { useSymbolPrice } from '@/hooks/useMarketData';
import { useEffect } from 'react';

function PriceAlert({ symbol, targetPrice, type }: { 
  symbol: string; 
  targetPrice: number; 
  type: 'above' | 'below';
}) {
  const { data: price } = useSymbolPrice(symbol);
  
  useEffect(() => {
    if (!price) return;
    
    const triggered = type === 'above' 
      ? price.price >= targetPrice
      : price.price <= targetPrice;
    
    if (triggered) {
      // Enviar notificación
      new Notification(`¡Alerta! ${symbol} alcanzó $${targetPrice}`, {
        body: `Precio actual: $${price.price.toFixed(2)}`
      });
    }
  }, [price, symbol, targetPrice, type]);
  
  return (
    <div>
      Alerta activada cuando {symbol} esté {type === 'above' ? '>' : '<'} ${targetPrice}
      {price && <p>Precio actual: ${price.price.toFixed(2)}</p>}
    </div>
  );
}
```

### 6. **Análisis de Rendimiento**
Comparar cómo se desempeña tu cartera vs el mercado.

```typescript
import { useSymbolPrice, useMultiplePrices } from '@/hooks/useMarketData';

function PerformanceAnalysis() {
  const { data: btc } = useSymbolPrice('BTCUSDT');
  const { data: eth } = useSymbolPrice('ETHUSDT');
  
  // Comparar tu rendimiento vs BTC
  const yourReturn = 25; // Ejemplo: +25%
  const bitcoinReturn = btc?.changePercent24h ?? 0;
  
  const outperformance = yourReturn - bitcoinReturn;
  
  return (
    <div>
      <h3>Tu Rendimiento vs Mercado</h3>
      <p>Tu Retorno: <span className="text-green-500">+{yourReturn.toFixed(2)}%</span></p>
      <p>Bitcoin 24h: {bitcoinReturn >= 0 ? '+' : ''}{bitcoinReturn.toFixed(2)}%</p>
      <p>Outperformance: {outperformance >= 0 ? '+' : ''}{outperformance.toFixed(2)}%</p>
    </div>
  );
}
```

### 7. **Leaderboard Comunitario**
Rankings de traders por rendimiento (si usuarios comparten su API read-only).

```typescript
// Estructura de datos
interface LeaderboardEntry {
  username: string;
  walletAddress: string;
  return30d: number;
  return90d: number;
  portfolioValue: number;
  trades: number;
  winRate: number;
}

function CommunityLeaderboard() {
  // Datos agregados de múltiples usuarios
  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Trader</th>
          <th>30d Return</th>
          <th>90d Return</th>
          <th>Portfolio</th>
          <th>Win Rate</th>
        </tr>
      </thead>
      {/* Mapear leaderboard */}
    </table>
  );
}
```

---

## 📁 ARCHIVOS CREADOS

### Backend
- **`api/_services/binance-market-service.ts`** - Funciones para obtener datos de mercado
- **`api/market/prices.ts`** - Endpoint `/api/market/prices` con múltiples acciones

### Frontend
- **`src/hooks/useMarketData.ts`** - Hooks React para consumir datos de mercado
- **`src/pages/Investments.tsx`** - Página de inversiones (ya existía, mejorada)

---

## 🔌 ENDPOINTS DISPONIBLES

### GET `/api/market/prices`

#### 1. Obtener precio de un símbolo
```bash
GET /api/market/prices?action=price&symbol=BTCUSDT
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "price": 45250.50,
    "change24h": 1250.30,
    "changePercent24h": 2.84,
    "high24h": 46000,
    "low24h": 44000,
    "volume24h": 25000,
    "quoteVolume24h": 1125000000
  }
}
```

#### 2. Obtener precios de múltiples símbolos
```bash
GET /api/market/prices?action=prices&symbols=BTCUSDT,ETHUSDT,BNBUSDT
```

#### 3. Top Gainers
```bash
GET /api/market/prices?action=gainers&limit=10
```

#### 4. Top Losers
```bash
GET /api/market/prices?action=losers&limit=10
```

#### 5. Máximo Volumen
```bash
GET /api/market/prices?action=volume&limit=10
```

---

## 🎯 CASOS DE USO FUTUROS (Sin API read-only)

Si eventualmente activas más permisos, podrías agregar:
- ✅ **Copy Trading** - Copiar órdenes de traders exitosos
- ✅ **Auto Grid Trading** - Ejecutar bots automáticamente
- ✅ **Limit Orders** - Permitir que usuarios coloquen órdenes desde tu app
- ✅ **Rebalancing Automático** - Ajustar carteras automáticamente
- ✅ **Signaling** - Enviar señales de compra/venta

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. **Crear Dashboard de Mercado** - Página con gainers, losers, volumen
2. **Agregar Alertas** - Sistema de notificaciones por precio
3. **Widget de Precio** - Mostrar precios en múltiples lugares
4. **Análisis Comparativo** - Comparar rendimiento del usuario vs mercado
5. **Comunidad Transparente** - Leaderboard de traders con datos públicos

---

## 📝 NOTAS IMPORTANTES

- ✅ **Solo Lectura** - No necesitas permisos de escritura
- ✅ **Datos Públicos** - No requiere autenticación
- ✅ **Actualización en Tiempo Real** - Cache de 30 segundos
- ✅ **Sin Costos** - API gratuita de Binance
- ✅ **Transparencia** - Perfecta para generar confianza en tu comunidad
