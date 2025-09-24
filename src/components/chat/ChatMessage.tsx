import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import MessageItem from './MessageItem'
import { debounce } from '../../utils/performance/debounce'

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
  const [isNearBottomCached, setIsNearBottomCached] = useState(true)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastScrollPositionRef = useRef(0)

  // Optimized scroll to bottom with requestAnimationFrame
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [])

  // Memoized and optimized isNearBottom check
  const checkIsNearBottom = useCallback(() => {
    if (!containerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const threshold = 150 // Increased threshold for better UX
    return scrollHeight - scrollTop - clientHeight < threshold
  }, [])

  // Debounced scroll position update
  const updateScrollPosition = useMemo(
    () => debounce(() => {
      const isNear = checkIsNearBottom()
      if (isNear !== isNearBottomCached) {
        setIsNearBottomCached(isNear)
      }
    }, 100),
    [checkIsNearBottom, isNearBottomCached]
  )

  // Optimized scroll detection with throttling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop
      
      // Only process if scroll position actually changed significantly
      if (Math.abs(currentScrollTop - lastScrollPositionRef.current) > 5) {
        lastScrollPositionRef.current = currentScrollTop
        
        setIsUserScrolling(true)
        updateScrollPosition()
        
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = setTimeout(() => {
          setIsUserScrolling(false)
        }, 1500) // Increased timeout for better UX
      }
    }

    // Use passive listener for better performance
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeoutRef.current)
    }
  }, [updateScrollPosition])

  // Optimized auto-scroll with better conditions
  useEffect(() => {
    if (!shouldAutoScroll) return
    
    const newMessageCount = messages.length
    const hasNewMessage = newMessageCount > lastMessageCount
    
    if (hasNewMessage) {
      // Enhanced auto-scroll conditions:
      // 1. First message always scrolls
      // 2. User near bottom and not actively scrolling
      // 3. Loading state (streaming) should always scroll if near bottom
      const shouldScroll = newMessageCount === 1 || 
        (!isUserScrolling && isNearBottomCached) ||
        (isLoading && isNearBottomCached)
      
      if (shouldScroll) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          setTimeout(scrollToBottom, 50) // Reduced delay for better responsiveness
        })
      }
    }
    
    setLastMessageCount(newMessageCount)
  }, [messages, shouldAutoScroll, isUserScrolling, isNearBottomCached, isLoading, lastMessageCount, scrollToBottom])

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
      
      {/* Optimized scroll to bottom button */}
      {(isUserScrolling || !isNearBottomCached) && (
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