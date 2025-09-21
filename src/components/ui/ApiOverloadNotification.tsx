import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import '../../styles/notifications.css'

interface ApiOverloadNotificationProps {
  isVisible: boolean
  retryAfter?: number
  onDismiss?: () => void
}

interface NotificationState {
  timeRemaining: number
  isRetrying: boolean
}

export default function ApiOverloadNotification({ 
  isVisible, 
  retryAfter = 30, 
  onDismiss 
}: ApiOverloadNotificationProps) {
  const [state, setState] = useState<NotificationState>({
    timeRemaining: retryAfter,
    isRetrying: false
  })

  useEffect(() => {
    if (!isVisible) return

    setState({
      timeRemaining: retryAfter,
      isRetrying: false
    })

    // Mostrar toast personalizado
    const toastId = toast.custom(
      (t) => (
        <div className={`api-overload-notification ${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {/* Icono de advertencia */}
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white text-glow">
                  Servicio Temporalmente Sobrecargado
                </p>
                <p className="mt-1 text-sm text-orange-100">
                  La API de Google Gemini está experimentando alta demanda. 
                  Las respuestas pueden tomar más tiempo o el servicio puede estar suspendido temporalmente.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex items-center text-orange-100 text-xs">
                    <div className="custom-spinner"></div>
                    Reintentando automáticamente...
                  </div>
                  {state.timeRemaining > 0 && (
                    <div className="text-orange-100 text-xs heartbeat">
                      Próximo intento en {state.timeRemaining}s
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-orange-400">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                onDismiss?.()
              }}
              className="notification-button w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ),
      {
        duration: retryAfter * 1000,
        position: 'top-center',
        id: 'api-overload-notification'
      }
    )

    // Contador regresivo
    const interval = setInterval(() => {
      setState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1
        if (newTimeRemaining <= 0) {
          clearInterval(interval)
          return { ...prev, timeRemaining: 0, isRetrying: true }
        }
        return { ...prev, timeRemaining: newTimeRemaining }
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      toast.dismiss(toastId)
    }
  }, [isVisible, retryAfter, onDismiss])

  return null
}

// Hook personalizado para manejar notificaciones de sobrecarga
export function useApiOverloadNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [retryAfter, setRetryAfter] = useState(30)

  const showOverloadNotification = (retryTime = 30) => {
    setRetryAfter(retryTime)
    setIsVisible(true)
  }

  const hideOverloadNotification = () => {
    setIsVisible(false)
    toast.dismiss('api-overload-notification')
  }

  return {
    isVisible,
    retryAfter,
    showOverloadNotification,
    hideOverloadNotification
  }
}

// Función utilitaria para mostrar notificación rápida
export function showApiOverloadToast(retryAfter = 30) {
  toast.custom(
    (t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">
                🚨 Servicio Sobrecargado
              </p>
              <p className="mt-1 text-sm text-orange-100">
                Google Gemini está experimentando alta demanda. Reintentando automáticamente en {retryAfter}s...
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-orange-400">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      duration: retryAfter * 1000,
      position: 'top-center',
      id: 'api-overload-quick-toast'
    }
  )
}