import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { getOptimizedFontSize } from '../../utils/mobile/performanceOptimization'

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
      className={`relative w-full ${
        disabled ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onKeyDown={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Chat input"
          aria-disabled={disabled}
          maxLength={maxLength}
          className={`w-full bg-transparent border-none text-white placeholder-white/30 focus:outline-none focus:ring-0 resize-none py-3 jersey-20-regular transition-all ${
            isMobile 
              ? 'min-h-[44px] max-h-[100px] text-base px-0' 
              : 'min-h-[48px] max-h-[120px] text-lg px-0'
          } ${
            isMobile ? 'leading-snug' : 'leading-relaxed'
          } disabled:cursor-not-allowed`}
          style={{
            fontSize: getOptimizedFontSize(isMobile ? 16 : 18, isMobile) + 'px',
          }}
          rows={1}
        />

        

        {/* Character Counter */}
        {charCount > maxLength * 0.7 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute right-0 -top-6 text-sm jersey-20-regular px-2 py-0.5 rounded-lg backdrop-blur-sm pointer-events-none ${
              isAtLimit 
                ? 'text-red-400 font-bold' 
                : isNearLimit 
                  ? 'text-yellow-400' 
                  : 'text-white/30'
            }`}
          >
            {charCount}/{maxLength}
          </motion.div>
        )}
    </motion.div>
  )
}