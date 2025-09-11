import { useRef, useEffect, useState } from 'react'
import MessageItem from './MessageItem'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  messages: Message[]
  isLoading: boolean
  shouldAutoScroll?: boolean
}

export default function ChatMessage({ messages, isLoading, shouldAutoScroll = true }: ChatMessageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const isNearBottom = () => {
    if (!containerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    return scrollHeight - scrollTop - clientHeight < 100
  }

  // Detectar cuando el usuario está haciendo scroll manualmente
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout
    
    const handleScroll = () => {
      setIsUserScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false)
      }, 1000)
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Auto-scroll inteligente
  useEffect(() => {
    if (!shouldAutoScroll) return
    
    const newMessageCount = messages.length
    const hasNewMessage = newMessageCount > lastMessageCount
    
    if (hasNewMessage) {
      // Solo hacer scroll automático si:
      // 1. Es el primer mensaje
      // 2. El usuario está cerca del final
      // 3. El usuario no está scrolleando activamente
      if (newMessageCount === 1 || (!isUserScrolling && isNearBottom())) {
        setTimeout(scrollToBottom, 100)
      }
    }
    
    setLastMessageCount(newMessageCount)
  }, [messages, shouldAutoScroll, isUserScrolling, lastMessageCount])

  return (
    <div className="relative">
      <div ref={containerRef} className="px-6 py-4 space-y-6">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scroll to bottom button */}
      {isUserScrolling && !isNearBottom() && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-32 right-4 z-30 bg-purple-600/90 hover:bg-purple-700 text-white p-3 rounded-full shadow-xl backdrop-blur-sm border border-purple-500/30 transition-all duration-300 hover:scale-110 hover:shadow-purple-500/25"
          aria-label="Ir al final de la conversación"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  )
}