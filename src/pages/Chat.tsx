import React, { useState } from 'react'
import toast from 'react-hot-toast'
import ChatMessage from '../components/chat/ChatMessage.tsx'
import InputTextArea from '../components/chat/InputTextArea'
import SendMessageButton from '../components/chat/SendMessageButton'
import WelcomeScreen from '../components/chat/WelcomeScreen'

import { useChatStreaming } from '../hooks/chat/useChatStreaming'
import { useIsMobile } from '../hooks/mobile/useIsMobile'
import { useChatNavbar } from '../hooks/mobile/useChatNavbar'
import { getMobileOptimizationConfig } from '../utils/mobile/performanceOptimization'

function Chat() {
  const [message, setMessage] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)
  const { messages, isLoading, isStreaming, sendMessage, isUsingUrlContext } = useChatStreaming()
  const isMobile = useIsMobile()
  const { isDragging, dragY } = useChatNavbar()
  const optimizationConfig = getMobileOptimizationConfig()



  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!message.trim() || isLoading || isStreaming) return

    // Hide welcome screen when first message is sent
    if (showWelcome) {
      setShowWelcome(false)
    }

    try {
      await sendMessage(message.trim())
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error al enviar el mensaje. Asegúrate de que el servidor esté ejecutándose.')
    }
  }

  const handleQuestionSelect = async (question: string) => {
    setShowWelcome(false)
    // Auto-send the selected question
    try {
      await sendMessage(question)
      setMessage('') // Clear the input after sending
    } catch (error) {
      console.error('Error sending selected question:', error)
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
        <div className={`fixed left-0 right-0 border-t border-white/10 bg-brand-black-600/50 backdrop-blur-glass z-10 bottom-0 ${optimizationConfig.reduceAnimations ? '' : 'transition-all duration-300'} ${isDragging ? 'pointer-events-none' : ''}`} style={{
          transform: isDragging ? `translateY(${Math.max(0, -dragY)}px)` : 'none'
        }}>
          <div className="max-w-4xl mx-auto">
            <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
              <form onSubmit={handleSendMessage} className="relative">
                {/* URL analysis indicator */}
                {isUsingUrlContext && (
                  <div className="mb-3 flex items-center justify-center">
                    <div className="px-3 py-1.5 border border-blue-500/30 rounded-lg bg-blue-900/20 flex items-center space-x-2 text-blue-400 animate-pulse">
                      <span className="text-xs font-medium">Analyzing URL content...</span>
                    </div>
                  </div>
                )}
              
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <InputTextArea
                      value={message}
                      onChange={setMessage}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || isStreaming}
                      placeholder="Ask Nuvim"
                    />
                  </div>
                  <div className="flex-shrink-0 p-2">
                    <SendMessageButton
                      disabled={!message.trim() || isLoading || isStreaming}
                      isLoading={isLoading || isStreaming}
                      onClick={() => handleSendMessage()}
                      hasText={message.trim().length > 0}
                    />
                  </div>
                </div>
              </form>
              
              {!isMobile && (
                <p className="text-xs text-white/40 mt-3 text-center">
                  🤖 Powered by Gemini AI • Press Enter to send, Shift+Enter for new line
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat