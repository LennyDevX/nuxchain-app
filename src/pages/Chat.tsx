import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAccount, useSignMessage } from 'wagmi'
import ChatMessageComponent from '../components/chat/ChatMessage.tsx'
import InputTextArea from '../components/chat/InputTextArea'
import SendMessageButton from '../components/chat/SendMessageButton'
import PauseButton from '../components/chat/PauseButton'
import WelcomeScreen from '../components/chat/WelcomeScreen'
import SkillsPanel from '../components/ai/SkillsPanel'
import { SubscriptionModal } from '../components/chat/subscription/SubscriptionModal.tsx'
import { SkillsShowcaseModal } from '../components/chat/subscription/SkillsShowcaseModal.tsx'

import { useChatStreaming } from '../hooks/chat/useChatStreaming'
import { useFirebaseConversations } from '../hooks/chat/useFirebaseConversations'
import { useIsMobile } from '../hooks/mobile/useIsMobile'
import { useChatNavbar } from '../hooks/mobile/useChatNavbar'
import { getMobileOptimizationConfig } from '../utils/mobile/performanceOptimization'
import { chatLogger } from '../utils/log/chatLogger'
import { useSubscription } from '../context/SubscriptionContext'
import type { StoredConversation } from '../components/chat/core/conversationManager'
import { GEMINI_MODELS } from '../constants/subscription'
import type { GeminiModel } from '../constants/subscription'

const PANEL_WIDTH = 320 // px — matches w-80

/** Builds the canonical sign message (must match api/_middlewares/wallet-auth.ts) */
function buildSignMessage(walletAddress: string, timestamp: number): string {
  return `NuxChain AI Authentication\n\nWallet: ${walletAddress.toLowerCase()}\nTimestamp: ${timestamp}\nDomain: nuxchain.app\n\nBy signing you grant NuxBee AI access to your on-chain activity to personalize responses. No transaction is executed.`
}

function Chat() {
  const [message, setMessage] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(() => {
    // Load from localStorage or use default
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedGeminiModel') as GeminiModel) || 'gemini-flash'
    }
    return 'gemini-flash'
  })

  const { address: evmAddress, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { messages, isLoading, isStreaming, sendMessage, pauseStream, isUsingUrlContext, blockchainAction, isSearchingKB, clearMessages, loadHistory, currentConversationId, walletAuth, setWalletAuth } = useChatStreaming()
  const { history, saveConversation, deleteConversation } = useFirebaseConversations(evmAddress)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { isDragging, dragY } = useChatNavbar()
  const optimizationConfig = getMobileOptimizationConfig()
  const { tier, isPaid, isExpiringSoon } = useSubscription()

  // Clear walletAuth when wallet disconnects or changes
  useEffect(() => {
    if (!isConnected) {
      setWalletAuth(null)
    } else if (evmAddress && walletAuth && walletAuth.walletAddress.toLowerCase() !== evmAddress.toLowerCase()) {
      // Different wallet connected — clear old auth
      setWalletAuth(null)
    }
  }, [isConnected, evmAddress, walletAuth, setWalletAuth])

  const isWalletSigned = Boolean(walletAuth && evmAddress && walletAuth.walletAddress.toLowerCase() === evmAddress?.toLowerCase())

  const handleSignWallet = useCallback(async () => {
    if (!evmAddress) {
      toast.error('Connect your wallet first.')
      return
    }
    setIsSigning(true)
    try {
      const timestamp = Date.now()
      const msg = buildSignMessage(evmAddress, timestamp)
      const sig = await signMessageAsync({ message: msg })
      setWalletAuth({ walletAddress: evmAddress, message: msg, signature: sig })
      toast.success('✅ Wallet verified! NuxBee AI now has your full on-chain context.')
    } catch (err) {
      if ((err as Error)?.message?.includes('User rejected') || (err as Error)?.message?.includes('rejected')) {
        toast.error('Signature cancelled.')
      } else {
        toast.error('Failed to sign. Try again.')
      }
    } finally {
      setIsSigning(false)
    }
  }, [evmAddress, signMessageAsync, setWalletAuth])

  // Session lifecycle
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    chatLogger.logSessionStart()
    return () => {
      document.body.style.overflow = 'auto'
      chatLogger.logSessionEnd()
    }
  }, [])

  // Auto-scroll to bottom when messages change or streaming updates
  useEffect(() => {
    if (!showWelcome) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isStreaming, showWelcome])

  // Save to Firebase when streaming ends and we have messages
  const wasStreamingRef = useRef(false)
  useEffect(() => {
    if (wasStreamingRef.current && !isStreaming && messages.length > 0) {
      const convId = currentConversationId ?? `conv_${Date.now()}`
      // Convert Message[] to ChatMessage[]
      const chatMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.role as 'user' | 'assistant',
        timestamp: msg.timestamp.toISOString(),
        isStreaming: msg.isStreaming,
        error: msg.error,
      }))
      saveConversation(chatMessages, convId)
    }
    wasStreamingRef.current = isStreaming
  }, [isStreaming, messages, saveConversation, currentConversationId])

  const handleLoadHistory = (conv: StoredConversation) => {
    if (confirm('Load this conversation? Current messages will be replaced.')) {
      if (loadHistory) {
        loadHistory(conv.id);
        setShowWelcome(false);
      }
    }
  }

  const handleDeleteHistory = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation()
    deleteConversation(convId)
  }

  const handleNewChat = () => {
    clearMessages()
    setShowWelcome(true)
    setMessage('')
  }

  const handleModelChange = (newModel: GeminiModel) => {
    setSelectedModel(newModel)
    localStorage.setItem('selectedGeminiModel', newModel)
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!message.trim() || isLoading || isStreaming) return
    if (showWelcome) setShowWelcome(false)
    try {
      chatLogger.logMessageEvent({ type: 'SEND', messageId: `user_${Date.now()}`, sender: 'user', contentPreview: message.trim(), timestamp: new Date().toISOString() }, 'Chat')
      await sendMessage(message.trim())
      setMessage('')
    } catch (error) {
      chatLogger.logError('Error sending message', 'Chat', { message: message.trim().substring(0, 50) }, error as Error)
      toast.error('Error sending message. Cannot connect to NuxBee AI.')
    }
  }

  const handleQuestionSelect = async (question: string) => {
    setShowWelcome(false)
    try {
      chatLogger.logMessageEvent({ type: 'SEND', messageId: `user_${Date.now()}`, sender: 'user', contentPreview: question, timestamp: new Date().toISOString() }, 'WelcomeScreen')
      await sendMessage(question)
      setMessage('')
    } catch (error) {
      chatLogger.logError('Error sending selected question', 'WelcomeScreen', { question: question.substring(0, 50) }, error as Error)
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
    <div className="fixed inset-0 md:top-20 flex flex-col overflow-hidden text-white font-sans z-40 pb-[70px] md:pb-0 jersey-20-regular" style={{ background: 'transparent' }}>

      {/* ── Main layout: optional desktop sidebar + chat area ──── */}
        <div className="flex flex-1 min-h-0 relative overflow-hidden">

        {/* ── Desktop sidebar (slides in from left) ───────────── */}
        {!isMobile && (
          <AnimatePresence>
            {showPanel && (
              <motion.aside
                key="desktop-panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: PANEL_WIDTH, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="flex-shrink-0 bg-black/60 backdrop-blur-xl border-r border-white/10 overflow-hidden flex flex-col pt-4 pb-4"
                style={{ width: PANEL_WIDTH }}
              >
                <div className="flex-1 flex flex-col w-full h-full overflow-hidden px-3">
                  {/* New Chat Button */}
                  <button
                    onClick={handleNewChat}
                    className="flex justify-between items-center w-full bg-[#212121] hover:bg-[#303030] border border-[#3A3A3A] px-4 py-3 rounded-2xl transition-colors duration-200"
                  >
                    <span className="font-medium text-[15px]">New chat</span>
                    <span className="text-xl">✍️</span>
                  </button>

                  <div className="mt-8 flex-1 overflow-y-auto pr-1">
                    <p className="text-xs text-white/50 uppercase tracking-widest font-semibold ml-2 mb-3">AI Skills</p>
                    <SkillsPanel
                      onUpgrade={() => setShowSubscriptionModal(true)}
                      onShowAll={() => setShowSkillsModal(true)}
                    />
                    
                    {history.length > 0 && (
                      <div className="mt-8">
                        <p className="text-xs text-white/50 uppercase tracking-widest font-semibold ml-2 mb-3">History</p>
                        <div className="flex flex-col gap-2 px-2">
                          {history.map(conv => (
                            <button 
                              key={conv.id}
                              onClick={() => handleLoadHistory(conv)}
                              className="relative text-left p-3 pr-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                            >
                              <div className="text-sm font-medium truncate text-white/90 group-hover:text-purple-400">
                                {conv.title || 'Untitled Chat'}
                              </div>
                              <div className="text-[11px] text-white/40 mt-1">
                                {new Date(conv.timestamp).toLocaleDateString()}
                              </div>
                              <span
                                onClick={(e) => handleDeleteHistory(e, conv.id)}
                                className="absolute top-2 right-2 text-white/20 hover:text-red-400 transition-colors text-xs p-1"
                                title="Delete"
                              >✕</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Bottom: Plan Details */}
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A] px-2 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${tier === 'premium' ? 'bg-purple-500/20 text-purple-400' : tier === 'pro' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/70'}`}>
                        {tier === 'premium' ? '💎' : tier === 'pro' ? '⚡' : '🤖'}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-sm font-semibold capitalize">{tier} Plan</span>
                        {!isPaid && <span className="text-xs text-white/50">Free tier</span>}
                      </div>
                    </div>
                    {isExpiringSoon && (
                      <div className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                        ⚠️ Plan expires soon
                      </div>
                    )}
                    
                    {/* AI Model Selector (Pro & Premium only) */}
                    {isPaid && (
                      <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                        <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-2">AI Model</p>
                        <div className="space-y-2">
                          {(['gemini-pro', 'gemini-flash'] as const).map(modelId => {
                            const model = GEMINI_MODELS[modelId];
                            return (
                              <button
                                key={modelId}
                                onClick={() => handleModelChange(modelId)}
                                className={`w-full p-2.5 rounded-lg border transition-all text-left text-xs ${
                                  selectedModel === modelId
                                    ? 'border-blue-500 bg-blue-900/30 text-blue-100'
                                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{model.label}</span>
                                  <span className="text-sm">{selectedModel === modelId ? '✓' : ''}</span>
                                </div>
                                <div className="text-[11px] text-white/40 mt-0.5">{model.description}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {!isPaid ? (
                      <button
                        onClick={() => setShowSubscriptionModal(true)}
                        className="w-full text-center text-3xl font-medium py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <span>✨</span> Upgrade Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowSubscriptionModal(true)}
                        className="w-full text-left text-[13px] text-white/70 hover:text-white py-1.5 transition-colors"
                      >
                        Manage subscription
                      </button>
                    )}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        )}

        {/* Chat column */}
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">

          {/* ── Action bar (panel toggle mostly) ── */}
          <motion.div
            className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-4 z-20"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              {/* Panel toggle button */}
              <button
                onClick={() => setShowPanel(p => !p)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-white/70 transition-colors"
                aria-label="Toggle sidebar"
              >
                <span className="text-4xl">≡</span>
              </button>
              {/* App brand or model name next to toggle */}
            </div>
          </motion.div>

          {/* ── Messages / Welcome area ──────────────────────────── */}
          <div className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 min-h-0 flex flex-col px-4 md:px-6 ${showWelcome ? 'justify-center items-center' : ''}`}>
            {showWelcome ? (
              <div className="w-full max-w-3xl flex flex-col gap-6 w-full">
                <WelcomeScreen onQuestionSelect={handleQuestionSelect} />
                
                {/* ── Input inside flow when welcome ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="w-full"
                >
                <motion.form
                    onSubmit={handleSendMessage}
                    className="relative w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                  >
                    {/* ── Wallet Sign Banner ── */}
                    {isConnected && !isWalletSigned && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30"
                      >
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <span>🔐</span>
                          <span>Sign your wallet to unlock personalized AI context — your staking, NFTs & activity.</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleSignWallet}
                          disabled={isSigning}
                          className="flex-shrink-0 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                        >
                          {isSigning ? '⏳ Signing...' : '✍️ Sign Wallet'}
                        </button>
                      </motion.div>
                    )}
                    {!isConnected && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/50 text-center"
                      >
                        🔌 Connect your wallet to unlock personalized AI context
                      </motion.div>
                    )}
                    {isWalletSigned && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-3 flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-900/20 border border-green-500/30 text-sm text-green-400"
                      >
                        <span>✅</span>
                        <span>Wallet verified — NuxBee AI has your full on-chain context</span>
                        <button
                          type="button"
                          onClick={() => setWalletAuth(null)}
                          className="ml-auto text-white/30 hover:text-white/60 text-xs transition-colors"
                          title="Disconnect AI context"
                        >
                          ✕
                        </button>
                      </motion.div>
                    )}

                    {/* Indicators (URL, Blockchain, KB) */}
                    {(isUsingUrlContext || blockchainAction || isSearchingKB) && (
                      <motion.div className="mb-3 flex items-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="px-4 py-2 border border-purple-500/30 rounded-full bg-gradient-to-r from-purple-900/20 to-blue-900/20 flex items-center space-x-2 text-base text-white/80 jersey-20-regular shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                           {isUsingUrlContext && <span className="font-medium">🔍 Analyzing URL...</span>}
                           {blockchainAction && <span className="font-medium">{blockchainAction}</span>}
                           {isSearchingKB && !blockchainAction && (
                             <motion.span 
                               className="font-medium flex items-center gap-2"
                               animate={{ opacity: [1, 0.6, 1] }}
                               transition={{ repeat: Infinity, duration: 1.5 }}
                             >
                               <span className="inline-block animate-spin text-lg">⚡</span>
                               Searching Knowledge Base...
                             </motion.span>
                           )}
                        </div>
                      </motion.div>
                    )}

                    <motion.div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-2 px-3 flex items-end shadow-[0_4px_10px_rgba(0,0,0,0.5)] focus-within:shadow-[0_0_20px_rgba(168,85,247,0.25)] focus-within:border-purple-500/50 transition-all duration-500 gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
                      <div className="flex-1 min-w-0 py-1.5 pl-2">
                        <InputTextArea
                          value={message}
                          onChange={setMessage}
                          onKeyPress={handleKeyPress}
                          disabled={isLoading || isStreaming || !isWalletSigned}
                          placeholder={isWalletSigned ? "Ask Nuxbee..." : isConnected ? "Sign your wallet above to start chatting..." : "Connect your wallet to start..."}
                        />
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 pb-1.5">
                        {isStreaming && <PauseButton onClick={() => pauseStream()} />}
                        <SendMessageButton disabled={!message.trim() || isLoading || isStreaming || !isWalletSigned} isLoading={isLoading || isStreaming} onClick={() => handleSendMessage()} hasText={message.trim().length > 0} />
                      </div>
                    </motion.div>
                  </motion.form>

                  <motion.p className="text-[13px] text-white/40 mt-4 text-center font-medium jersey-20-regular" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}>
                    Nuxbee AI can make mistakes. Please double-check critical information.
                  </motion.p>
                </motion.div>
              </div>
            ) : (
              <div className="flex-1 max-w-4xl mx-auto w-full pb-6">
                <ChatMessageComponent messages={messages} isLoading={isLoading || isStreaming} />
                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>

          {/* ── Fixed bottom input area (only when chat active) ──────────────────────────────────── */}
          {!showWelcome && (
            <motion.div
              className={`flex-shrink-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-6 md:pt-10 ${optimizationConfig.reduceAnimations ? '' : 'transition-transform duration-300'} ${isDragging ? 'pointer-events-none' : ''}`}
              style={{
                transform: isDragging ? `translateY(${Math.max(0, -dragY)}px)` : 'none',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-4xl mx-auto w-full px-4 md:px-8 pb-4 pt-2">
                  <motion.form
                    onSubmit={handleSendMessage}
                    className="relative"
                  >
                    {/* ── Wallet Sign Banner (bottom input) ── */}
                    {isConnected && !isWalletSigned && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30"
                      >
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <span>🔐</span>
                          <span>Sign your wallet to unlock personalized AI context</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleSignWallet}
                          disabled={isSigning}
                          className="flex-shrink-0 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                        >
                          {isSigning ? '⏳ Signing...' : '✍️ Sign Wallet'}
                        </button>
                      </motion.div>
                    )}
                    {isWalletSigned && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-900/20 border border-green-500/30 text-xs text-green-400"
                      >
                        <span>✅ Wallet verified — personalized context active</span>
                        <button
                          type="button"
                          onClick={() => setWalletAuth(null)}
                          className="ml-auto text-white/30 hover:text-white/60 transition-colors"
                          title="Disconnect AI context"
                        >
                          ✕
                        </button>
                      </motion.div>
                    )}

                    {/* Indicators (URL, Blockchain, KB) */}
                    {(isUsingUrlContext || blockchainAction || isSearchingKB) && (
                      <motion.div className="mb-3 flex items-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="px-4 py-2 border border-purple-500/30 rounded-full bg-gradient-to-r from-purple-900/20 to-blue-900/20 flex items-center space-x-2 text-base text-white/80 jersey-20-regular shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                           {isUsingUrlContext && <span className="font-medium">🔍 Analyzing URL...</span>}
                           {blockchainAction && <span className="font-medium">{blockchainAction}</span>}
                           {isSearchingKB && !blockchainAction && (
                             <motion.span 
                               className="font-medium flex items-center gap-2"
                               animate={{ opacity: [1, 0.6, 1] }}
                               transition={{ repeat: Infinity, duration: 1.5 }}
                             >
                               <span className="inline-block animate-spin text-lg">⚡</span>
                               Searching Knowledge Base...
                             </motion.span>
                           )}
                        </div>
                      </motion.div>
                    )}

                    <motion.div 
                      className="bg-[#1e1e24]/20 backdrop-blur-xl border border-white/10 rounded-[32px] p-2 flex items-center shadow-2xl focus-within:shadow-[0_0_30px_rgba(168,85,247,0.15)] focus-within:border-purple-500/40 transition-all duration-500 pl-4 pr-2" 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <div className="flex-1 min-w-0">
                        <InputTextArea
                          value={message}
                          onChange={setMessage}
                          onKeyPress={handleKeyPress}
                          disabled={isLoading || isStreaming || !isWalletSigned}
                          placeholder={isWalletSigned ? "Ask Nuxbee..." : isConnected ? "Sign your wallet above to continue..." : "Connect wallet to start..."}
                        />
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 ml-2">
                        {isStreaming && <PauseButton onClick={() => pauseStream()} />}
                        <SendMessageButton disabled={!message.trim() || isLoading || isStreaming || !isWalletSigned} isLoading={isLoading || isStreaming} onClick={() => handleSendMessage()} hasText={message.trim().length > 0} />
                      </div>
                    </motion.div>
                  </motion.form>

                  <motion.p className="text-[13px] text-white/40 mt-3 mb-2 text-center font-medium jersey-20-regular" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    Nuxbee AI can make mistakes. Please double-check critical information.
                  </motion.p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Mobile Sidebar (slides in from left) ─── */}
      {isMobile && (
        <AnimatePresence>
          {showPanel && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowPanel(false)}
              />
              {/* Sidebar */}
              <motion.div
                key="mobile-panel"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed top-0 bottom-0 left-0 z-50 bg-black/80 backdrop-blur-xl border-r border-white/10 w-[280px] flex flex-col pt-4 pb-4 shadow-xl"
              >
                <div className="flex-1 flex flex-col  w-full h-full overflow-hidden px-3">
                  <div className="flex justify-between  items-center mb-6 pl-1 pr-1">
                     <span className="text-[17px] font-medium text-white/90">Nuxbee Gemini</span>
                     <button onClick={() => setShowPanel(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white/70">✕</button>
                  </div>
                  {/* New Chat Button */}
                  <button
                    onClick={() => { handleNewChat(); setShowPanel(false); }}
                    className="flex justify-between items-center w-full bg-[#212121] hover:bg-[#303030] border border-[#3A3A3A] px-4 py-3 rounded-2xl transition-colors duration-200"
                  >
                    <span className="font-medium text-[15px]">New chat</span>
                    <span className="text-xl">✍️</span>
                  </button>

                  <div className="mt-8 flex-1 overflow-y-auto pr-1">
                    <p className="text-xs text-white/50 uppercase tracking-widest font-semibold ml-2 mb-3">AI Skills</p>
                    <SkillsPanel
                      onUpgrade={() => { setShowPanel(false); setShowSubscriptionModal(true); }}
                      onShowAll={() => { setShowPanel(false); setShowSkillsModal(true); }}
                    />
                    
                    {history.length > 0 && (
                      <div className="mt-8">
                        <p className="text-xs text-white/50 uppercase tracking-widest font-semibold ml-2 mb-3">History</p>
                        <div className="flex flex-col gap-2 px-2">
                          {history.map(conv => (
                            <button 
                              key={conv.id}
                              onClick={() => { handleLoadHistory(conv); setShowPanel(false); }}
                              className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                            >
                              <div className="text-sm font-medium truncate text-white/90 group-hover:text-purple-400">
                                {conv.title || 'Untitled Chat'}
                              </div>
                              <div className="text-[11px] text-white/40 mt-1">
                                {new Date(conv.timestamp).toLocaleDateString()}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Bottom: Plan Details */}
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A] px-2 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${tier === 'premium' ? 'bg-purple-500/20 text-purple-400' : tier === 'pro' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/70'}`}>
                        {tier === 'premium' ? '💎' : tier === 'pro' ? '⚡' : '🤖'}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-sm font-semibold capitalize">{tier} Plan</span>
                        {!isPaid && <span className="text-xs text-white/50">Free tier</span>}
                      </div>
                    </div>
                    {isExpiringSoon && (
                      <div className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                        ⚠️ Plan expires soon
                      </div>
                    )}
                    {!isPaid ? (
                      <button
                        onClick={() => { setShowPanel(false); setShowSubscriptionModal(true); }}
                        className="w-full text-center text-2xl font-medium py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <span>✨</span> Upgrade Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => { setShowPanel(false); setShowSubscriptionModal(true); }}
                        className="w-full text-left text-[13px] text-white/70 hover:text-white py-1.5 transition-colors"
                      >
                        Manage subscription
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* ── Modals ────────────────────────────────────────────── */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
      <SkillsShowcaseModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        onSubscribe={() => { setShowSkillsModal(false); setShowSubscriptionModal(true); }}
      />
    </div>
  )
}

export default Chat
