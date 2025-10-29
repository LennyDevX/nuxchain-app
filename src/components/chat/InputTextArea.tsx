import { useRef, useEffect } from 'react'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { getMobileOptimizationConfig, getOptimizedFontSize } from '../../utils/mobile/performanceOptimization'

interface InputTextAreaProps {
  value: string
  onChange: (value: string) => void
  onKeyPress: (e: React.KeyboardEvent) => void
  disabled?: boolean
  placeholder?: string
}

export default function InputTextArea({
  value,
  onChange,
  onKeyPress,
  disabled = false,
  placeholder = "Ask me about blockchain, cryptocurrencies, NFTs, DeFi, smart contracts..."
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

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      placeholder={isMobile ? "Ask Nuxbee..." : placeholder}
      disabled={disabled}
      aria-label="Chat input - Ask questions about blockchain and Web3"
      aria-disabled={disabled}
      className={`w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 focus:bg-white/8 resize-none backdrop-blur-md overflow-hidden ${
        isMobile 
          ? 'px-4 py-4 min-h-[48px] max-h-[100px] text-base' 
          : 'px-4 py-4 min-h-[52px] max-h-[120px] text-sm'
      } ${
        isMobile ? 'leading-snug' : 'leading-relaxed'
      } ${
        optimizationConfig.reduceAnimations 
          ? 'transition-colors duration-150' 
          : 'transition-all duration-300'
      } hover:bg-white/7 hover:border-white/15`}
      style={{
        fontSize: getOptimizedFontSize(isMobile ? 15 : 14, isMobile) + 'px',
        lineHeight: isMobile ? '1.5' : '1.6'
      }}
      rows={1}
    />
  )
}