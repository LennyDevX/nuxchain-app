import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { getMobileOptimizationConfig } from '../../utils/mobile/performanceOptimization'

interface SendMessageButtonProps {
  disabled: boolean
  isLoading: boolean
  onClick: () => void
}

export default function SendMessageButton({ disabled, isLoading, onClick }: SendMessageButtonProps) {
  const isMobile = useIsMobile()
  const optimizationConfig = getMobileOptimizationConfig()
  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-purple-600 to-brand-purple-700 text-white font-medium shadow-lg border border-brand-purple-500/30 hover:from-brand-purple-500 hover:to-brand-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
        isMobile ? 'w-10 h-10 text-sm' : 'w-12 h-12'
      } ${
        optimizationConfig.reduceAnimations 
          ? 'transition-colors duration-150' 
          : 'transition-all duration-200'
      }`}
    >
      {isLoading ? (
        <div className={`animate-spin rounded-full border-2 border-white/30 border-t-white ${
          isMobile ? 'w-4 h-4' : 'w-5 h-5'
        }`}></div>
      ) : (
        <svg 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          className={isMobile ? 'w-4 h-4' : 'w-5 h-5'}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )}
    </button>
  )
}