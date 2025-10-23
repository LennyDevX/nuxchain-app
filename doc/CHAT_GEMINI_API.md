# 🤖 Nuxchain Chat Gemini API - Documentación Visual

**Última actualización:** Octubre 22, 2025  
**Modelo:** Gemini 2.5 Flash Lite  
**Status:** ✅ Activo y operativo  
**Versión API:** v1.0

---

## 📖 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flujo de Conversación](#flujo-de-conversación)
4. [Endpoints API](#endpoints-api)
5. [Tipos de Datos](#tipos-de-datos)
6. [Sistema de Knowledge Base](#sistema-de-knowledge-base)
7. [Streaming en Tiempo Real](#streaming-en-tiempo-real)
8. [Seguridad y Rate Limiting](#seguridad-y-rate-limiting)

---

## 🎯 Visión General

**Nuxbee** es el asistente de IA conversacional de Nuxchain que proporciona:
- ✅ Respuestas inteligentes basadas en contexto
- ✅ Streaming de respuestas en tiempo real
- ✅ Integración con Knowledge Base privada
- ✅ Seguridad avanzada y rate limiting
- ✅ WebSocket para comunicación bidireccional

```
┌──────────────────────────┐
│  Frontend (React App)    │
│  - Chat Interface        │
│  - Message Input         │
│  - Stream Display        │
└──────────────┬───────────┘
               │
               │ POST /api/chat/stream (WebSocket)
               ▼
┌──────────────────────────────────────┐
│  Nuxbee API (Vercel Serverless)      │
│  ├─ Query Classifier                 │
│  ├─ Knowledge Base Resolver          │
│  ├─ Gemini API Client               │
│  └─ Stream Response Handler          │
└──────────────┬────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌───────────────┐
│ Embeddings   │  │ Google        │
│ (Vector DB)  │  │ Gemini API    │
└──────────────┘  └───────────────┘
```

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
api/
├── chat/
│   └── stream.ts                    # Endpoint principal de streaming
│
├── _config/
│   └── system-instruction.js        # Instrucciones del sistema para IA
│
├── _services/
│   ├── embeddings-service.ts       # Vector embeddings y búsqueda
│   ├── semantic-streaming-service.js # Procesamiento semántico
│   ├── query-classifier.js         # Clasificación de queries
│   ├── knowledge-base.js           # Base de conocimientos
│   ├── markdown-formatter.js       # Formateo de respuestas
│   ├── context-cache-service.js    # Cache de contexto
│   └── web-scraper.js              # Scraping de URLs
│
├── _middlewares/
│   ├── serverless-security.ts      # Seguridad (rate limiting, CORS)
│   ├── error-handler.ts            # Manejo de errores
│   └── rate-limiter.ts             # Rate limiting por IP
│
└── types/
    └── index.ts                     # Tipos TypeScript
```

### Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| **Frontend** | React 19 + WebSocket | Interfaz de chat |
| **Backend** | Vercel Serverless | Procesamiento |
| **IA** | Google Gemini 2.5 Flash | Generación de respuestas |
| **Embeddings** | Sentence Transformers | Búsqueda semántica |
| **Vector DB** | Pinecone/Local | Almacenamiento de embeddings |
| **Cache** | Redis | Cache de contextos |
| **Transport** | HTTP/WebSocket | Comunicación real-time |

---

## 🔄 Flujo de Conversación

### Flujo Completo del Chat

```
1. USUARIO ENVÍA MENSAJE
   └─ Input: "¿Cuál es el APY de staking en Nuxchain?"

2. FRONTEND ENVÍA POST
   └─ POST /api/chat/stream
   └─ Headers: Content-Type: application/json
   └─ Body: { message: "..." } || { messages: [...] }

3. VALIDACIÓN EN SERVIDOR
   ├─ ✓ Validar formato del mensaje
   ├─ ✓ Validar longitud (max 10,000 chars)
   ├─ ✓ Rate limiting (por IP/usuario)
   └─ ✓ API key disponible

4. CLASIFICACIÓN DE QUERY
   ├─ Analizar intención del mensaje
   ├─ Determinar si necesita Knowledge Base
   └─ Score de confianza (0-1)

5. BÚSQUEDA EN KNOWLEDGE BASE (si aplica)
   ├─ Generar embedding del mensaje
   ├─ Buscar documentos similares (threshold 0.15)
   ├─ Retornar top-3 documentos relevantes
   └─ Score de similitud

6. CONSTRUCCIÓN DE PROMPT
   ├─ System Instruction (reglas del sistema)
   ├─ KB Context (si disponible)
   ├─ Mensaje del usuario
   └─ Historial (últimos 10 mensajes)

7. LLAMADA A GEMINI
   └─ generateContentStream()
   └─ Model: gemini-2.5-flash-lite
   └─ Config de seguridad (bloqueo de contenido)

8. STREAMING DE RESPUESTA
   ├─ SSE (Server-Sent Events) u HTTP Streaming
   ├─ Chunking semántico
   ├─ Pauses contextuales
   └─ Control de velocidad variable

9. FORMATEO MARKDOWN
   ├─ Convertir a Markdown
   ├─ Validar sintaxis
   └─ Escapar caracteres especiales

10. ENVÍO AL CLIENTE
    └─ res.write() o WebSocket.send()
    └─ Frontend recibe stream en tiempo real
```

### Diagrama de Flujo Detallado

```
┌─────────────────┐
│ User Message    │
│ "¿APY staking?" │
└────────┬────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │ Validation Layer                │
    │ ├─ Check format                 │
    │ ├─ Check length                 │
    │ ├─ Rate limit check             │
    │ └─ Abuse detection              │
    └────────┬────────────────────────┘
             │ ✓ Valid
             ▼
    ┌─────────────────────────────────┐
    │ Query Classification            │
    │ needsKnowledgeBase()            │
    │ └─ Returns: score, reason       │
    └────────┬────────────────────────┘
             │
        ┌────┴──────────────────┐
        │                       │
    Score > 0.5             Score < 0.5
        │                       │
        ▼                       ▼
    ┌──────────────┐      ┌──────────────┐
    │ Search KB    │      │ Use General  │
    │ embeddings   │      │ Knowledge    │
    └──────┬───────┘      └──────┬───────┘
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │ Build System Prompt     │
        │ ├─ System Instruction   │
        │ ├─ KB Context (if any)  │
        │ ├─ User Message         │
        │ └─ History Context      │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ Call Gemini API         │
        │ generateContentStream() │
        │ Model: 2.5-flash-lite   │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ Stream Response         │
        │ Chunk by chunk          │
        │ Semantic pausing        │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ Format Markdown         │
        │ Cleanup response        │
        │ Validate output         │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ Send to Frontend        │
        │ SSE or WebSocket        │
        │ Real-time streaming     │
        └─────────────────────────┘
```

---

## 🔌 Endpoints API

### POST /api/chat/stream

**Descripción:** Endpoint principal para chat con streaming

**Request:**
```typescript
POST /api/chat/stream
Content-Type: application/json
Authorization: (optional, validado por rate limiting)

// Opción 1: Mensaje simple
{
  "message": "¿Cuál es el APY de staking?"
}

// Opción 2: Array de mensajes
{
  "messages": [
    { "role": "user", "content": "¿Qué es Nuxchain?" },
    { "role": "assistant", "content": "Nuxchain es..." },
    { "role": "user", "content": "¿Y el staking?" }
  ]
}

// Opción 3: String directo
"¿Cuál es el APY?"
```

**Response:**
```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Transfer-Encoding: chunked
X-Accel-Buffering: no

data: Nuxchain
data: proporciona
data: múltiples
data: opciones
...
```

**Errores Posibles:**
```json
// 400 - Validación fallida
{
  "error": "Validation failed",
  "details": ["Message content is required"]
}

// 429 - Rate limit excedido
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}

// 500 - Error del servidor
{
  "error": "Internal server error",
  "requestId": "uuid-here"
}
```

---

## 📊 Tipos de Datos

### ChatMessage

```typescript
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  metadata?: {
    timestamp?: number;
    source?: "kb" | "general";
    score?: number;
  };
}
```

### KnowledgeBaseContext

```typescript
interface KnowledgeBaseContext {
  context: string;              // Contexto encontrado en KB
  score: number;                // Score de similitud (0-1)
  source?: string;              // Fuente del documento
  timestamp?: number;           // Cuándo se indexó
}
```

### ClassificationResult

```typescript
interface ClassificationResult {
  needsKB: boolean;             // ¿Necesita KB?
  score: number;                // Score de confianza (0-1)
  reason?: string;              // Razón de la clasificación
  keywords?: string[];          // Palabras clave detectadas
}
```

### StreamConfig

```typescript
interface StreamConfig {
  enableSemanticChunking?: boolean;    // Chunking semántico
  enableContextualPauses?: boolean;    // Pauses en puntuación
  enableVariableSpeed?: boolean;       // Velocidad variable
  clientInfo?: {
    ip: string;
    userAgent?: string;
  };
}
```

### RequestMetrics

```typescript
interface RequestMetrics {
  total: number;                // Total de requests
  success: number;              // Requests exitosos
  errors: number;               // Requests con error
  avgResponseTime: number;      // Tiempo promedio (ms)
}
```

---

## 🧠 Sistema de Knowledge Base

### Arquitectura KB

```
┌─────────────────────────────────────┐
│     DOCUMENTOS FUENTE               │
│  ├─ README.md                       │
│  ├─ Roadmap                         │
│  ├─ Documentation                   │
│  ├─ FAQs                            │
│  └─ Technical Specs                 │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Semantic Chunking      │
        │ - Split en chunks      │
        │ - Preservar contexto   │
        │ - Minimizar overlap    │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Generate Embeddings    │
        │ Sentence-Transformers  │
        │ - 1536 dimensiones     │
        │ - Normalized vectors   │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Store in Vector DB     │
        │ - Pinecone (prod)      │
        │ - Local (dev)          │
        │ - Metadata indexing    │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Ready for Search       │
        │ Similarity search      │
        │ Top-K retrieval        │
        └────────────────────────┘
```

### Flujo de Búsqueda

```typescript
// 1. Usuario hace pregunta
const userQuery = "¿Cuál es el APY del staking?";

// 2. Generar embedding de la query
const queryEmbedding = await generateEmbedding(userQuery);
// Output: Float32Array de 1536 dimensiones

// 3. Búsqueda en vector DB
const results = await vectorDB.search(
  queryEmbedding,
  {
    topK: 3,              // Top 3 resultados
    threshold: 0.15,      // Score mínimo
    metadata: {
      category: "staking"
    }
  }
);

// 4. Resultados
// [
//   { 
//     id: "doc-1", 
//     score: 0.89,           // 89% similitud
//     content: "El APY de staking...",
//     source: "ROADMAP.md"
//   },
//   { 
//     id: "doc-2", 
//     score: 0.76,
//     content: "Staking rewards...",
//     source: "FAQ.md"
//   },
//   ...
// ]

// 5. Construir contexto
const context = results
  .map(r => `## ${r.source}\n${r.content}`)
  .join("\n\n");

// 6. Pasar a Gemini
const response = await generateWithContext(userMessage, context);
```

### Query Classification

```typescript
// Clasificación de queries
export function needsKnowledgeBase(message: string): ClassificationResult {
  
  // Palabras clave que indican búsqueda en KB
  const kbKeywords = {
    "nuxchain": { weight: 1.0, category: "platform" },
    "staking": { weight: 0.9, category: "feature" },
    "apy": { weight: 0.9, category: "feature" },
    "nft": { weight: 0.85, category: "feature" },
    "roadmap": { weight: 0.9, category: "info" },
    "marketplace": { weight: 0.85, category: "feature" },
    "pricing": { weight: 0.7, category: "info" },
  };

  // Palabras que indican general knowledge
  const generalKeywords = {
    "blockchain": { weight: 0.5 },
    "cryptocurrency": { weight: 0.5 },
    "web3": { weight: 0.6 },
    "defi": { weight: 0.7 },
  };

  // Calcular score
  let kbScore = 0;
  let generalScore = 0;

  for (const [keyword, data] of Object.entries(kbKeywords)) {
    if (message.toLowerCase().includes(keyword)) {
      kbScore += data.weight;
    }
  }

  for (const [keyword, data] of Object.entries(generalKeywords)) {
    if (message.toLowerCase().includes(keyword)) {
      generalScore += data.weight;
    }
  }

  const normalizedScore = kbScore / (kbScore + generalScore || 1);

  return {
    needsKB: normalizedScore > 0.5,
    score: normalizedScore,
    reason: normalizedScore > 0.5 
      ? "Nuxchain-specific question detected"
      : "General knowledge question"
  };
}
```

---

## 🌊 Streaming en Tiempo Real

### Streaming SSE (Server-Sent Events)

```typescript
// Frontend
const eventSource = new EventSource('/api/chat/stream', {
  method: 'POST',
  body: JSON.stringify({ message: "Hola" })
});

eventSource.onmessage = (event) => {
  // Recibir chunk del servidor
  console.log("Chunk:", event.data);
  // Display en UI
  appendToChat(event.data);
};

eventSource.onerror = (error) => {
  console.error("Stream error:", error);
};
```

### Streaming WebSocket

```typescript
// Frontend
const ws = new WebSocket('ws://localhost:3002/ws/streaming');

ws.onopen = () => {
  ws.send(JSON.stringify({ 
    type: 'chat',
    message: "¿Qué es Nuxchain?"
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'chunk') {
    appendToChat(data.content);
  } else if (data.type === 'done') {
    console.log("Respuesta completada");
  }
};
```

### Chunking Semántico

```typescript
// Servidor
const semanticStreamingService = {
  
  // Chunking por puntuación
  chunkBySentence: (text: string) => {
    return text.split(/(?<=[.!?])\s+/);
  },
  
  // Pauses contextuales
  addContextualPauses: (chunks: string[]) => {
    return chunks.map((chunk, i) => ({
      content: chunk,
      pause: i % 3 === 2 ? 100 : 0  // Pausa cada 3 chunks
    }));
  },
  
  // Velocidad variable (más lenta al inicio)
  addVariableSpeed: (chunks: any[]) => {
    return chunks.map((chunk, i) => ({
      ...chunk,
      delay: Math.min(50 + i * 10, 200)  // Aumenta la velocidad
    }));
  },
  
  // Stream optimizado
  *streamOptimized(text: string) {
    let chunks = this.chunkBySentence(text);
    chunks = this.addContextualPauses(chunks);
    chunks = this.addVariableSpeed(chunks);
    
    for (const chunk of chunks) {
      yield chunk;
    }
  }
};
```

---

## 🔒 Seguridad y Rate Limiting

### Rate Limiting

```typescript
// Configuración
const rateLimitConfig = {
  windowMs: 60 * 1000,        // Ventana de 1 minuto
  max: 30,                    // Max 30 requests por ventana
  message: "Rate limit exceeded",
  standardHeaders: true,      // Return RateLimit-* headers
  legacyHeaders: false,
};

// Implementación con express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit(rateLimitConfig);

app.post('/api/chat/stream', limiter, streamHandler);
```

### Seguridad de Contenido

```typescript
// Bloqueo de contenido peligroso
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Pasar a Gemini
const response = await client.models.generateContentStream({
  model: "gemini-2.5-flash-lite",
  contents: message,
  config: {
    safetySettings,
  }
});
```

### CORS y Headers

```typescript
// Configuración CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 horas
};

app.use(cors(corsOptions));

// Headers de Seguridad
app.use(helmet());
```

---

## 📈 Métricas y Monitoreo

### Tracking de Métricas

```typescript
const metrics: RequestMetrics = {
  total: 0,        // Total requests
  success: 0,      // Requests exitosos
  errors: 0,       // Requests con error
  avgResponseTime: 0  // Tiempo promedio
};

// Actualizar métricas
metrics.total++;
const startTime = Date.now();

try {
  // Procesar...
  metrics.success++;
} catch (error) {
  metrics.errors++;
} finally {
  const duration = Date.now() - startTime;
  metrics.avgResponseTime = 
    (metrics.avgResponseTime * (metrics.total - 1) + duration) / metrics.total;
}
```

### Logging

```typescript
// Diferentes niveles de logging
console.log('🚀 Chat stream request from IP');
console.log('📝 Message: ...');
console.log('✅ KB Classification approved');
console.log('🔍 Searching knowledge base...');
console.log('❌ Validation errors: ...');
console.error('💥 Critical error: ...');
```

---

## 🎨 System Instruction

```
Nuxbee System Instruction:

## When Knowledge Base Context is PROVIDED:
1. **USE ONLY KB CONTEXT**: Answer EXCLUSIVELY using KB
2. **NO INVENTION**: Never create facts not in KB
3. **STAY ACCURATE**: Cite sources when possible
4. **BE CONCISE**: 2-3 paragraphs max

## When NO Knowledge Base Context (General):
1. **USE YOUR GENERAL KNOWLEDGE**: Answer general crypto/Web3 questions
2. **BE HELPFUL**: Explain blockchain, NFTs, DeFi concepts
3. **CLARIFY SCOPE**: Mention "For Nuxchain-specific details..."
4. **BE ACCURATE**: Use training knowledge correctly

## Response Format:
- Start answering immediately
- Use Markdown formatting
- Maximum 2-3 paragraphs
- Use emojis sparingly (1-2 max)
- Stop after answering
```

---

## 🚀 Deployment

### Variables de Entorno

```bash
# .env.local (Vercel)
GEMINI_API_KEY=your_api_key_here
GOOGLE_GENAI_API_KEY=backup_key
ALLOWED_ORIGINS=https://nuxchain.com,https://staging.nuxchain.com
NODE_ENV=production
PINECONE_API_KEY=pinecone_key
PINECONE_ENVIRONMENT=us-west-1
```

### Deploy a Vercel

```bash
# 1. Push a GitHub
git push origin main

# 2. Vercel detecta cambios
# 3. Auto-deploy (o manual desde dashboard)
# 4. Environment vars configuradas en Vercel
# 5. Verificar logs: vercel logs --follow
```

---

## 📞 Testing API

### cURL

```bash
curl -X POST http://localhost:3002/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Qué es Nuxchain?"}'
```

### Postman

```
POST http://localhost:3002/api/chat/stream
Headers:
  Content-Type: application/json
Body (JSON):
  {
    "message": "¿Cuál es el APY de staking?"
  }
```

### JavaScript

```javascript
async function chatWithNuxbee(message) {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log(chunk);
    // Display en UI
  }
}
```

---

## 🔗 Referencias

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit)

---

**Documento Versión:** 1.0  
**Última actualización:** Octubre 22, 2025  
**Autor:** Nuxchain Development Team  
**Status:** ✅ Producción
