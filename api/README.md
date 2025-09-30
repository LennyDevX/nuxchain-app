# API de Nuxchain para Gemini

Documentación de la API para interactuar con el servicio de IA Gemini en Vercel.

## Endpoints Disponibles

### 1. Streaming de Chat Básico

**URL:** `/api/chat/stream`

**Método:** POST

**Descripción:** Proporciona respuestas generadas por Gemini de forma fluida con streaming semántico para una mejor experiencia de usuario.

**Parámetros de Solicitud:**

```json
{
  "message": "Tu pregunta o mensaje aquí",
  "conversationHistory": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?" }
  ],
  "streamingConfig": {
    "enableSemanticChunking": true,  // Activa el streaming semántico
    "enableContextualPauses": true, // Activa pausas contextuales
    "enableVariableSpeed": true     // Activa velocidad variable
  }
}
```

**Respuesta:**
- Tipo de contenido: `text/plain; charset=utf-8`
- Formato: Streaming de texto con respuestas semanticamente agrupadas
- Códigos de estado: 
  - 200: Éxito
  - 400: Error de validación
  - 401: No autorizado
  - 429: Límite de tasa excedido
  - 500: Error interno del servidor
  - 504: Timeout

**Ejemplo de Uso:**

```javascript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: '¿Qué es Nuxchain?',
    streamingConfig: {
      enableSemanticChunking: true
    }
  })
});

// Procesar la respuesta con streaming
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value, { stream: true }));
}
```

### 2. Streaming de Chat con Herramientas

**URL:** `/api/chat/stream-with-tools`

**Método:** POST

**Descripción:** Similar al endpoint básico, pero con capacidad para ejecutar herramientas especializadas como análisis de URLs y búsquedas en la base de conocimientos de Nuxchain.

**Parámetros de Solicitud:**

```json
{
  "message": "Analiza esta página: https://nuxchain.io",
  "conversationHistory": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?" }
  ],
  "useTools": true,  // Habilita o deshabilita el uso de herramientas
  "streamingConfig": {
    "enableSemanticChunking": true,
    "enableContextualPauses": true,
    "enableVariableSpeed": true
  }
}
```

**Herramientas Disponibles:**
- `url_context_tool`: Extrae y analiza contenido de URLs
- `nuxchain_search`: Busca información en la base de conocimientos de Nuxchain

**Respuesta:**
- Tipo de contenido: `text/plain; charset=utf-8`
- Formato: Streaming de texto con respuestas semanticamente agrupadas
- Códigos de estado: Igual que el endpoint básico

**Ejemplo de Uso:**

```javascript
const response = await fetch('/api/chat/stream-with-tools', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Busca información sobre staking en Nuxchain',
    useTools: true,
    streamingConfig: {
      enableSemanticChunking: true
    }
  })
});

// Procesar la respuesta con streaming
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value, { stream: true }));
}
```

## Parámetros Comunes

### streamingConfig

Este parámetro permite personalizar la experiencia de streaming:

| Propiedad | Tipo | Descripción | Valor Predeterminado |
|----------|------|------------|-------------------|
| enableSemanticChunking | Boolean | Activa/desactiva el agrupamiento semántico de respuestas | true |
| enableContextualPauses | Boolean | Activa/desactiva pausas contextuales entre chunks | true |
| enableVariableSpeed | Boolean | Activa/desactiva velocidad variable según la complejidad del contenido | true |

## Códigos de Error Comunes

- `400 Bad Request`: Error en los parámetros de la solicitud
- `401 Unauthorized`: Falta de autenticación o API key inválida
- `408 Request Timeout`: La solicitud superó el tiempo límite de ejecución
- `429 Too Many Requests`: Se ha excedido el límite de tasa de solicitudes
- `500 Internal Server Error`: Error interno del servidor
- `504 Gateway Timeout`: Timeout en la comunicación con el servicio Gemini

## Notas Importantes

1. **Límites de Vercel**: Las funciones en Vercel tienen un límite de tiempo de ejecución de 10-15 segundos. Se recomienda mantener las interacciones concisas.

2. **Streaming Semántico**: El servicio de streaming semántico mejora la legibilidad al agrupar ideas relacionadas y ajustar la velocidad según la complejidad del contenido.

3. **Autenticación**: Para endpoints no públicos, se requiere una API key en el encabezado `X-API-Key`.

4. **Formato de Historial**: El historial de conversación debe seguir el formato de roles `user` y `assistant`.

5. **Seguridad**: Se recomienda no compartir la API key públicamente y restringir el acceso a los endpoints sensibles.

## Versión

API de Nuxchain para Gemini v1.0