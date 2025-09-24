import React, { memo, useCallback, useMemo } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import AnimatedAILogo from '../../ui/AnimatedAILogo'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { getOptimizedFontSize } from '../../utils/mobile/performanceOptimization'
import '../../styles/markdown-chat.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MessageItemProps {
  message: Message
}

const MessageItem: React.FC<MessageItemProps> = memo(function MessageItem({ message }: MessageItemProps) {
  const isMobile = useIsMobile()
  
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [])

  const markdownStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    color: '#f3f4f6',
    fontSize: getOptimizedFontSize(14, isMobile) + 'px',
    lineHeight: isMobile ? '1.4' : '1.5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
  }), [isMobile])



  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
      isMobile ? 'px-3 py-2' : 'px-6 py-3'
    }`}>
      <div className={`${
        isMobile ? 'max-w-[90%]' : 'max-w-[80%]'
      } ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start ${
          isMobile ? 'space-x-2' : 'space-x-3'
        } ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          {message.role === 'user' ? (
            <div className={`rounded-full bg-gradient-secondary flex items-center justify-center flex-shrink-0 ${
              isMobile ? 'w-6 h-6' : 'w-8 h-8'
            }`}>
              <svg className={`text-white ${
                isMobile ? 'w-3 h-3' : 'w-5 h-5'
              }`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          ) : (
            <AnimatedAILogo 
              size={isMobile ? "small" : "medium"} 
              className="flex-shrink-0" 
            />
          )}
          
          {/* Message Content */}
          <div className={`rounded-2xl ${
            isMobile ? 'px-3 py-2' : 'px-4 py-3'
          } ${
            message.role === 'user'
              ? 'bg-gradient-to-r from-brand-purple-600 to-brand-purple-700 text-white shadow-lg border border-brand-purple-500/30'
              : 'bg-white/10 text-white border border-white/20'
          }`}>
            {message.role === 'assistant' ? (
              <div className="markdown-chat-container">
                <MarkdownPreview
                  source={message.content}
                  style={markdownStyle}
                  wrapperElement={{
                    'data-color-mode': 'dark'
                  }}
                  components={{
                    h1: (props) => <h1 {...props} style={{ 
                      fontSize: isMobile ? '1.5rem' : '1.75rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      margin: '1.5rem 0 1rem 0',
                      paddingBottom: '0.5rem',
                      borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
                      lineHeight: '1.3'
                    }} />,
                    h2: (props) => <h2 {...props} style={{ 
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      fontWeight: '600',
                      color: '#e5e7eb',
                      margin: '1.25rem 0 0.75rem 0',
                      paddingLeft: '0.5rem',
                      borderLeft: '4px solid rgba(139, 92, 246, 0.6)',
                      lineHeight: '1.3'
                    }} />,
                    h3: (props) => <h3 {...props} style={{ 
                      fontSize: isMobile ? '1.125rem' : '1.25rem',
                      fontWeight: '600',
                      color: '#d1d5db',
                      margin: '1rem 0 0.5rem 0',
                      lineHeight: '1.4'
                    }} />,
                    p: (props) => <p {...props} style={{ 
                      margin: '0.75rem 0',
                      lineHeight: '1.6',
                      color: '#f3f4f6'
                    }} />,
                    strong: (props) => <strong {...props} style={{ 
                      fontWeight: '700',
                      color: '#ffffff',
                      textShadow: '0 0 1px rgba(255, 255, 255, 0.3)'
                    }} />,
                    ul: (props) => <ul {...props} style={{ 
                      margin: '1rem 0',
                      paddingLeft: isMobile ? '1.25rem' : '1.5rem',
                      listStyleType: 'none'
                    }} />,
                    li: (props) => <li {...props} style={{ 
                      margin: '0.5rem 0',
                      lineHeight: '1.5',
                      color: '#f3f4f6',
                      position: 'relative'
                    }}>
                      <span style={{
                        content: '•',
                        color: 'rgba(139, 92, 246, 0.8)',
                        fontWeight: 'bold',
                        position: 'absolute',
                        left: '-1rem'
                      }}>•</span>
                      {props.children}
                    </li>,
                    blockquote: (props) => <blockquote {...props} style={{ 
                      borderLeft: '4px solid rgba(139, 92, 246, 0.6)',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      margin: '1rem 0',
                      padding: '0.75rem 1rem',
                      borderRadius: '0 0.375rem 0.375rem 0'
                    }} />,
                    code: (props) => <code {...props} style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      color: '#fbbf24',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                      fontSize: '0.875em',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }} />,
                    pre: (props) => <pre {...props} style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '0.5rem',
                      padding: isMobile ? '0.75rem' : '1rem',
                      margin: '1rem 0',
                      overflowX: 'auto',
                      fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }} />
                  }}
                />
              </div>
            ) : (
              <p className={`leading-relaxed whitespace-pre-wrap ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>{message.content}</p>
            )}
            <p className={`mt-2 ${
              message.role === 'user' ? 'text-white/70' : 'text-white/50'
            } ${
              isMobile ? 'text-xs' : 'text-xs'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

// Comparación personalizada para React.memo
const areEqual = (prevProps: MessageItemProps, nextProps: MessageItemProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.message.timestamp.getTime() === nextProps.message.timestamp.getTime()
  )
}

export default memo(MessageItem, areEqual)