# 🚨 API Overload Notification System

## Overview
Sistema de notificación para avisar al usuario cuando la API de Google Gemini está sobrecargada (error 429/503). Se muestra automáticamente en el chat cuando el servicio experimenta alta demanda.

## Archivos Implementados

### 1. `src/components/ui/ApiOverloadNotificationUtils.ts`
**Archivo principal de utilidades** - Sin errores de React Hooks

#### Funciones Exportadas:

**`useApiOverloadNotification()`**
```typescript
export function useApiOverloadNotification() {
  return {
    showOverloadNotification: (retryTime?: number) => void,
    hideOverloadNotification: () => void
  }
}
```

**`showApiOverloadToast(retryAfter?: number)`**
- Muestra notificación toast amarilla/naranja
- Cuenta regresiva automática
- Se integra automáticamente con react-hot-toast
- Se cierra automáticamente cuando el contador llega a 0

#### Características:
✅ Icono de advertencia (🚨)
✅ Mensaje claro en español
✅ Cierre manual (botón X)
✅ Sin dependencies de hooks
✅ Compatible con Strict Mode

### 2. `src/components/ui/ApiOverloadNotification.tsx`
**Componente deprecated pero compatibles hacia atrás**
- Ahora simplemente re-exporta las funciones del archivo de utilidades
- Mantiene compatibilidad con código anterior

## Integración en el Chat

### `src/hooks/chat/useChatStreaming.ts`

**Importación corregida:**
```typescript
import { showApiOverloadToast } from '../../components/ui/ApiOverloadNotificationUtils'
```

**Manejo de Errores:**
```typescript
// En onError callback del StreamingService
if (errorWithExtras.isOverload || errorWithExtras.status === 503) {
  const retryDelay = errorWithExtras.retryAfter ?? 5
  showApiOverloadToast(retryDelay)
  return
}

// En catch block principal
if (errorWithExtras.isOverload || errorWithExtras.status === 503) {
  showApiOverloadToast(Math.ceil(retryDelay / 1000))
}
```

**Detección de Sobrecarga:**
- Status HTTP 503 (Service Unavailable)
- Status HTTP 429 (Too Many Requests)
- Mensajes que contengan "sobrecargado" o "overloaded"
- Flags específicas en la respuesta de error

## Errores Corregidos

### ✅ Antes:
- ❌ `react-hooks/set-state-in-effect`: setState sincrónico en effect
- ❌ `react-refresh/only-export-components`: Exportar funciones no-componentes de archivo UI
- ❌ `react-hooks/exhaustive-deps`: Dependencias incompletas
- ❌ Import incorrecto causando errores de compilación

### ✅ Ahora:
- ✅ Sin setState en effects (usar archivo de utilidades)
- ✅ Solo componentes exportados de archivos UI
- ✅ Dependencias correctas en todos los hooks
- ✅ Imports correctos desde ApiOverloadNotificationUtils

## Flujo de Funcionamiento

```
Usuario envía mensaje
    ↓
useChatStreaming → fetch a /api/chat/stream
    ↓
Respuesta con error 503/429
    ↓
Detectar errorWithExtras.isOverload
    ↓
Llamar showApiOverloadToast(retrySeconds)
    ↓
Toast amarillo/naranja aparece con contador regresivo
    ↓
Auto-cierra después de N segundos
    ↓
Usuario puede intentar nuevamente
```

## Uso en Otros Componentes

```typescript
// En cualquier componente que necesite mostrar la notificación:
import { showApiOverloadToast } from '@/components/ui/ApiOverloadNotificationUtils'

// Mostrar notificación
showApiOverloadToast(30) // Esperar 30 segundos

// O usar el hook:
import { useApiOverloadNotification } from '@/components/ui/ApiOverloadNotificationUtils'

function MyComponent() {
  const { showOverloadNotification, hideOverloadNotification } = useApiOverloadNotification()
  
  showOverloadNotification(60) // 60 segundos
  hideOverloadNotification()    // Cerrar manualmente
}
```

## Styling

El toast utiliza:
- **Colores**: Gradient `from-amber-500 to-orange-600`
- **Animaciones**: `animate-enter` y `animate-leave`
- **Posición**: Top center
- **Duración**: Automática según retryAfter
- **Tema**: Oscuro con texto blanco/naranja

## Dependencias

- ✅ `react-hot-toast`: Ya instalado en el proyecto
- ✅ Tailwind CSS: Para estilos (ya disponible)
- ✅ React 18+: Para hooks

## Testing

Para probar en desarrollo:

```typescript
// En el navegador console:
import { showApiOverloadToast } from '/src/components/ui/ApiOverloadNotificationUtils'
showApiOverloadToast(10) // Mostrará notificación por 10 segundos
```

## Mantenimiento

- El archivo `ApiOverloadNotificationUtils.ts` es la fuente única de verdad
- El componente `ApiOverloadNotification.tsx` es solo un wrapper para compatibilidad
- No requiere estado en componentes (totalmente stateless)
- Los errores se propagan desde `useChatStreaming`
