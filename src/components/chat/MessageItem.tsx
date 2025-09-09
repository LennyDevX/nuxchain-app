import MarkdownPreview from '@uiw/react-markdown-preview';
import AnimatedAILogo from '../../ui/AnimatedAILogo'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MessageItemProps {
  message: Message
}

export default function MessageItem({ message }: MessageItemProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          {message.role === 'user' ? (
            <div className="w-8 h-8 rounded-full bg-gradient-secondary flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          ) : (
            <AnimatedAILogo size="medium" className="flex-shrink-0" />
          )}
          
          {/* Message Content */}
          <div className={`rounded-2xl px-4 py-3 ${
            message.role === 'user'
              ? 'bg-gradient-to-r from-brand-purple-600 to-brand-purple-700 text-white shadow-lg border border-brand-purple-500/30'
              : 'bg-white/10 text-white border border-white/20'
          }`}>
            {message.role === 'assistant' ? (
              <MarkdownPreview
                source={message.content}
                style={{
                  backgroundColor: 'transparent',
                  color: '#f3f4f6',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
                wrapperElement={{
                  'data-color-mode': 'dark'
                }}
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            )}
            <p className={`text-xs mt-2 ${
              message.role === 'user' ? 'text-white/70' : 'text-white/50'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}