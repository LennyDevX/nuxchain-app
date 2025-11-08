import { useRef, useEffect, useState, useCallback } from 'react'
import MessageItem from './MessageItem'
import TypingIndicator from './TypingIndicator'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Message interface from ChatReducer
interface ChatMessageFromReducer {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: string
  conversationId?: string
  isStreaming?: boolean
  error?: string
}

interface ChatMessageProps {
  messages: (Message | ChatMessageFromReducer)[]
  isLoading: boolean
  shouldAutoScroll?: boolean
}

export default function ChatMessage({ messages, isLoading, shouldAutoScroll = true }: ChatMessageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
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
    const threshold = 150
    return scrollHeight - scrollTop - clientHeight < threshold
  }, [])

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
        
        const isNear = checkIsNearBottom()
        if (isNear !== isNearBottomCached) {
          setIsNearBottomCached(isNear)
        }
        
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = setTimeout(() => {
          setIsUserScrolling(false)
        }, 1500)
      }
    }

    // Use passive listener for better performance
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeoutRef.current)
    }
  }, [checkIsNearBottom, isNearBottomCached])

  // Track message count with a ref to avoid dependency issues
  const messageCountRef = useRef(messages.length)

  // Optimized auto-scroll with better conditions
  useEffect(() => {
    if (!shouldAutoScroll) return
    
    const newMessageCount = messages.length
    const lastCount = messageCountRef.current
    const hasNewMessage = newMessageCount > lastCount
    
    if (hasNewMessage) {
      const shouldScroll = newMessageCount === 1 || 
        (!isUserScrolling && isNearBottomCached) ||
        (isLoading && isNearBottomCached)
      
      if (shouldScroll) {
        requestAnimationFrame(() => {
          setTimeout(scrollToBottom, 50)
        })
      }
    }
    
    messageCountRef.current = newMessageCount
  }, [messages.length, shouldAutoScroll, isUserScrolling, isNearBottomCached, isLoading, scrollToBottom])

  return (
    <div className="relative">
      <div ref={containerRef} className="px-6 py-4 space-y-6">
        {messages.map((message) => {
          // Map from ChatMessageFromReducer interface to Message interface
          let mappedMessage: Message;
          
          if ('text' in message) {
            // It's from the reducer (ChatMessageFromReducer)
            mappedMessage = {
              id: message.id,
              role: message.sender === 'user' ? 'user' : 'assistant',
              content: message.text || '',
              timestamp: typeof message.timestamp === 'string' 
                ? new Date(message.timestamp) 
                : new Date()
            };
          } else {
            // It's already a Message
            mappedMessage = {
              id: message.id,
              role: message.role,
              content: message.content || '',
              timestamp: typeof message.timestamp === 'string' 
                ? new Date(message.timestamp) 
                : message.timestamp
            };
          }
          
          return <MessageItem key={message.id} message={mappedMessage} />
        })}
        
        {/* Loading indicator with TypingIndicator component */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  {/* AI Agent icon */}
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                  <TypingIndicator isVisible={isLoading} size="medium" />
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
          aria-label="Go to the end of the conversation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  )
}