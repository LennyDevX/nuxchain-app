import { useState } from 'react'
import toast from 'react-hot-toast'
import ChatMessage from '../components/chat/ChatMessage'
import InputTextArea from '../components/chat/InputTextArea'
import SendMessageButton from '../components/chat/SendMessageButton'
import WelcomeScreen from '../components/chat/WelcomeScreen'
import { useChatStreaming } from '../hooks/chat/useChatStreaming'

function Chat() {
  const [message, setMessage] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)
  const { messages, isLoading, isStreaming, sendMessage } = useChatStreaming()

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
        <div className="flex-1 overflow-y-auto pb-32 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30">
          {showWelcome ? (
            <WelcomeScreen onQuestionSelect={handleQuestionSelect} />
          ) : (
            <ChatMessage messages={messages} isLoading={isLoading || isStreaming} />
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-brand-black-600/50 backdrop-blur-glass z-10">
          <div className="max-w-4xl mx-auto">
          <div className="px-6 py-4">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <InputTextArea
                    value={message}
                    onChange={setMessage}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || isStreaming}
                    placeholder="Ask me about blockchain, cryptocurrencies, NFTs, DeFi..."
                  />
                </div>
                <div className="flex-shrink-0">
                  <SendMessageButton
                    disabled={!message.trim() || isLoading || isStreaming}
                    isLoading={isLoading || isStreaming}
                    onClick={() => handleSendMessage()}
                  />
                </div>
              </div>
            </form>
            
            <p className="text-xs text-white/40 mt-3 text-center">
              🤖 Powered by Gemini AI • Press Enter to send, Shift+Enter for new line
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat