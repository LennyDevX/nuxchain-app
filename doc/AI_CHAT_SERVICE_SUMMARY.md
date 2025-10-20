# 🎯 Servicio de IA (Nuxbee AI) en Nuxchain

## 📌 Sistema en 4 Capas

```
1. FRONTEND (React Chat)        ← Chat.tsx + hooks
       ↓
2. API BACKEND (Vercel)          ← /api/chat/stream.js
       ↓
3. AI SERVICES (Google Gemini)   ← Gemini 2.5 Flash Lite
       ↓
4. KNOWLEDGE BASE (Embeddings)   ← knowledge-base.js + embeddings
```

---

## 🚀 Cómo Funciona Nuxbee AI

### Flujo Completo

```
1. Usuario escribe pregunta
2. Frontend envía mensaje → /api/chat/stream
3. Backend clasifica query → ¿Necesita KB?
4. Si necesita KB → Busca contexto relevante (embeddings)
5. Si no necesita KB → Responde con conocimiento general
6. Backend construye prompt → System instruction + contexto
7. Llama Gemini API → Genera respuesta
8. Stream semántico → Respuesta natural en tiempo real
9. ✅ Usuario ve respuesta formateada en markdown
```

---

## 🤖 Gemini AI Integration

### Modelo Utilizado
**Gemini 2.5 Flash Lite**
- Modelo: `gemini-2.5-flash-lite`
- Velocidad: Ultra rápida (< 2s promedio)
- Contexto: 32,768 tokens
- Output: 1,024 tokens max
- Costo: Muy bajo (~$0.0001 por mensaje)

### Configuración del Modelo
```javascript
{
  model: "gemini-2.5-flash-lite",
  temperature: 0.3,        // Respuestas precisas y consistentes
  topK: 20,                // Top 20 tokens considerados
  topP: 0.85,              // 85% probabilidad acumulativa
  maxOutputTokens: 1024,   // Máx 1024 tokens por respuesta
  safetySettings: [
    HarmCategory.HARASSMENT → BLOCK_ONLY_HIGH
    HarmCategory.HATE_SPEECH → BLOCK_ONLY_HIGH
  ]
}
```

---

## 📚 Knowledge Base (Base de Conocimientos)

### Estructura de Datos
```javascript
const knowledgeBase = [
  {
    content: "Texto con información...",
    metadata: { 
      type: "general|staking|marketplace|nft|airdrops|...",
      category: "platform|guide|tutorial|...",
      topic: "overview|features|..."
    },
    commands: ['keywords', 'búsquedas', 'relevantes']
  }
]
```

### Categorías del KB
| Tipo | Descripción | Ejemplos |
|------|-------------|----------|
| `general` | Info general plataforma | Visión, misión, overview |
| `staking` | Sistema de staking | APY, lockup, rewards |
| `marketplace` | NFT marketplace | Compra/venta, filtros |
| `nft` | NFTs y colecciones | NFTs 2.0, minting |
| `airdrops` | Airdrops y campañas | Registro, claim |
| `tokenization` | Crear tokens/NFTs | ERC-20, ERC-721 |
| `technical` | Detalles técnicos | Contratos, APIs |
| `roadmap` | Roadmap y desarrollo | Fases, milestones |
| `labs` | Nuxchain Labs IA | Proyectos innovación |

**Total:** 773 entradas en knowledge base

---

## 🔍 Sistema de Embeddings

### Cómo Funciona
```
1. Query del usuario → Normalización
2. Tokenización → Expansión de sinónimos
3. Generación embeddings → Gemini API
4. Búsqueda semántica → Similaridad coseno
5. Ranking resultados → Score + boost
6. ✅ Retorna contexto relevante
```

### Expansión de Sinónimos
```javascript
// Español ↔ Inglés
'staking' → ['stake', 'apostar', 'depositar', 'bloquear']
'apy' → ['roi', 'rendimiento', 'tasa', 'porcentaje', 'recompensa']
'marketplace' → ['mercado', 'tienda', 'market', 'comercio']
'nft' → ['nfts', 'token', 'coleccionable']
```

### Boost de Keywords
```javascript
'nuxchain': 2.5x    // Máximo boost
'staking': 2.0x
'apy': 2.2x
'marketplace': 2.0x
'nft': 2.0x
'rewards': 1.8x
'features': 1.8x
```

---

## 🎯 Query Classifier (Clasificador de Consultas)

### Función: needsKnowledgeBase()
Determina si una pregunta necesita buscar en la KB o puede responderse con conocimiento general de Gemini.

```javascript
needsKnowledgeBase(query) → {
  needsKB: boolean,          // ¿Necesita KB?
  score: number,             // Score de confianza (0-1)
  reason: string,            // Razón de decisión
  keywords: string[]         // Keywords detectados
}
```

### Criterios de Decisión

**Necesita KB (score > 0.25):**
- ✅ Menciona "nuxchain", "staking", "marketplace", "apy"
- ✅ Pregunta sobre funcionalidades específicas
- ✅ Consulta técnica sobre contratos
- ✅ Pregunta sobre roadmap o planes

**NO necesita KB:**
- ❌ Preguntas generales ("¿Qué es blockchain?")
- ❌ Saludos y conversación casual
- ❌ Conceptos generales no específicos de Nuxchain

### Ejemplos de Clasificación
```
Query: "¿Cuál es el APY de staking?"
→ needsKB: true, score: 0.85, keywords: ['apy', 'staking']

Query: "¿Qué es blockchain?"
→ needsKB: false, score: 0.05, reason: "Generic question"

Query: "Cómo comprar NFTs en Nuxchain"
→ needsKB: true, score: 0.75, keywords: ['nuxchain', 'nft', 'comprar']
```

---

## 💬 Semantic Streaming Service

### Función Principal
Envía respuesta AI de forma natural, imitando escritura humana con pausas contextuales.

```javascript
semanticStreamingService.streamSemanticContent(
  res,                    // Response object
  content,                // Texto completo de Gemini
  {
    enableSemanticChunking: true,   // Chunking inteligente
    enableContextualPauses: true,   // Pausas naturales
    enableVariableSpeed: true       // Velocidad variable
  }
)
```

### Características

**1. Semantic Chunking**
```
No corta palabras a la mitad
Respeta límites de oraciones
Mantiene markdown intacto
```

**2. Contextual Pauses**
```
Punto (.)     → 50ms pausa
Coma (,)      → 30ms pausa
Nueva línea   → 80ms pausa
Código block  → 100ms pausa
```

**3. Variable Speed**
```
Texto normal  → 15ms/chunk
Código        → 25ms/chunk
Listas        → 20ms/chunk
```

---

## 🔧 Servicios Auxiliares

### 1. markdown-formatter.js
**Función:** Formatear respuesta AI con markdown consistente

```javascript
formatResponseForMarkdown(text) → {
  ✓ Convierte **bold** → **negrita**
  ✓ Agrega saltos de línea apropiados
  ✓ Formatea listas y bullets
  ✓ Preserva code blocks
  ✓ Limpia espacios innecesarios
}
```

### 2. url-context-service.js
**Función:** Extraer contenido de URLs compartidas

```javascript
extractURLContext(url) → {
  title: string,
  description: string,
  content: string,
  metadata: object
}
```

### 3. context-cache-service.js
**Función:** Cachear contextos de KB para reducir latencia

```javascript
// Cache en memoria (1 hora)
getFromCache(key) → context | null
setInCache(key, value, ttl)
```

---

## 📁 Archivos Clave

```
api/
├── chat/
│   └── stream.js                    ← Endpoint principal
├── _services/
│   ├── embeddings-service.js        ← Búsqueda semántica
│   ├── knowledge-base.js            ← Base de conocimientos
│   ├── query-classifier.js          ← Clasificador
│   ├── semantic-streaming-service.js ← Streaming natural
│   ├── markdown-formatter.js        ← Formateo
│   ├── url-context-service.js       ← Extracción URLs
│   └── context-cache-service.js     ← Cache
├── _config/
│   └── system-instruction.js        ← Prompt system
└── _middlewares/
    ├── serverless-security.js       ← Seguridad
    ├── rate-limiter.js              ← Rate limiting
    └── error-handler.js             ← Manejo errores

src/
├── hooks/chat/
│   └── useChat.tsx                  ← Hook frontend
├── pages/
│   └── Chat.tsx                     ← Página chat
└── components/chat/
    ├── ChatMessage.tsx              ← Mensaje individual
    ├── ChatInput.tsx                ← Input usuario
    └── MarkdownRenderer.tsx         ← Renderizado markdown
```

---

## 🔐 Seguridad y Rate Limiting

### Capas de Seguridad

**1. Serverless Security (serverless-security.js)**
```javascript
- CORS policies
- Security headers (CSP, X-Frame-Options)
- XSS detection
- SQL Injection detection
- Request validation
- Timeout protection (25s)
```

**2. Rate Limiting (rate-limiter.js)**
```javascript
- 30 requests/minuto por IP
- 100 requests/hora por IP
- Backoff exponencial
- Whitelist IPs de confianza
```

**3. Validaciones de Input**
```javascript
- Max 10,000 chars por mensaje
- Solo POST permitido
- Estructura de body validada
- API key requerida
```

---

## 🐛 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "API key not configured" | Sin GEMINI_API_KEY | Configurar .env |
| "Validation failed" | Mensaje inválido | Verificar estructura |
| "Request timeout" | Respuesta > 25s | Reducir contexto |
| "Rate limit exceeded" | Muchos requests | Esperar 1 minuto |
| "Service unavailable" | Quota excedida | Verificar plan Gemini |
| "KB context not found" | Sin resultados KB | Query muy genérico |

---

## 💻 Variables de Entorno

```env
# API Keys
GEMINI_API_KEY=AIza...                # API Key de Google Gemini
GOOGLE_GEMINI_API_KEY=AIza...         # Alternativo

# Opcional: Rate Limiting
RATE_LIMIT_REQUESTS=30                # Requests por minuto
RATE_LIMIT_WINDOW=60000               # Ventana en ms
```

---

## 📊 Métricas y Analytics

### Métricas Tracked
```javascript
metrics = {
  total: 0,              // Total requests
  success: 0,            // Exitosos
  errors: 0,             // Errores
  avgResponseTime: 0     // Tiempo promedio (ms)
}

// Log cada 50 requests
[METRICS] Total: 500, Success: 485, Errors: 15, Avg: 1823ms
```

### Performance Esperado
```
Tiempo promedio: 1.5-2.5 segundos
P50: 1.8s
P95: 3.5s
P99: 5s
Timeout: 25s (límite Vercel)
```

---

## 🔄 Flujo Técnico Detallado

### 1. Request Inicial
```
Usuario → Frontend → POST /api/chat/stream
Body: {
  message: "¿Cuál es el APY de staking?",
  messages: [...historial opcional]
}
```

### 2. Clasificación
```javascript
// Query Classifier
const result = needsKnowledgeBase(message)
→ { needsKB: true, score: 0.85, keywords: ['apy', 'staking'] }
```

### 3. Búsqueda en KB (si needsKB = true)
```javascript
// Embeddings Service
const context = await getRelevantContext(message, { threshold: 0.15 })
→ {
  context: "Nuxchain APY base is 0.01%...",
  score: 0.87
}
```

### 4. System Instruction
```javascript
// Build prompt
const systemInstruction = buildSystemInstructionWithContext(
  context.context,
  context.score
)
→ "Eres Nuxbee, el asistente AI de Nuxchain... [CONTEXTO RELEVANTE]..."
```

### 5. Llamada a Gemini
```javascript
const streamResponse = await client.models.generateContentStream({
  model: "gemini-2.5-flash-lite",
  contents: message,
  config: { systemInstruction, temperature: 0.3, ... }
})
```

### 6. Recolección de Stream
```javascript
let fullResponse = ''
for await (const chunk of streamResponse) {
  fullResponse += chunk.text
}
→ "El APY base de staking en Nuxchain es 0.01% por hora..."
```

### 7. Formateo Markdown
```javascript
const formatted = formatResponseForMarkdown(fullResponse)
→ Asegura markdown consistente
```

### 8. Semantic Streaming
```javascript
await semanticStreamingService.streamSemanticContent(
  res,
  formatted,
  options
)
→ Envía chunks con pausas naturales
```

### 9. Frontend Recibe
```
✅ Mensaje completo renderizado en UI
   con markdown, code highlighting, etc.
```

---

## 🎨 Frontend: Chat UI

### Componentes React

**Chat.tsx** (Página principal)
```typescript
- Estado de mensajes
- Input del usuario
- Scroll automático
- Loading states
```

**ChatMessage.tsx**
```typescript
- Renderizado individual
- Avatar (usuario/AI)
- Timestamp
- Markdown rendering
- Code highlighting
```

**useChat.tsx** (Hook)
```typescript
const {
  messages,           // Array de mensajes
  sendMessage,        // Enviar mensaje
  isLoading,          // Estado carga
  error,              // Error si hay
  clearHistory        // Limpiar historial
} = useChat()
```

---

## ✨ Características Avanzadas

### 1. Context Awareness
```
Nuxbee mantiene contexto de conversación
→ Recuerda mensajes anteriores
→ Referencias a preguntas previas
→ Seguimiento de temas
```

### 2. Multilingual Support
```
✅ Español (primario)
✅ Inglés (automático)
→ Detección automática de idioma
→ KB en ambos idiomas
```

### 3. Code Highlighting
```javascript
// Automático para código
function example() {
  return "highlighted";
}
```

### 4. Rich Markdown
```markdown
**Negrita**, *Itálica*, `código inline`

- Listas
- Bullets
- Numeradas

> Citas

[Links](https://...)
```

---

## 🎯 Optimizaciones Aplicadas

### Performance
- ✅ **Context Caching**: Caché en memoria (1h TTL)
- ✅ **Embeddings Reuse**: No regenerar embeddings
- ✅ **Streaming**: Respuestas progresivas
- ✅ **Truncate Context**: Max 8000 chars de KB
- ✅ **Lazy Loading**: Mensajes con paginación

### UX
- ✅ **Semantic Pauses**: Lectura natural
- ✅ **Variable Speed**: Adapta velocidad
- ✅ **Markdown Formatting**: Respuestas bonitas
- ✅ **Error Recovery**: Retry automático
- ✅ **Loading States**: Feedback visual

### Seguridad
- ✅ **Rate Limiting**: Anti-abuse
- ✅ **Input Validation**: XSS/SQLi detection
- ✅ **Timeout Protection**: Max 25s
- ✅ **CORS Policies**: Origins permitidos
- ✅ **Security Headers**: CSP, X-Frame-Options

---

## 🚀 Casos de Uso Reales

### Caso 1: Pregunta sobre Staking
```
Usuario: "¿Cuál es el APY de staking con lockup de 365 días?"

Flujo:
1. Clasificador → needsKB: true (score: 0.9)
2. KB Search → Encuentra APY info (score: 0.95)
3. Gemini → Genera respuesta con contexto
4. Respuesta: "El APY con lockup de 365 días es 0.03% por hora, 
   equivalente a 262.8% APY anual. Es el más alto..."
```

### Caso 2: Pregunta General
```
Usuario: "¿Qué es blockchain?"

Flujo:
1. Clasificador → needsKB: false (score: 0.05, generic)
2. KB Search → SKIP
3. Gemini → Responde con conocimiento general
4. Respuesta: "Blockchain es una tecnología de registro 
   distribuido que permite almacenar información..."
```

### Caso 3: Pregunta Compleja Multi-Parte
```
Usuario: "Explica cómo funciona el marketplace, cuánto 
         cuesta vender un NFT y qué comisiones hay"

Flujo:
1. Clasificador → needsKB: true (score: 0.95, multi-keyword)
2. KB Search → Busca contexto de marketplace + fees
3. Context: Múltiples entradas combinadas
4. Gemini → Genera respuesta completa estructurada
5. Respuesta: Markdown con secciones, listas, ejemplos
```

---

## 📈 Roadmap de IA

### Fase 1 ✅ (Completado)
- ✅ Nuxbee AI 1.0 funcional
- ✅ Knowledge Base completo
- ✅ Semantic Search
- ✅ Streaming natural

### Fase 2 🔄 (En Progreso)
- 🔄 Nuxbee AI 2.0 (Q1 2026)
- 🔄 Plataforma dedicada para Nuxbee
- 📅 Análisis predictivo de mercado

### Fase 3 📅 (Planeado)
- 📅 AI Strategist avanzado (Q2 2026)
- 📅 Portfolio optimization AI
- 📅 Automated trading signals
- 📅 NFT analytics AI

---

## ✅ Checklist para Usar Nuxbee

**Usuario:**
- [ ] Ir a `/chat` en la plataforma
- [ ] Escribir pregunta en español o inglés
- [ ] Esperar respuesta (1-3 segundos)
- [ ] Leer respuesta formateada

**Developer:**
- [ ] GEMINI_API_KEY configurada
- [ ] Knowledge base actualizada
- [ ] Rate limiting configurado
- [ ] Vercel deployment activo
- [ ] Logs monitoreando errores

---

**Resumen:** Nuxbee AI es un asistente inteligente potenciado por Google Gemini 2.5 Flash Lite con una base de conocimientos de 773 entradas. Usa embeddings semánticos, clasificador de queries, y streaming natural para ofrecer respuestas precisas y rápidas sobre todos los aspectos de Nuxchain. Sistema seguro, escalable y optimizado para Vercel serverless.
