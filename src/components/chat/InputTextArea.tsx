import { useRef, useEffect } from 'react'

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

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
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
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 focus:bg-white/8 resize-none min-h-[48px] max-h-[120px] text-sm leading-relaxed backdrop-blur-md transition-all duration-300 hover:bg-white/7 hover:border-white/15 overflow-hidden"
      rows={1}
    />
  )
}