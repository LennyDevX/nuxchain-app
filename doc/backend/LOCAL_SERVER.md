# 🖥️ Nuxchain Local Server - Documentación Visual

**Última actualización:** Octubre 22, 2025  
**Puerto:** 3002 (desarrollo) / Vercel (producción)  
**Status:** ✅ Activo  
**Versión:** v1.0.0

---

## 📖 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Servidor](#arquitectura-del-servidor)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Ciclo de Vida del Servidor](#ciclo-de-vida-del-servidor)
5. [Middlewares](#middlewares)
6. [Rutas y Controladores](#rutas-y-controladores)
7. [Servicios](#servicios)
8. [Configuración](#configuración)
9. [Ejecución y Deployment](#ejecución-y-deployment)

---

## 🎯 Visión General

El **servidor local Nuxchain** es una aplicación Express.js que funciona tanto en **desarrollo local (puerto 3002)** como en **Vercel (serverless)**.

### Dual Mode

```
┌──────────────────────────────────────────────────────────┐
│         NUXCHAIN LOCAL SERVER                            │
│  (Funciona en 2 modos simultáneamente)                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  MODO 1: LOCAL DEVELOPMENT                              │
│  ├─ Express.js en puerto 3002                           │
│  ├─ WebSocket soportado                                 │
│  ├─ Hot reload con nodemon                              │
│  ├─ Directorio: src/server/gemini/                      │
│  └─ Comando: npm run dev:server                         │
│                                                          │
│  MODO 2: VERCEL SERVERLESS                              │
│  ├─ Edge Functions / Serverless                         │
│  ├─ Auto-scaling                                        │
│  ├─ Zero downtime                                       │
│  ├─ Directorio: api/ (root)                             │
│  └─ Deploy automático con git push                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Componente | Tecnología | Propósito |
|-----------|-----------|----------|
| **Runtime** | Node.js 18+ | Ejecución de JavaScript |
| **Framework** | Express.js v5 | Servidor HTTP |
| **WebSocket** | ws + http | Comunicación real-time |
| **Security** | Helmet + CORS | Protección de headers |
| **Rate Limiting** | express-rate-limit | Control de acceso |
| **Logging** | Winston | Logging centralizado |
| **DB Query** | Apollo Client | GraphQL queries |
| **AI** | Google Gemini API | Generación de respuestas |

---

## 🏗️ Arquitectura del Servidor

### Flujo de Requests

```
REQUEST ENTRANTE
    │
    ▼
┌─────────────────────────────────┐
│ CORS Handling & Preflight       │
│ (OPTIONS requests)              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Security Middlewares            │
│ ├─ Helmet (security headers)    │
│ ├─ Rate Limiting (por IP)       │
│ ├─ CORS validation              │
│ └─ Abuse detection              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Body Parser                     │
│ JSON body (max 2MB)             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Route Matching                  │
│ - /api/chat/stream              │
│ - /api/health                   │
│ - /api/embeddings               │
│ - /ws/streaming                 │
└────────┬────────────────────────┘
         │
    ┌────┴───────────────────────┐
    │                            │
    ▼ (HTTP)                     ▼ (WebSocket)
  ┌──────────────────┐      ┌──────────────────┐
  │ Route Controller │      │ WebSocket Handler│
  │ - Chat stream    │      │ - Subscribe      │
  │ - Health check   │      │ - Publish        │
  │ - Analytics      │      │ - Broadcast      │
  └────┬─────────────┘      └────┬─────────────┘
       │                         │
       ▼                         ▼
  ┌──────────────────┐      ┌──────────────────┐
  │ Services Layer   │      │ Services Layer   │
  │ - Chat Service   │      │ - WebSocket Svc  │
  │ - Cache Service  │      │ - Context Svc    │
  │ - KB Search      │      │ - Streaming Svc  │
  └────┬─────────────┘      └────┬─────────────┘
       │                         │
       └─────────┬───────────────┘
                 │
                 ▼
       ┌──────────────────────┐
       │ External Services    │
       │ - Google Gemini API  │
       │ - Vector DB (KB)     │
       │ - Apollo GraphQL     │
       │ - Pinecone/Local KB  │
       └──────────────────────┘
```

### Modelos de Comunicación

```
MODELO 1: STREAMING HTTP
┌──────────────┐          ┌──────────────────┐
│ Frontend     │          │ Express Server   │
│ fetch() SSE  │──────────│ /api/chat/stream │
│              │ POST     │                  │
│ readStream() │◄─────────│ SSE/chunks       │
└──────────────┘          └──────────────────┘

MODELO 2: WEBSOCKET BIDIRECCIONAL
┌──────────────┐          ┌──────────────────┐
│ Frontend     │          │ Express Server   │
│ WebSocket    │◄────────│ ws://localhost   │
│ Client       │         │ /ws/streaming    │
│              │───────►│                  │
│ onmessage()  │         │ onmessage()      │
└──────────────┘         └──────────────────┘
```

---

## 📁 Estructura de Carpetas

### Organización Local Dev

```
src/server/gemini/
│
├── 📄 index.js
│   └─ Punto de entrada del servidor
│   └─ Inicialización de middlewares
│   └─ Setup de rutas y WebSocket
│
├── 📁 config/
│   ├── environment.js
│   │   └─ Variables de entorno
│   │   └─ Validación de config
│   │   └─ Detección Vercel vs Local
│   └── database.js
│       └─ Conexiones
│
├── 📁 routes/
│   ├── index.js
│   │   └─ Registro central de rutas
│   ├── gemini-routes.js
│   │   └─ POST /api/chat/stream
│   │   └─ GET /api/health
│   │   └─ POST /api/analytics
│   └── enhanced-streaming-routes.js
│       └─ Rutas de streaming avanzado
│
├── 📁 controllers/
│   ├── chat-controller.js
│   │   ├─ handleChatStream()
│   │   ├─ handleHealthCheck()
│   │   └─ handleAnalytics()
│   └── streaming-controller.js
│       └─ Gestión de streams
│
├── 📁 middlewares/
│   ├── error-handler.js
│   │   └─ Captura de errores globales
│   │   └─ Logging de errores
│   │   └─ Response formatting
│   │
│   ├── rate-limiter.js
│   │   └─ Limitación por IP
│   │   └─ Configuración por endpoint
│   │   └─ Bypass para desarrollo
│   │
│   ├── intelligent-rate-limiter.js
│   │   └─ Rate limiting inteligente
│   │   └─ Detección de patrones
│   │   └─ Adaptive throttling
│   │
│   ├── websocket-handler.js
│   │   └─ Inicialización WebSocket
│   │   └─ Manejo de conexiones
│   │   └─ Cleanup en disconnect
│   │
│   ├── logger.js
│   │   └─ Winston logger config
│   │   └─ Niveles de log
│   │   └─ Transporte a archivos
│   │
│   ├── context-middleware.js
│   │   └─ Inyección de contexto
│   │   └─ Request ID tracking
│   │   └─ User session management
│   │
│   └── auth.js
│       └─ Validación de API key
│       └─ JWT verification
│
├── 📁 services/
│   ├── gemini-service.js
│   │   └─ Integración Gemini API
│   │   └─ Gestión de prompts
│   │   └─ Streaming response
│   │
│   ├── embeddings-service.js
│   │   └─ Generación de embeddings
│   │   └─ Inicialización KB
│   │   └─ Vector search
│   │
│   ├── knowledge-base.js
│   │   └─ Indexación de documentos
│   │   └─ Búsqueda semántica
│   │   └─ Cache de resultados
│   │
│   ├── query-classifier.js
│   │   └─ Clasificación de queries
│   │   └─ Detección de intención
│   │   └─ Score de confianza
│   │
│   ├── semantic-streaming-service.js
│   │   └─ Chunking semántico
│   │   └─ Pauses contextuales
│   │   └─ Variable speed streaming
│   │
│   ├── context-cache-service.js
│   │   └─ Cache de contextos
│   │   └─ TTL management
│   │   └─ Invalidación
│   │
│   ├── analytics-service.js
│   │   └─ Tracking de eventos
│   │   └─ Métricas de performance
│   │   └─ User behavior analysis
│   │
│   ├── batch-service.js
│   │   └─ Procesamiento batch
│   │   └─ Queue management
│   │   └─ Bulk operations
│   │
│   ├── websocket-streaming-service.js
│   │   └─ WebSocket broadcasting
│   │   └─ Channel management
│   │   └─ Message routing
│   │
│   ├── url-context-service.js
│   │   └─ Extracción de URLs
│   │   └─ Fetch de contenido
│   │   └─ Parsing de metadata
│   │
│   └── web-scraper.js
│       └─ Scraping de sitios
│       └─ HTML parsing
│       └─ Content extraction
│
├── 📁 tests/
│   ├── comprehensive-chat-test.js
│   │   └─ Tests end-to-end
│   │   └─ Validación completa
│   │   └─ Performance benchmarks
│   │
│   ├── production-ready.test.js
│   │   └─ Checklist producción
│   │   └─ Health checks
│   │   └─ Stress testing
│   │
│   ├── simple-test-runner.js
│   │   └─ Tests básicos
│   │   └─ Quick validation
│   │   └─ Smoke tests
│   │
│   └── run-tests.js
│       └─ Orquestador de tests
│
└── 📁 utils/
    ├── logger.js
    ├── response-formatter.js
    ├── error-utils.js
    └── validation-utils.js
```

### Organización Vercel (api/)

```
api/
├── 📁 chat/
│   └── stream.ts
│       └─ Endpoint serverless
│       └─ Mismo que /api/chat/stream
│
├── 📁 health/
│   └── embeddings.js
│       └─ Health check de KB
│
├── 📁 types/
│   └── index.ts
│       └─ Tipos TypeScript compartidos
│
├── 📁 _middlewares/
│   ├── error-handler.ts
│   ├── rate-limiter.ts
│   └── serverless-security.ts
│
└── 📁 _services/
    ├── analytics-service.js
    ├── embeddings-service.ts
    ├── query-classifier.js
    ├── semantic-streaming-service.js
    └── ... (servicios compartidos)
```

---

## 🔄 Ciclo de Vida del Servidor

### Startup (Arranque)

```
1. npm run dev:server
   └─ Ejecuta: nodemon src/server/gemini/index.js

2. Cargar Variables de Entorno
   ├─ Detectar si es Vercel o local
   ├─ Validar GEMINI_API_KEY
   ├─ Configurar puerto (3002 por defecto)
   └─ Inicializar logger

3. Crear Express App
   ├─ Configurar CORS
   ├─ Parsear JSON bodies
   ├─ Setup security middlewares
   └─ Registrar rutas

4. Inicializar Knowledge Base
   ├─ Cargar documentos
   ├─ Generar embeddings
   ├─ Indexar en vector DB
   └─ Precalcular búsquedas comunes

5. Inicializar WebSocket
   ├─ Crear servidor HTTP
   ├─ Attach WebSocket library
   ├─ Setup handlers
   └─ Ready para conexiones

6. Listen en Puerto
   ├─ app.listen(3002)
   ├─ Log: "Server running on http://localhost:3002"
   └─ Ready para requests

7. Graceful Shutdown
   ├─ Escuchar SIGTERM/SIGINT
   ├─ Cerrar conexiones DB
   ├─ Cleanup WebSocket
   └─ process.exit(0)
```

### Diagrama Detallado

```
▼ npm run dev:server
│
├─► index.js loads
│   └─► env validation
│
├─► Express app created
│   ├─► CORS config
│   ├─► Body parser
│   ├─► Security middlewares
│   │   ├─ helmet()
│   │   ├─ rate-limit
│   │   └─ CORS validation
│   └─► Routes registered
│
├─► Knowledge Base Init (async)
│   ├─► Load documents
│   ├─► Generate embeddings (background)
│   ├─► Index vectors
│   └─► Emit "ready" event
│
├─► HTTP Server created
│   ├─► http.createServer(app)
│   └─► server.listen(3002)
│
├─► WebSocket initialized
│   ├─► ws server attached
│   └─► Connection handlers ready
│
└─► System Ready
    ├─ 🚀 Listening on port 3002
    ├─ ✓ Security middlewares
    ├─ ✓ Semantic chunking
    ├─ ✓ Contextual pauses
    ├─ ✓ Variable speed streaming
    └─ ✓ WebSocket support
```

---

## 🔧 Middlewares

### 1. Security Middleware (Helmet + CORS)

```typescript
// src/security/security-middleware.js
export function setupSecurityMiddlewares(app) {
  // Helmet: Headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      }
    },
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true
    }
  }));

  // CORS
  app.use(cors(getCorsConfig(env.nodeEnv)));
}
```

### 2. Rate Limiting Middleware

```typescript
// src/server/gemini/middlewares/rate-limiter.js
import rateLimit from 'express-rate-limit';

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minuto
  max: 30,                    // Max 30 requests/minuto
  message: "Too many requests",
  standardHeaders: true,      // Return RateLimit-* headers
  legacyHeaders: false,
  skip: (req) => env.nodeEnv === 'development', // Skip en dev
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: req.rateLimit.resetTime
    });
  }
});
```

### 3. Error Handler Middleware

```typescript
// src/server/gemini/middlewares/error-handler.js
export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({
    message,
    status,
    requestId: req.id,
    stack: err.stack
  });

  res.status(status).json({
    error: message,
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
}
```

### 4. Context Middleware

```typescript
// src/server/gemini/middlewares/context-middleware.js
export function contextMiddleware(req, res, next) {
  // Inyectar request ID
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Inyectar cliente IP
  req.clientIp = getClientIp(req);

  // Inyectar logger
  req.logger = logger.child({ requestId: req.id });

  // Inyectar start time
  req.startTime = Date.now();

  // Finalizar en response
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    req.logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}
```

### 5. WebSocket Handler Middleware

```typescript
// src/server/gemini/middlewares/websocket-handler.js
class WebSocketHandler {
  initialize(server, wss) {
    this.wss = wss || new WebSocket.Server({ server });

    this.wss.on('connection', (ws, req) => {
      console.log('🔌 WebSocket connection established');

      ws.on('message', async (data) => {
        const message = JSON.parse(data);
        // Handle message...
      });

      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    });
  }

  cleanup() {
    if (this.wss) {
      this.wss.clients.forEach(client => client.close());
    }
  }
}
```

---

## 🛣️ Rutas y Controladores

### Rutas Disponibles

```typescript
// src/server/gemini/routes/gemini-routes.js

// Chat streaming
POST /api/chat/stream
  ├─ Body: { message: "..." } | { messages: [...] }
  ├─ Response: SSE stream (Content-Type: text/event-stream)
  └─ Controller: handleChatStream()

// Health check
GET /api/health
  ├─ Response: { status: "ok", kb: "ready", uptime: 123456 }
  └─ Controller: handleHealthCheck()

// Analytics
POST /api/analytics
  ├─ Body: { event: "chat_complete", userId: "...", duration: 1234 }
  ├─ Response: { recorded: true }
  └─ Controller: handleAnalytics()

// Embeddings status
GET /api/health/embeddings
  ├─ Response: { ready: true, indexed: 1024, lastSync: "2025-10-22" }
  └─ Controller: handleEmbeddingsStatus()

// WebSocket
WS ws://localhost:3002/ws/streaming
  ├─ On connect: { type: "ready" }
  ├─ Send: { type: "chat", message: "..." }
  └─ Receive: { type: "chunk", content: "..." }
```

### Controladores

```typescript
// src/server/gemini/controllers/chat-controller.js

export async function handleChatStream(req, res) {
  const { message } = req.body;

  // Validar
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  // Configurar SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Clasificar query
    const classified = needsKnowledgeBase(message);

    // Buscar en KB si aplica
    let context = '';
    if (classified.needsKB) {
      context = await getRelevantContext(message);
    }

    // Generar stream
    const stream = await geminiService.generateStream(message, context);

    // Enviar chunks
    for await (const chunk of stream) {
      res.write(`data: ${chunk}\n\n`);
    }

    res.end();

  } catch (error) {
    res.write(`data: Error: ${error.message}\n\n`);
    res.end();
  }
}
```

---

## 🛠️ Servicios

### 1. Gemini Service

```typescript
// Generar respuesta con streaming
async function generateStream(message, context) {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemPrompt = buildSystemInstruction(context);

  const response = await client.models.generateContentStream({
     model: "gemini-3.1-flash-lite",
    contents: message,
    systemInstruction: systemPrompt,
  });

  // Retornar async generator
  return response.stream;
}
```

### 2. Embeddings Service

```typescript
// Inicializar KB
async function initializeKnowledgeBaseForVercel(force = false) {
  const documents = await loadDocuments();

  for (const doc of documents) {
    const embedding = await generateEmbedding(doc.content);
    await vectorDB.upsert({
      id: doc.id,
      values: embedding,
      metadata: doc.metadata
    });
  }

  return { success: true, precomputeStarted: true };
}
```

### 3. Query Classifier

```typescript
// Clasificar si query necesita KB
function needsKnowledgeBase(message, options = {}) {
  const keywords = {
    nuxchain: 1.0,
    staking: 0.9,
    nft: 0.85,
    marketplace: 0.85,
    // ... más keywords
  };

  let score = 0;
  for (const [keyword, weight] of Object.entries(keywords)) {
    if (message.toLowerCase().includes(keyword)) {
      score += weight;
    }
  }

  return {
    needsKB: score > 0.5,
    score: Math.min(score, 1),
    reason: score > 0.5 ? "Nuxchain query" : "General question"
  };
}
```

### 4. Semantic Streaming Service

```typescript
// Chunking y pausing
function *streamOptimized(text) {
  // Dividir por oraciones
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (let i = 0; i < sentences.length; i++) {
    yield {
      content: sentences[i],
      pause: i % 3 === 2 ? 100 : 0,  // Pausa cada 3 oraciones
      speed: Math.min(50 + i * 10, 200)  // Acelerar progresivamente
    };
  }
}
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# .env.local

# Base
NODE_ENV=development
PORT=3002
HOST=localhost

# API Keys
GEMINI_API_KEY=your_key_here
GOOGLE_GENAI_API_KEY=backup_key

# CORS y Seguridad
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=30

# Knowledge Base
KB_SOURCE=local
KB_UPDATE_INTERVAL=3600000
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/server.log

# Feature Flags
ENABLE_WEBSOCKET=true
ENABLE_STREAMING=true
ENABLE_SEMANTIC_CHUNKING=true
```

### Environment Detection

```typescript
// src/server/gemini/config/environment.js
const config = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  isVercel: process.env.VERCEL === '1',
  isProduction: process.env.NODE_ENV === 'production',
  apiKey: process.env.GEMINI_API_KEY,
  
  // Validación
  isEnvironmentValid: validateEnv(),
};

export default config;
```

---

## 🚀 Ejecución y Deployment

### Desarrollo Local

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend + Knowledge Base
npm run dev:server

# Output esperado:
# 🚀 Server running on http://localhost:3002
# ✓ Semantic chunking
# ✓ Contextual pauses
# ✓ Variable speed streaming
# ✓ WebSocket support
```

### Full Stack Development

```bash
# Terminal única - Ambos simultáneamente
npm run dev:full

# Ejecuta:
# - Vite (puerto 5173)
# - Express (puerto 3002)
# - Con nodemon para hot reload
```

### Testing

```bash
# Tests rápidos
npm run test:production

# Tests comprehensivos
npm run test:comprehensive

# Tests de readiness
npm run test:readiness
```

### Deployment a Vercel

```bash
# 1. Commit y push
git add .
git commit -m "New features"
git push origin main

# 2. Vercel detecta cambios automáticamente
# 3. Build process:
#    - Install dependencies
#    - Transpile TypeScript
#    - Minify bundles
#    - Deploy serverless functions

# 4. Verificar deployment
vercel logs --follow

# 5. Check health
curl https://your-domain.vercel.app/api/health
```

### Monitoreo en Producción

```bash
# Ver logs en vivo
vercel logs --follow

# Ver metrics
vercel projects

# Rollback si es necesario
vercel rollback [deployment-id]
```

---

## 📊 Métricas y Monitoreo

### Endpoints de Health

```bash
# Health general
curl http://localhost:3002/api/health

# Response:
# {
#   "status": "ok",
#   "kb": "ready",
#   "uptime": 123456789,
#   "requests": {
#     "total": 1024,
#     "success": 1020,
#     "errors": 4
#   }
# }

# Health de embeddings
curl http://localhost:3002/api/health/embeddings

# Response:
# {
#   "ready": true,
#   "indexed": 1024,
#   "lastSync": "2025-10-22T10:30:00Z",
#   "vectorDbSize": "245MB"
# }
```

### Logging

```
🚀 Chat stream request from 192.168.1.100
📝 Message: ¿Cuál es el APY de staking?
✅ KB Classification approved | Score: 0.89
🔍 Searching knowledge base...
✅ KB found: 2457 chars, score: 0.876
🤖 Generating response...
📤 Response streamed (1256 tokens)
⏱️  Request completed in 1234ms
```

---

## 🔐 Seguridad

### CORS Policies

```typescript
// Desarrollo
origins: ['http://localhost:5173', 'http://localhost:3000']

// Staging
origins: ['https://staging.nuxchain.com']

// Producción
origins: ['https://nuxchain.com', 'https://app.nuxchain.com']
```

### Rate Limiting

```
- 30 requests/minuto por IP
- Bypass en desarrollo (env: development)
- Headers informativos (Retry-After)
```

### API Key Management

```bash
# Guardado en Vercel Environment Variables
GEMINI_API_KEY=sk-proj-xxx...

# Nunca comprometido en git (.env no versionado)
# Rotación periódica recomendada
```

---

## 📚 Referencias

- [Express.js Docs](https://expressjs.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Google Gemini API](https://ai.google.dev/docs)

---

**Documento Versión:** 1.0  
**Última actualización:** Octubre 22, 2025  
**Autor:** Nuxchain Development Team  
**Status:** ✅ Producción
