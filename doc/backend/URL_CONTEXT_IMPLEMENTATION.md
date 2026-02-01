# 🔗 URL Context Implementation Guide

## Overview
Implementación completa del servicio de URL Context usando la herramienta nativa de Gemini API para análisis de contenido web.

**Fecha:** Diciembre 14, 2025  
**SDK:** `@google/genai` (Google Generative AI SDK)  
**Documentación:** https://ai.google.dev/gemini-api/docs/url-context

---

## ✨ Features Implementadas

### 1. **Detección Automática de URLs** 
- El frontend detecta URLs en mensajes del usuario mediante regex
- Activa automáticamente el indicador visual de "Analyzing URL content..."
- Soporta múltiples URLs por mensaje (máx 20 según limitaciones de Gemini)

### 2. **Tool API de Gemini**
- Usa `{ url_context: {} }` como tool nativo de Gemini
- No requiere web scraping manual
- Gemini maneja automáticamente:
  - Fetch de contenido
  - Parsing HTML/PDF/JSON/Images
  - Extracción de información relevante
  - Manejo de errores (paywalls, URLs inválidas, etc.)

### 3. **Feedback Visual**
- **Indicador cyan** cuando se detectan URLs
- Similar a blockchain (purple) y KB (blue)
- Animación con pulse effect
- Se oculta automáticamente al completar el análisis

### 4. **Metadata Tracking**
- Logs de URLs procesadas
- Status de cada URL:
  - `URL_RETRIEVAL_STATUS_SUCCESS` ✅
  - `URL_RETRIEVAL_STATUS_FAILED` ❌
  - `URL_RETRIEVAL_STATUS_UNSAFE` ⚠️

---

## 📁 Archivos Modificados

### Backend

#### 1. `api/_services/url-context-service.ts`
**Cambios principales:**
- ✅ Eliminado web scraper custom
- ✅ Agregado método `validateUrlForContext()` para validación
- ✅ Agregado método `processUrlContextMetadata()` para procesar respuestas
- ✅ Método `createContextData()` para tracking
- ✅ Sistema de caché mantendo para optimización

**Métodos clave:**
```typescript
// Validar URL antes de enviar a Gemini
await validateUrlForContext(url: string): Promise<{ valid: boolean; error?: string }>

// Procesar metadata de respuesta
processUrlContextMetadata(urlMetadata: UrlMetadata[]): { 
  successful: string[]; 
  failed: string[]; 
  unsafe: string[] 
}

// Crear datos de contexto para tracking
createContextData(url: string, title?: string): ProcessedUrlContent
```

#### 2. `api/chat/stream.ts`
**Cambios principales:**
- ✅ Agregada función `detectUrls()` para detectar URLs en mensajes
- ✅ Configuración de tools API cuando se detectan URLs
- ✅ Extracción y logging de metadata de respuesta
- ✅ Manejo de errores de URL retrieval

**Implementación:**
```typescript
// Detectar URLs
const detectedUrls = detectUrls(messageContent);
const hasUrls = detectedUrls.length > 0;

// Configurar tool si hay URLs
const configTools: any = hasUrls ? [{ url_context: {} }] : undefined;

// Agregar a config de Gemini
const streamResponse = await client.models.generateContentStream({
  model: "gemini-2.5-flash-lite",
  contents: enrichedMessage,
  config: {
    systemInstruction,
    ...(configTools && { tools: configTools }),
    // ... resto de config
  }
});

// Procesar metadata
for await (const chunk of streamResponse) {
  if (hasUrls && chunk.candidates?.[0]?.urlContextMetadata) {
    urlContextMetadata = chunk.candidates[0].urlContextMetadata;
  }
}
```

### Frontend

#### 3. `src/hooks/chat/useChatStreaming.ts`
**Cambios principales:**
- ✅ Detección de URLs al inicio del flujo
- ✅ Estado `isUsingUrlContext` activado cuando hay URLs
- ✅ Priorización: URLs > Blockchain > KB
- ✅ Logs en desarrollo para debugging

**Flujo de detección:**
```typescript
const detectedUrls = detectUrls(messageText);
const hasUrls = detectedUrls.length > 0;

if (hasUrls) {
  setIsUsingUrlContext(true);
  setBlockchainAction(null);
  setIsSearchingKB(false);
  console.log('🔗 URLs detected:', detectedUrls.length);
} else if (blockchainDetection.isBlockchain) {
  // ... blockchain logic
} else {
  // ... KB logic
}
```

#### 4. `src/pages/Chat.tsx`
**Cambios principales:**
- ✅ Indicador visual cyan para URL context
- ✅ Consistente con indicadores de blockchain y KB
- ✅ Animación smooth con framer-motion

**Componente:**
```tsx
{isUsingUrlContext && (
  <motion.div className="mb-4 flex items-center justify-center">
    <div className="px-4 py-2 border border-cyan-500/30 rounded-xl bg-cyan-900/20 backdrop-blur-sm">
      <div className="relative">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping absolute"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
      </div>
      <span className="text-cyan-300 font-medium text-sm">🔗 Analyzing URL content...</span>
    </div>
  </motion.div>
)}
```

---

## 🎯 Casos de Uso

### 1. Análisis de Artículos
```
Usuario: Analiza este artículo https://example.com/article
Nuxbee: [Lee el contenido del artículo y proporciona análisis]
```

### 2. Comparación de Documentos
```
Usuario: Compara https://doc1.com con https://doc2.com
Nuxbee: [Compara ambos documentos y muestra diferencias]
```

### 3. Extracción de Datos
```
Usuario: Extrae los precios de https://pricing-page.com
Nuxbee: [Extrae y formatea la información de precios]
```

### 4. Análisis de Código
```
Usuario: Explica este código https://github.com/repo/file.ts
Nuxbee: [Analiza el código y explica su funcionalidad]
```

---

## 🔧 Configuración

### Variables de Entorno
```bash
GEMINI_API_KEY=your_api_key_here
```

### Modelos Soportados
- ✅ gemini-2.5-flash-lite (actual)
- ✅ gemini-2.5-flash
- ✅ gemini-2.5-pro

### Limitaciones
- **Máximo URLs por request:** 20
- **Tamaño máximo por URL:** 34MB
- **Tipos soportados:** HTML, JSON, PDF, Imágenes (PNG, JPEG, WEBP, BMP)
- **No soportados:** Videos de YouTube, Google Docs, contenido con paywall

---

## 📊 Logs y Debugging

### Frontend (Development Mode)
```javascript
🔗 [FRONTEND] URLs detected: 2
🔗 [FRONTEND] Sending message with URLs: {
  endpoint: '/api/chat/stream',
  urlCount: 2,
  urls: ['https://example.com', 'https://another.com']
}
```

### Backend
```javascript
🔗 URLs detected in message: 2
🔗 URLs: https://example.com, https://another.com
✅ URL context tool enabled for request
🤖 Generating response...
📥 Collecting response from Gemini...
✅ Collected 45 chunks (1250 chars) from Gemini
🔗 URL Context Results: 2 successful, 0 failed
```

---

## ✅ Testing

### Local Testing
1. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. En el chat, enviar mensaje con URL:
   ```
   Analiza https://nuxchain.app
   ```

3. Verificar:
   - ✅ Indicador cyan aparece
   - ✅ Logs en consola del navegador
   - ✅ Logs en terminal del servidor
   - ✅ Respuesta incluye análisis del contenido

### Vercel Testing
1. Deploy a Vercel:
   ```bash
   vercel deploy
   ```

2. Verificar mismos casos de prueba
3. Revisar logs en Vercel Dashboard

---

## 🚀 Optimizaciones Futuras

### Posibles Mejoras
1. **Cache de URLs:** Implementar cache persistente para URLs frecuentes
2. **Análisis Profundo:** Agregar análisis de links internos
3. **Extracción Estructurada:** Usar structured outputs para datos específicos
4. **Combinación con Search:** Usar junto con Google Search grounding
5. **Preview de URLs:** Mostrar preview card antes de analizar

### Integración Avanzada
```typescript
// Combinar URL context con Google Search
const tools = [
  { url_context: {} },
  { google_search: {} }
];
```

---

## 📚 Referencias

- **Documentación Oficial:** https://ai.google.dev/gemini-api/docs/url-context
- **Cookbook:** https://github.com/google-gemini/cookbook
- **SDK TypeScript:** https://www.npmjs.com/package/@google/genai

---

## 🐛 Troubleshooting

### URLs no se procesan
- Verificar que la URL sea pública (no requiere login)
- Confirmar que no está detrás de paywall
- Verificar que el tipo de contenido sea soportado

### Errores de timeout
- URLs muy grandes pueden tardar más
- Considerar aumentar timeout en serverless config
- Verificar límites de rate limiting

### Metadata no disponible
- Algunos modelos pueden no retornar metadata
- Verificar versión del SDK
- Logs pueden mostrar el problema específico

---

**Implementado por:** GitHub Copilot  
**Revisión:** Diciembre 14, 2025  
**Status:** ✅ Completado y funcional en local y Vercel
