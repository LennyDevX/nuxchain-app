# 🔒 Módulos de Seguridad - NuxChain App

Esta carpeta contiene todos los módulos de seguridad centralizados de la aplicación.

## 📁 Archivos

### 1. `cors-policies.js`
**Configuración CORS y headers de seguridad**

```javascript
import { getCorsConfig } from './cors-policies.js';

// Usar en Express
const corsOptions = getCorsConfig(process.env.NODE_ENV);
app.use(cors(corsOptions));
```

**Exports:**
- `getCorsConfig(environment)` - CORS por entorno
- `applySecurityHeaders(req, res, next)` - Headers HTTP
- `websocketCorsCheck(origin, callback)` - CORS WebSocket
- `rateLimitConfig` - Config rate limiting
- `ipBlockingMiddleware(req, res, next)` - Bloqueo IPs

---

### 2. `environment-config.js`
**Gestión de variables de entorno**

```javascript
import environmentConfig from './environment-config.js';

if (environmentConfig.isProduction) {
  // Configuración de producción
}
```

**Propiedades:**
- `nodeEnv` - Entorno actual
- `isProduction` / `isDevelopment` / `isVercel`
- `geminiApiKey` / `serverApiKey`
- `security` - Config de seguridad
- `rateLimit` - Config rate limiting

---

### 3. `security-middleware.js`
**Suite completa para Express**

```javascript
import { setupSecurityMiddlewares } from './security-middleware.js';

const app = express();
setupSecurityMiddlewares(app); // ¡Una línea aplica todo!
```

**Exports:**
- `setupSecurityMiddlewares(app)` - **Función principal**
- `createRateLimit(options)` - Rate limiter
- `apiKeyAuth(req, res, next)` - Autenticación
- `attackDetection(req, res, next)` - Detección XSS/SQL Injection
- `securityHeaders` - Helmet config
- Y más...

**Aplica automáticamente:**
- ✅ Helmet (15+ headers)
- ✅ Rate limiting
- ✅ API Key auth
- ✅ Attack detection
- ✅ Input validation
- ✅ Security logging

---

### 4. `serverless-security.js`
**Versión ligera para Vercel**

```javascript
import { withSecurity } from './serverless-security.js';

async function handler(req, res) {
  // Tu lógica
}

export default withSecurity(handler); // ¡Una línea!
```

**Exports:**
- `withSecurity(handler)` - **Wrapper principal**
- `setupServerlessSecurity(req, res, next)` - Stack completo
- `serverlessRateLimit(options)` - Rate limiting ligero
- `basicAttackDetection(req, res, next)` - Detección ataques
- Y más...

**Aplica automáticamente:**
- ✅ CORS
- ✅ Security headers
- ✅ Rate limiting (100/min)
- ✅ Attack detection (5 tipos)
- ✅ Timeout (25s)
- ✅ Error handling

---

### 5. `websocket-security.js`
**Seguridad para WebSocket**

```javascript
import { setupSecureWebSocketServer } from './websocket-security.js';

const server = createServer(app);
const wss = setupSecureWebSocketServer(server);
```

**Exports:**
- `setupSecureWebSocketServer(server, options)` - **Función principal**
- `validateWebSocketOrigin(origin)` - Validación origen
- `validateWebSocketAuth(req)` - Autenticación
- `getWebSocketStats()` - Estadísticas

**Protecciones:**
- ✅ Validación de origen
- ✅ Rate limiting (5 conn/min)
- ✅ Validación tamaño (1MB)
- ✅ Ping/Pong keepalive
- ✅ Timeout (5-10 min)

---

## 🚀 Uso Rápido

### Para Express (Local)
```javascript
import { setupSecurityMiddlewares } from './security/security-middleware.js';
import { getCorsConfig } from './security/cors-policies.js';

const app = express();

// 1. CORS primero
app.use(cors(getCorsConfig(process.env.NODE_ENV)));

// 2. Seguridad completa
setupSecurityMiddlewares(app);

// 3. Tu app
app.use('/', routes);
```

### Para Serverless (Vercel)
```javascript
import { withSecurity } from './security/serverless-security.js';

async function myHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Tu lógica aquí
  return res.json({ success: true });
}

export default withSecurity(myHandler);
```

---

## 📚 Documentación Completa

- **[SECURITY_ARCHITECTURE.md](../SECURITY_ARCHITECTURE.md)** - Arquitectura completa
- **[SECURITY_IMPLEMENTATION_GUIDE.md](../SECURITY_IMPLEMENTATION_GUIDE.md)** - Guía paso a paso
- **[SECURITY_IMPROVEMENTS_SUMMARY.md](../SECURITY_IMPROVEMENTS_SUMMARY.md)** - Resumen de cambios

---

## 🔐 Variables de Entorno

### Requeridas en Producción
```env
GEMINI_API_KEY=your-gemini-api-key
SERVER_API_KEY=your-secure-api-key
NODE_ENV=production
```

### Opcionales en Desarrollo
```env
NODE_ENV=development
PORT=3002
REDIS_URL=redis://localhost:6379
```

---

## 🛡️ Protecciones Incluidas

### CORS
- Whitelist de dominios por entorno
- Preflight OPTIONS
- Headers configurables

### Security Headers
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### Rate Limiting
- 100 req/15min (prod)
- 1000 req/15min (dev)
- Headers informativos

### Attack Detection
- XSS (Cross-Site Scripting)
- SQL Injection
- Path Traversal
- Template Injection
- Code Injection

### Input Validation
- Content-Type check
- Body size limit (2MB)
- Dangerous headers removal
- User-Agent validation

---

## 🚨 Respuestas de Error

```javascript
// 429 - Rate Limit
{ "error": "Demasiadas solicitudes", "retryAfter": 847 }

// 401 - API Key Required
{ "error": "API Key requerida" }

// 403 - Invalid API Key
{ "error": "API Key inválida" }

// 400 - Malicious Content
{ "error": "Solicitud maliciosa detectada" }

// 408 - Timeout
{ "error": "Request Timeout" }
```

---

## ✅ Checklist para Nuevo Endpoint

- [ ] Importar `withSecurity` (serverless) o usar `setupSecurityMiddlewares` (Express)
- [ ] Validar método HTTP
- [ ] Validar input del usuario
- [ ] Manejar errores con try/catch
- [ ] Agregar logs
- [ ] Si es público, agregarlo a lista de endpoints públicos
- [ ] Probar con y sin API Key
- [ ] Verificar rate limiting

---

**Última actualización:** 13 de Octubre, 2025  
**Autor:** LennyDevX
