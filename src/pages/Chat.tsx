import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import ChatMessage from '../components/chat/ChatMessage.tsx'
import InputTextArea from '../components/chat/InputTextArea'
import SendMessageButton from '../components/chat/SendMessageButton'
import PauseButton from '../components/chat/PauseButton'
import WelcomeScreen from '../components/chat/WelcomeScreen'

import { useChatStreaming } from '../hooks/chat/useChatStreaming'
import { useIsMobile } from '../hooks/mobile/useIsMobile'
import { useChatNavbar } from '../hooks/mobile/useChatNavbar'
import { getMobileOptimizationConfig } from '../utils/mobile/performanceOptimization'
import { chatLogger } from '../utils/log/chatLogger'

function Chat() {
  const [message, setMessage] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)
  const { messages, isLoading, isStreaming, sendMessage, pauseStream, isUsingUrlContext } = useChatStreaming()
  const isMobile = useIsMobile()
  const { isDragging, dragY } = useChatNavbar()
  const optimizationConfig = getMobileOptimizationConfig()

  // Loguear inicio de sesión
  React.useEffect(() => {
    chatLogger.logSessionStart()
    return () => {
      chatLogger.logSessionEnd()
    }
  }, [])



  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!message.trim() || isLoading || isStreaming) return

    // Hide welcome screen when first message is sent
    if (showWelcome) {
      setShowWelcome(false)
    }

    try {
      chatLogger.logMessageEvent(
        {
          type: 'SEND',
          messageId: `user_${Date.now()}`,
          sender: 'user',
          contentPreview: message.trim(),
          timestamp: new Date().toISOString()
        },
        'Chat'
      )
      await sendMessage(message.trim())
      setMessage('')
    } catch (error) {
      chatLogger.logError(
        'Error al enviar mensaje',
        'Chat',
        {
          message: message.trim().substring(0, 50)
        },
        error as Error
      )
      toast.error('Error al enviar el mensaje. Asegúrate de que el servidor esté ejecutándose.')
    }
  }

  const handleQuestionSelect = async (question: string) => {
    setShowWelcome(false)
    // Auto-send the selected question
    try {
      chatLogger.logMessageEvent(
        {
          type: 'SEND',
          messageId: `user_${Date.now()}`,
          sender: 'user',
          contentPreview: question,
          timestamp: new Date().toISOString()
        },
        'WelcomeScreen'
      )
      await sendMessage(question)
      setMessage('') // Clear the input after sending
    } catch (error) {
      chatLogger.logError(
        'Error al enviar pregunta seleccionada',
        'WelcomeScreen',
        { question: question.substring(0, 50) },
        error as Error
      )
      toast.error('Error sending the selected question.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as React.FormEvent)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black-DEFAULT flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col">
        {/* Header */}

        {/* Messages Container or Welcome Screen */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 pb-32">
          {showWelcome ? (
            <WelcomeScreen onQuestionSelect={handleQuestionSelect} />
          ) : (
            <ChatMessage messages={messages} isLoading={isLoading || isStreaming} />
          )}
        </div>

        {/* Input Area */}
        <motion.div 
          className={`fixed left-0 right-0 z-10 bottom-2 ${optimizationConfig.reduceAnimations ? '' : 'transition-all duration-300'} ${isDragging ? 'pointer-events-none' : ''}`}
          style={{
            transform: isDragging ? `translateY(${Math.max(0, -dragY)}px)` : 'none'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="max-w-4xl mx-auto w-full">
            <div className={`${isMobile ? 'px-3 py-3 safe-area-inset-bottom' : 'px-6 py-4'}`}>
              <motion.form 
                onSubmit={handleSendMessage} 
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                {/* URL analysis indicator */}
                {isUsingUrlContext && (
                  <motion.div 
                    className="mb-2 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-3 py-1.5 border border-blue-500/30 rounded-lg bg-blue-900/20 flex items-center space-x-2 text-blue-400 animate-pulse">
                      <span className={`font-medium ${isMobile ? 'text-xs' : 'text-xs'}`}>Analyzing URL content...</span>
                    </div>
                  </motion.div>
                )}
              
                <motion.div 
                  className="flex items-end space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex-1 min-w-0">
                    <InputTextArea
                      value={message}
                      onChange={setMessage}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || isStreaming}
                      placeholder="Ask Nuxbee"
                    />
                  </div>
                  {isStreaming && (
                    <div className="flex-shrink-0 flex items-center justify-center pb-1">
                      <PauseButton onClick={() => pauseStream()} />
                    </div>
                  )}
                  <div className="flex-shrink-0 flex items-center justify-center pb-1">
                    <SendMessageButton
                      disabled={!message.trim() || isLoading || isStreaming}
                      isLoading={isLoading || isStreaming}
                      onClick={() => handleSendMessage()}
                      hasText={message.trim().length > 0}
                    />
                  </div>
                </motion.div>
              </motion.form>
              
              {!isMobile && (
                <motion.p 
                  className="text-xs text-white/40 mt-3 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  🤖 Powered by Gemini AI • Press Enter to send, Shift+Enter for new line
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Chat