'use client'

import type { FC } from 'react'

/**
 * Componente visual para notificación de sobrecarga de API
 * Muestra countdown visual con animación circular
 */
interface ApiOverloadToastProps {
  timeRemaining: number
  retryAfter: number
}

export const ApiOverloadToast: FC<ApiOverloadToastProps> = ({ timeRemaining, retryAfter }) => {
  const progress = (timeRemaining / retryAfter) * 100
  const circumference = 18 * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-600/90 to-red-600/90 border border-orange-400/50 backdrop-blur-sm shadow-2xl max-w-md w-full animate-pulse transition-all duration-300">
      {/* Alert Icon */}
      <div className="flex-shrink-0 text-2xl">🚨</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm leading-tight mb-1">
          API Overloaded
        </p>
        <p className="text-white/90 text-xs leading-tight">
          Service is busy. Retrying in{' '}
          <span className="font-mono font-bold text-orange-100">{timeRemaining}s</span>
        </p>
      </div>

      {/* Countdown Circle */}
      <div className="flex-shrink-0 relative w-12 h-12 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 40 40">
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/20"
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-orange-200"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s ease-out'
            }}
          />
        </svg>
        <span className="relative text-center font-bold text-white text-sm">
          {timeRemaining}
        </span>
      </div>
    </div>
  )
}
