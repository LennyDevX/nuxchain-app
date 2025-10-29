import toast from 'react-hot-toast'

// Hook personalizado para manejar notificaciones de sobrecarga
export function useApiOverloadNotification() {
  const showOverloadNotification = (retryTime = 30) => {
    showApiOverloadToast(retryTime)
  }

  const hideOverloadNotification = () => {
    toast.dismiss('api-overload-notification')
  }

  return {
    showOverloadNotification,
    hideOverloadNotification
  }
}

// Función utilitaria para mostrar notificación rápida
export function showApiOverloadToast(retryAfter = 30) {
  let timeRemaining = retryAfter

  const interval = setInterval(() => {
    timeRemaining -= 1
    if (timeRemaining <= 0) {
      clearInterval(interval)
      toast.dismiss('api-overload-notification')
    }
  }, 1000)

  toast.custom(
    () => `Google Gemini está experimentando alta demanda. Por favor, espera...`,
    {
      duration: retryAfter * 1000,
      position: 'top-center',
      id: 'api-overload-notification',
      icon: '🚨'
    }
  )
}
