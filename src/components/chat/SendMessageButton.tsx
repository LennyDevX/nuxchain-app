import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'

interface SendMessageButtonProps {
  disabled: boolean
  isLoading: boolean
  onClick: () => void
  hasText?: boolean
}

export default function SendMessageButton({ disabled, isLoading, onClick, hasText = false }: SendMessageButtonProps) {
  const isMobile = useIsMobile()

  return (
    <motion.button
      type="submit"
      disabled={disabled}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: 0.4,
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ scale: hasText && !disabled ? 1.08 : 1 }}
      whileTap={{ 
        scale: hasText && !disabled ? 0.86 : 1,
        boxShadow: hasText && !disabled ? '0 0 24px rgba(168, 85, 247, 0.7)' : 'none'
      }}
      className={`
        relative flex items-center justify-center
        ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}
        rounded-full transition-all duration-300
        ${hasText && !disabled
          ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-500/50 hover:shadow-lg hover:shadow-purple-500/70 active:scale-95'
          : 'bg-white/10 hover:bg-white/15'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-brand-black-DEFAULT
        disabled:hover:shadow-none
      `}
    >
      {isLoading ? (
        <div className="animate-spin">
          <svg 
            className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} text-white`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <motion.svg 
          className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} text-white`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          animate={hasText && !disabled ? { x: [0, 1, 0], y: [0, -1, 0] } : {}}
          transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.4, ease: 'easeInOut' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </motion.svg>
      )}
    </motion.button>
  )
}