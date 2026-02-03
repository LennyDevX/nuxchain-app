import toast from 'react-hot-toast'
import { ApiOverloadToast } from './ApiOverloadToast'

interface NotificationState {
  intervalId: NodeJS.Timeout | null
  toastId: string | null
}

const notificationState: NotificationState = {
  intervalId: null,
  toastId: null
}

// ============================================================================
// 🚨 HOOK: useApiOverloadNotification
// ============================================================================
/**
 * Hook personalizado para manejar notificaciones de sobrecarga de API
 * Proporciona métodos para mostrar y ocultar notificaciones
 */
export function useApiOverloadNotification() {
  const showOverloadNotification = (retryTime = 30) => {
    showApiOverloadToast(retryTime)
  }

  const hideOverloadNotification = () => {
    if (notificationState.intervalId) {
      clearInterval(notificationState.intervalId)
      notificationState.intervalId = null
    }
    if (notificationState.toastId) {
      toast.dismiss(notificationState.toastId)
      notificationState.toastId = null
    }
  }

  return {
    showOverloadNotification,
    hideOverloadNotification
  }
}

// ============================================================================
// 🚨 FUNCIÓN: showApiOverloadToast
// ============================================================================
/**
 * Muestra notificación de sobrecarga de API con countdown
 *
 * @param retryAfter - Segundos para reintento (default: 30)
 *
 * Features:
 * - Countdown visual actualizado cada segundo
 * - Componente React con animación SVG
 * - Auto-dismissible al terminar
 * - Gestión de estado limpio
 *
 * @example
 * ```tsx
 * catch (error) {
 *   if (error.status === 503) {
 *     showApiOverloadToast(30)
 *   }
 * }
 * ```
 */
export function showApiOverloadToast(retryAfter = 30): void {
  // Limpiar notificación anterior si existe
  if (notificationState.intervalId) {
    clearInterval(notificationState.intervalId)
    notificationState.intervalId = null
  }
  if (notificationState.toastId) {
    toast.dismiss(notificationState.toastId)
  }

  let timeRemaining = retryAfter

  // Mostrar toast inicial
  let toastId = toast.custom(
    <ApiOverloadToast timeRemaining={timeRemaining} retryAfter={retryAfter} />,
    {
      position: 'top-center',
      duration: Infinity
    }
  )

  notificationState.toastId = toastId

  // Actualizar countdown cada segundo
  notificationState.intervalId = setInterval(() => {
    timeRemaining -= 1

    if (timeRemaining > 0) {
      toast.dismiss(toastId)
      toastId = toast.custom(
        <ApiOverloadToast timeRemaining={timeRemaining} retryAfter={retryAfter} />,
        {
          position: 'top-center',
          duration: Infinity
        }
      )
      notificationState.toastId = toastId
    } else {
      clearInterval(notificationState.intervalId!)
      notificationState.intervalId = null
      toast.dismiss(toastId)
      notificationState.toastId = null

      toast.success('✨ Retrying API request...', {
        duration: 2000,
        position: 'top-center'
      })
    }
  }, 1000)
}
