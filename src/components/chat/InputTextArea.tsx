import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { getMobileOptimizationConfig, getOptimizedFontSize } from '../../utils/mobile/performanceOptimization'

interface InputTextAreaProps {
  value: string
  onChange: (value: string) => void
  onKeyPress: (e: React.KeyboardEvent) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
}

export default function InputTextArea({
  value,
  onChange,
  onKeyPress,
  disabled = false,
  placeholder = "Ask me about blockchain, cryptocurrencies, NFTs, DeFi, smart contracts...",
  maxLength = 2000
}: InputTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobile()
  const optimizationConfig = getMobileOptimizationConfig()

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const maxHeight = isMobile ? 100 : 120
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
    }
  }, [value, isMobile])

  // Character count logic
  const charCount = value.length
  const isNearLimit = charCount > maxLength * 0.8
  const isAtLimit = charCount >= maxLength

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: 0.3,
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
      className="relative w-full"
    >
      <div className={`relative inline-block w-full ${
        disabled ? 'opacity-70 cursor-not-allowed' : ''
      }`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onKeyDown={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Chat input - Ask questions about blockchain and Web3"
          aria-disabled={disabled}
          maxLength={maxLength}
          className={`w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 focus:bg-white/8 resize-none backdrop-blur-md overflow-hidden jersey-20-regular ${
            isMobile 
              ? 'px-4 py-4 min-h-[48px] max-h-[100px] text-base' 
              : 'px-4 py-4 min-h-[52px] max-h-[120px] text-lg'
          } ${
            isMobile ? 'leading-snug' : 'leading-relaxed'
          } ${
            optimizationConfig.reduceAnimations 
              ? 'transition-colors duration-150' 
              : 'transition-all duration-300'
          } hover:bg-white/7 hover:border-white/15 disabled:cursor-not-allowed`}
          style={{
            fontSize: getOptimizedFontSize(isMobile ? 16 : 18, isMobile) + 'px',
            lineHeight: isMobile ? '1.5' : '1.6'
          }}
          rows={1}
        />

        

        {/* Character Counter */}
        {charCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute right-3 bottom-2.5 text-xs jersey-20-regular px-1.5 py-0.5 rounded-full backdrop-blur-sm pointer-events-none ${
              isAtLimit 
                ? 'text-red-200 bg-red-500/20 border border-red-500/30' 
                : isNearLimit 
                  ? 'text-yellow-200 bg-yellow-500/20 border border-yellow-500/30' 
                  : 'text-white/30 bg-black/20'
            }`}
          >
            {charCount}/{maxLength}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}