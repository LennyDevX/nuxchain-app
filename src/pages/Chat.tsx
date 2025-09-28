import { useState } from 'react'
import toast from 'react-hot-toast'
import ChatMessage from '../components/chat/ChatMessage'
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
      handleSendMessage(e as any)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black-DEFAULT flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col">
        {/* Header */}
       

        {/* Messages Container or Welcome Screen */}
        <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 ${
          isMobile ? 'pb-32' : 'pb-32'
        }`}>
          {showWelcome ? (
            <WelcomeScreen onQuestionSelect={handleQuestionSelect} />
          ) : (
            <ChatMessage messages={messages} isLoading={isLoading || isStreaming} />
          )}
        </div>

        {/* Input Area */}
        <div className={`fixed left-0 right-0 border-t border-white/10 bg-brand-black-600/50 backdrop-blur-glass z-10 bottom-0 ${
          optimizationConfig.reduceAnimations ? '' : 'transition-all duration-300'
        } ${
          isDragging ? 'pointer-events-none' : ''
        }`} style={{
          transform: isDragging ? `translateY(${Math.max(0, -dragY)}px)` : 'none'
        }}>
          <div className="max-w-4xl mx-auto">
          <div className={`${
            isMobile ? 'px-4 py-4' : 'px-6 py-4'
          }`}>

            
            <form onSubmit={handleSendMessage} className="relative">
              {/* Indicador de herramienta activa */}
              {isUsingUrlContext && (
                <div className="flex items-center space-x-2 mb-3 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-xs font-medium">Analysis URL Context</span>
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
                    placeholder={isMobile ? "Ask Nuvim" : "Ask Nuvim"}
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