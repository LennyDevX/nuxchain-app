# 🚀 Configuración de Servidores de Desarrollo

## 📡 Puertos y Servicios

El proyecto utiliza **3 servidores** en desarrollo local:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **Frontend (Vite)** | `5173` | Aplicación React + UI |
| **Gemini API** | `3002` | Servidor de chat con IA (Gemini) + WebSockets |
| **Binance Market API** | `3003` | Endpoints de datos de mercado Binance |

## 🔧 Comandos Disponibles

### Desarrollo Completo (Recomendado)
```bash
npm run dev:full
```
Inicia todos los servidores simultáneamente:
- ✅ Compila TypeScript de la API Binance
- ✅ Inicia Vite (Frontend)
- ✅ Inicia servidor Gemini (Chat IA)
- ✅ Inicia servidor Binance (Market Data)

### Comandos Individuales

```bash
# Solo frontend
npm run dev

# Solo servidor Gemini (Chat IA)
npm run dev:gemini

# Solo servidor Binance (Market Data)
npm run dev:binance

# Compilar API Binance
npm run build:api-local
```

## 🌐 URLs de Desarrollo

### Frontend
- **URL**: http://localhost:5173
- **Páginas principales**:
  - `/` - Home
  - `/market` - Market Overview (Top Gainers/Losers)
  - `/investments` - Investment Transparency
  - `/chat` - AI Chat Assistant

### Gemini API Server
- **Base URL**: http://localhost:3002
- **Endpoints**:
  - `POST /server/api/v1/chat/stream` - Chat streaming
  - `POST /server/api/v1/context/analyze` - URL analysis
  - `WS ws://localhost:3002/ws/streaming` - WebSocket

### Binance Market API
- **Base URL**: http://localhost:3003
- **Endpoints**:
  - `GET /api/market/prices?action=gainers&limit=10`
  - `GET /api/market/prices?action=losers&limit=10`
  - `GET /api/market/prices?action=volume&limit=10`
  - `GET /api/investments/summary?public=true`

## 📋 Variables de Entorno Necesarias

Asegúrate de tener estas variables en tu `.env`:

```env
# Gemini (Chat IA)
GEMINI_API_KEY=tu_gemini_api_key

# Binance (Market Data)
BINANCE_API_KEY=tu_binance_api_key
BINANCE_SECRET_KEY=tu_binance_secret_key

# URLs de desarrollo
VITE_API_BASE_URL=http://localhost:3002
VITE_SERVER_URL=http://localhost:3002/server
VITE_BINANCE_API_URL=http://localhost:3003

# Puertos
PORT=3002
```

## 🔥 Solución de Problemas

### Error: "Port 3002 already in use"
```bash
# En Windows PowerShell
Get-Process -Name node | Stop-Process -Force
```

### Error: "Cannot find module"
```bash
npm install
npm run build:api-local
```

### Error: "GEMINI_API_KEY not found"
Verifica que tienes el archivo `.env` en la raíz del proyecto con todas las variables necesarias.

### Error 401 en `/api/market/prices`
1. Verifica que el servidor Binance esté corriendo en puerto 3003
2. Asegúrate de haber compilado: `npm run build:api-local`
3. Revisa que `VITE_BINANCE_API_URL` esté configurado correctamente

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│         Frontend (Vite :5173)           │
│  React + TypeScript + Tailwind + Web3   │
└──────────┬─────────────┬────────────────┘
           │             │
           │             │
    ┌──────▼──────┐  ┌──▼─────────────┐
    │   Gemini    │  │    Binance     │
    │  :3002      │  │    :3003       │
    │             │  │                │
    │ - Chat IA   │  │ - Market Data  │
    │ - WebSocket │  │ - Investments  │
    └─────────────┘  └────────────────┘
```

## 📦 Producción (Vercel)

En producción, ambos servidores se convierten en **Vercel Serverless Functions**:

- `/api/*` → Endpoints de Binance (api-dist/)
- `/server/*` → Endpoints de Gemini (src/server/gemini/)

No es necesario preocuparse por puertos en producción - Vercel maneja todo automáticamente.

## ✅ Checklist Pre-Deploy

- [ ] `npm run build:api-local` sin errores
- [ ] Todas las variables de entorno configuradas
- [ ] `npm run dev:full` funciona correctamente
- [ ] Frontend se conecta a ambos servidores
- [ ] Chat IA responde correctamente
- [ ] Market data muestra precios en tiempo real
