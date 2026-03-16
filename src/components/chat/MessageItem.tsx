import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import MarkdownPreview from '@uiw/react-markdown-preview';
import AnimatedAILogo from '../../ui/AnimatedAILogo'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { getOptimizedFontSize } from '../../utils/mobile/performanceOptimization'
import { SkillResultCard } from './skills/SkillResultCard'
import '../../styles/markdown-chat.css'

// Module-level markdown component maps — avoids creating new objects on every render/chunk
// which was defeating MarkdownPreview memoization and causing full re-parse per streaming chunk.
const MARKDOWN_COMPONENTS_MOBILE = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props} style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff', margin: '1.5rem 0 1rem 0', lineHeight: '1.3', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} style={{ fontSize: '1.35rem', fontWeight: '600', color: '#ffffff', margin: '1.25rem 0 0.75rem 0', lineHeight: '1.3', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} style={{ fontSize: '1.15rem', fontWeight: '600', color: '#e2e8f0', margin: '1rem 0 0.5rem 0', lineHeight: '1.4', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props} className="break-words" style={{ margin: '0.65rem 0', lineHeight: '1.7', color: '#e2e8f0', fontSize: '1.05rem' }} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong {...props} style={{ fontWeight: '700', color: '#ffffff', textShadow: '0 0 1px rgba(255, 255, 255, 0.3)' }} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul {...props} style={{ margin: '1rem 0', paddingLeft: '1.25rem', listStyleType: 'none' }} />,
  li: (props: React.HTMLAttributes<HTMLLIElement> & { children?: React.ReactNode }) => <li {...props} style={{ margin: '0.5rem 0', lineHeight: '1.5', color: '#f3f4f6', position: 'relative' }}><span style={{ content: '•', color: 'rgba(139, 92, 246, 0.8)', fontWeight: 'bold', position: 'absolute', left: '-1rem' }}>•</span>{props.children}</li>,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => <blockquote {...props} style={{ borderLeft: '4px solid rgba(139, 92, 246, 0.6)', backgroundColor: 'rgba(139, 92, 246, 0.1)', margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: '0 0.375rem 0.375rem 0' }} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => <code {...props} style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#fbbf24', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontFamily: '"Fira Code", "Monaco", "Consolas", monospace', fontSize: '0.875em', border: '1px solid rgba(139, 92, 246, 0.2)' }} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre {...props} style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '0.5rem', padding: '0.75rem', margin: '1rem 0', overflowX: 'auto', fontFamily: '"Fira Code", "Monaco", "Consolas", monospace', fontSize: '0.875rem' }} />,
};

const MARKDOWN_COMPONENTS_DESKTOP = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props} style={{ fontSize: '1.75rem', fontWeight: '600', color: '#ffffff', margin: '1.5rem 0 1rem 0', lineHeight: '1.3', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff', margin: '1.25rem 0 0.75rem 0', lineHeight: '1.3', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e2e8f0', margin: '1rem 0 0.5rem 0', lineHeight: '1.4', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props} className="break-words" style={{ margin: '0.85rem 0', lineHeight: '1.8', color: '#e2e8f0', fontSize: '1.125rem' }} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong {...props} style={{ fontWeight: '700', color: '#ffffff', textShadow: '0 0 1px rgba(255, 255, 255, 0.3)' }} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul {...props} style={{ margin: '1rem 0', paddingLeft: '1.5rem', listStyleType: 'none' }} />,
  li: (props: React.HTMLAttributes<HTMLLIElement> & { children?: React.ReactNode }) => <li {...props} style={{ margin: '0.5rem 0', lineHeight: '1.5', color: '#f3f4f6', position: 'relative' }}><span style={{ content: '•', color: 'rgba(139, 92, 246, 0.8)', fontWeight: 'bold', position: 'absolute', left: '-1rem' }}>•</span>{props.children}</li>,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => <blockquote {...props} style={{ borderLeft: '4px solid rgba(139, 92, 246, 0.6)', backgroundColor: 'rgba(139, 92, 246, 0.1)', margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: '0 0.375rem 0.375rem 0' }} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => <code {...props} style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#fbbf24', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontFamily: '"Fira Code", "Monaco", "Consolas", monospace', fontSize: '0.875em', border: '1px solid rgba(139, 92, 246, 0.2)' }} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre {...props} style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '0.5rem', padding: '1rem', margin: '1rem 0', overflowX: 'auto', fontFamily: '"Fira Code", "Monaco", "Consolas", monospace', fontSize: '1rem' }} />,
};

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
  isLoading?: boolean
}

const MessageItem: React.FC<MessageItemProps> = memo(function MessageItem({ message, onSkillAnalyze, isLoading }: MessageItemProps) {
  const isMobile = useIsMobile()
  
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [])

  const markdownStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    color: '#e2e8f0',
    fontSize: getOptimizedFontSize(isMobile ? 17 : 18, isMobile) + 'px',
    lineHeight: isMobile ? '1.8' : '1.75',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }), [isMobile])

  // Stable reference — only changes when breakpoint switches, not on every render/chunk
  const markdownComponents = useMemo(
    () => isMobile ? MARKDOWN_COMPONENTS_MOBILE : MARKDOWN_COMPONENTS_DESKTOP,
    [isMobile]
  )

  return (
    <motion.div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
        isMobile ? 'px-2 md:px-4 py-2 mt-2 mb-4' : 'px-6 py-4 mt-3 mb-6'
      }`}
      initial={{ 
        opacity: 0, 
        x: message.role === 'user' ? 40 : -40,
        y: 8,
        scale: 0.96,
      }}
      animate={{ 
        opacity: 1, 
        x: 0,
        y: 0,
        scale: 1,
      }}
      transition={{ 
        duration: 0.35,
        type: 'spring',
        stiffness: 380,
        damping: 28
      }}
    >
      <motion.div 
        className={`${
          message.role === 'user' 
            ? (isMobile ? 'max-w-[85%]' : 'max-w-[80%]') 
            : 'max-w-full flex-1'
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
            isMobile ? 'space-x-3' : 'space-x-4'
          } ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {/* Avatar */}
          {message.role === 'user' ? null : (
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
              className="mt-1"
            >
              {isLoading ? (
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0px rgba(168, 85, 247, 0)',
                      '0 0 32px rgba(168, 85, 247, 0.6)',
                      '0 0 56px rgba(99, 102, 241, 0.45)',
                      '0 0 32px rgba(168, 85, 247, 0.6)',
                      '0 0 0px rgba(168, 85, 247, 0)',
                    ],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="rounded-full"
                >
                  <AnimatedAILogo 
                    size={isMobile ? "small" : "small"} 
                    className="flex-shrink-0" 
                  />
                </motion.div>
              ) : (
                <AnimatedAILogo 
                  size={isMobile ? "small" : "small"} 
                  className="flex-shrink-0" 
                />
              )}
            </motion.div>
          )}
          
          {/* Message Content */}
          <motion.div 
            className={`w-full ${
              message.role === 'user'
                ? `rounded-3xl ${isMobile ? 'px-4 py-3' : 'px-5 py-4'} bg-[#22222a] text-white border border-white/5`
                : 'bg-transparent text-white pt-1'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.35,
              delay: 0.1,
              ease: "easeOut"
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
                  components={markdownComponents}
                />
              </motion.div>
            ) : (
              <motion.p 
                className={`font-sans leading-relaxed whitespace-pre-wrap ${
                  isMobile ? 'text-[1.05rem] leading-[1.6]' : 'text-lg'
                } text-[#e2e8f0] font-medium tracking-wide`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {message.content}
              </motion.p>
            )}
            <motion.p 
              className={`mt-2 font-sans ${
                message.role === 'user' ? 'text-white/40' : 'text-white/30'
              } ${
                isMobile ? 'text-xs' : 'text-sm'
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
    prevProps.message.skillResult?.data === nextProps.message.skillResult?.data &&
    prevProps.isLoading === nextProps.isLoading
  )
}

export default memo(MessageItem, areEqual)