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

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const maxHeight = isMobile ? 100 : 120
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      placeholder={isMobile ? "Ask Nuvim" : placeholder}
      disabled={disabled}
      className={`w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 focus:bg-white/8 resize-none backdrop-blur-md overflow-hidden ${
        isMobile ? 'px-3 pt-4 min-h-[40px] max-h-[100px] text-sm' : 'px-4 py-3 min-h-[52px] max-h-[120px] text-sm'
      } ${
        isMobile ? 'leading-normal' : 'leading-relaxed'
      } ${
        optimizationConfig.reduceAnimations 
          ? 'transition-colors duration-150' 
          : 'transition-all duration-300'
      } hover:bg-white/7 hover:border-white/15`}
      style={{
        fontSize: getOptimizedFontSize(14, isMobile) + 'px'
      }}
      rows={1}
    />
  )
}