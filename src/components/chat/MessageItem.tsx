import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import MarkdownPreview from '@uiw/react-markdown-preview';
import AnimatedAILogo from '../../ui/AnimatedAILogo'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { getOptimizedFontSize } from '../../utils/mobile/performanceOptimization'
import { SkillResultCard } from './skills/SkillResultCard'
import '../../styles/markdown-chat.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  skillResult?: {
    skillId: string
    status: 'loading' | 'success' | 'error'
    data?: unknown
    errorMessage?: string
  }
}

interface MessageItemProps {
  message: Message
  onSkillAnalyze?: (prompt: string) => void
}

const MessageItem: React.FC<MessageItemProps> = memo(function MessageItem({ message, onSkillAnalyze }: MessageItemProps) {
  const isMobile = useIsMobile()
  
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [])

  const markdownStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    color: '#f3f4f6',
    fontSize: getOptimizedFontSize(isMobile ? 16 : 18, isMobile) + 'px',
    lineHeight: isMobile ? '1.5' : '1.6',
    fontFamily: 'jersey-20-regular, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  }), [isMobile])



  return (
    <motion.div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
        isMobile ? 'px-3 py-2' : 'px-6 py-3'
      }`}
      initial={{ 
        opacity: 0, 
        x: message.role === 'user' ? 50 : -50,
        y: 10
      }}
      animate={{ 
        opacity: 1, 
        x: 0,
        y: 0
      }}
      transition={{ 
        duration: 0.4,
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
    >
      <motion.div 
        className={`${
          isMobile ? 'max-w-[90%]' : 'max-w-[80%]'
        } ${message.role === 'user' ? 'order-2' : 'order-1'}`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.3,
          delay: 0.1
        }}
      >
        <motion.div 
          className={`flex items-start ${
            isMobile ? 'space-x-2' : 'space-x-3'
          } ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {/* Avatar */}
          {message.role === 'user' ? (
            <motion.div 
              className={`rounded-full bg-gradient-secondary flex items-center justify-center flex-shrink-0 ${
                isMobile ? 'w-6 h-6' : 'w-8 h-8'
              }`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.4,
                delay: 0.05,
                type: 'spring',
                stiffness: 400,
                damping: 30
              }}
              whileHover={{ scale: 1.1 }}
            >
              <svg className={`text-white ${
                isMobile ? 'w-3 h-3' : 'w-5 h-5'
              }`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.4,
                delay: 0.05,
                type: 'spring',
                stiffness: 400,
                damping: 30
              }}
              whileHover={{ scale: 1.1 }}
            >
              <AnimatedAILogo 
                size={isMobile ? "small" : "small"} 
                className="flex-shrink-0" 
              />
            </motion.div>
          )}
          
          {/* Message Content */}
          <motion.div 
            className={`rounded-2xl ${
              isMobile ? 'px-3 py-2' : 'px-4 py-3'
            } ${
              message.role === 'user'
                ? 'bg-gradient-to-r from-brand-purple-600 to-brand-purple-700 text-white shadow-lg border border-brand-purple-500/30'
                : 'bg-white/10 text-white border border-white/20 shadow-lg backdrop-blur-md'
            }`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.4,
              delay: 0.2,
              type: 'spring',
              stiffness: 280,
              damping: 20
            }}
            whileHover={{ 
              y: -2,
              boxShadow: message.role === 'user' 
                ? '0 10px 30px rgba(139, 92, 246, 0.3)'
                : '0 10px 30px rgba(255, 255, 255, 0.1)'
            }}
          >
            {message.skillResult ? (
              <div className="min-w-[280px] max-w-full">
                <SkillResultCard
                  skillId={message.skillResult.skillId}
                  status={message.skillResult.status}
                  data={message.skillResult.data}
                  errorMessage={message.skillResult.errorMessage}
                  onAnalyze={onSkillAnalyze ? () => onSkillAnalyze(
                    `Analiza en detalle los resultados del skill "${message.skillResult!.skillId}" que acabo de ejecutar. Los datos son: ${JSON.stringify(message.skillResult!.data ?? {}).slice(0, 800)}`
                  ) : undefined}
                />
              </div>
            ) : message.role === 'assistant' ? (
              <motion.div 
                className="markdown-chat-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <MarkdownPreview
                  source={message.content}
                  style={markdownStyle}
                  wrapperElement={{
                    'data-color-mode': 'dark'
                  }}
                  components={{
                    h1: (props) => <h1 {...props} style={{ 
                      fontSize: isMobile ? '1.75rem' : '2rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      margin: '1.5rem 0 1rem 0',
                      paddingBottom: '0.5rem',
                      borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
                      lineHeight: '1.3',
                      fontFamily: 'jersey-15-regular, sans-serif'
                    }} />,
                    h2: (props) => <h2 {...props} style={{ 
                      fontSize: isMobile ? '1.5rem' : '1.75rem',
                      fontWeight: '600',
                      color: '#e5e7eb',
                      margin: '1.25rem 0 0.75rem 0',
                      paddingLeft: '0.5rem',
                      borderLeft: '4px solid rgba(139, 92, 246, 0.6)',
                      lineHeight: '1.3',
                      fontFamily: 'jersey-15-regular, sans-serif'
                    }} />,
                    h3: (props) => <h3 {...props} style={{ 
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      fontWeight: '600',
                      color: '#d1d5db',
                      margin: '1rem 0 0.5rem 0',
                      lineHeight: '1.4',
                      fontFamily: 'jersey-15-regular, sans-serif'
                    }} />,
                    p: (props) => <p {...props} style={{ 
                      margin: '0.75rem 0',
                      lineHeight: '1.7',
                      color: '#f3f4f6',
                      fontSize: isMobile ? '1rem' : '1.125rem'
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
              </motion.div>
            ) : (
              <motion.p 
                className={`jersey-20-regular leading-relaxed whitespace-pre-wrap ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {message.content}
              </motion.p>
            )}
            <motion.p 
              className={`mt-2 jersey-20-regular ${
                message.role === 'user' ? 'text-white/70' : 'text-white/50'
              } ${
                isMobile ? 'text-sm' : 'text-base'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {formatTime(message.timestamp)}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
})

// Comparación personalizada para React.memo
const areEqual = (prevProps: MessageItemProps, nextProps: MessageItemProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.message.timestamp.getTime() === nextProps.message.timestamp.getTime() &&
    prevProps.message.skillResult?.status === nextProps.message.skillResult?.status &&
    prevProps.message.skillResult?.data === nextProps.message.skillResult?.data
  )
}

export default memo(MessageItem, areEqual)