import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { makeToastStyle } from '../utils/toasts/toastStyles'
import { useAccount, useSignMessage } from 'wagmi'
import ChatMessageComponent from '../components/chat/ChatMessage.tsx'
import InputTextArea from '../components/chat/InputTextArea'
import SendMessageButton from '../components/chat/SendMessageButton'
import PauseButton from '../components/chat/PauseButton'
import FileUploadButton from '../components/chat/FileUploadButton'
import ImagePreviewStrip from '../components/chat/ImagePreviewStrip'
import WelcomeScreen from '../components/chat/WelcomeScreen'
import NetworkBackground from '../components/home/NetworkBackground'
import SkillsPanel from '../components/ai/SkillsPanel'
// Lazy-load heavy modals � deferred from main bundle
import { PROFILE_PHOTO_KEY } from '../components/chat/ChatUserModal'
const SubscriptionModal = React.lazy(() => import('../components/chat/subscription/SubscriptionModal').then(m => ({ default: m.SubscriptionModal })))
const SkillsShowcaseModal = React.lazy(() => import('../components/chat/subscription/SkillsShowcaseModal').then(m => ({ default: m.SkillsShowcaseModal })))
const SkillInputModal = React.lazy(() => import('../components/chat/skills/SkillInputModal').then(m => ({ default: m.SkillInputModal })))
const ChatTutorialModal = React.lazy(() => import('../components/chat/ChatTutorialModal').then(m => ({ default: m.ChatTutorialModal })))
const ChatUserModal = React.lazy(() => import('../components/chat/ChatUserModal').then(m => ({ default: m.ChatUserModal })))

import { useChatStreaming } from '../hooks/chat/useChatStreaming'
import { useFirebaseConversations } from '../hooks/chat/useFirebaseConversations'
import { useSkillInvocation } from '../hooks/chat/useSkillInvocation'
import { SKILL_INPUT_CONFIG } from '../components/chat/skills/skillInputConfig'
import { useIsMobile } from '../hooks/mobile/useIsMobile'
import { useChatNavbar } from '../hooks/mobile/useChatNavbar'
import { getMobileOptimizationConfig } from '../utils/mobile/performanceOptimization'
import { chatLogger } from '../utils/log/chatLogger'
import { useSubscription } from '../context/SubscriptionContext'
import type { StoredConversation } from '../components/chat/core/conversationManager'
import { GEMINI_MODELS } from '../constants/subscription'
import type { GeminiModel, SkillId } from '../constants/subscription'
import type { ImageAttachment } from '../../api/types/index.js'
import type { PendingImage } from '../utils/image/compressImage'

const PANEL_WIDTH = 320 // px � matches w-80

/** Builds the canonical sign message (must match api/_middlewares/wallet-auth.ts) */
function buildSignMessage(walletAddress: string, timestamp: number): string {
  return `NuxChain AI Authentication\n\nWallet: ${walletAddress.toLowerCase()}\nTimestamp: ${timestamp}\nDomain: nuxchain.app\n\nBy signing you grant NuxBee AI access to your on-chain activity to personalize responses. No transaction is executed.`
}

function Chat() {
  const [message, setMessage] = useState('')
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [showWelcome, setShowWelcome] = useState(() => {
    // Restore from sessionStorage: if an active session exists, skip the welcome screen
    if (typeof window !== 'undefined') {
      try {
        const session = sessionStorage.getItem('nuxbee_active_session')
        if (session) {
          const parsed = JSON.parse(session)
          if (Array.isArray(parsed.messages) && parsed.messages.length > 0) return false
        }
      } catch { /* ignore */ }
    }
    return true
  })
  const [showPanel, setShowPanel] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showTutorialModal, setShowTutorialModal] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('nuxbee_chat_tutorial_seen')
    }
    return false
  })
  const [showUserModal, setShowUserModal] = useState(false)
  const [userPhoto, setUserPhoto] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(PROFILE_PHOTO_KEY) : null
  )
  const [isSigning, setIsSigning] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState<SkillId | null>(null)
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(() => {
    // Load from localStorage or use default
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedGeminiModel') as GeminiModel) || 'gemini-flash'
    }
    return 'gemini-flash'
  })

  const { address: evmAddress, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { messages, isLoading, isStreaming, sendMessage, pauseStream, isUsingUrlContext, blockchainAction, isSearchingKB, isAnalyzingImage, clearMessages, loadHistory, currentConversationId, walletAuth, setWalletAuth, injectSkillLoading, updateSkillMessage } = useChatStreaming()
  const { history, saveConversation, deleteConversation } = useFirebaseConversations(evmAddress)
  const skillInvocation = useSkillInvocation(evmAddress)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { isDragging, dragY } = useChatNavbar()
  const optimizationConfig = getMobileOptimizationConfig()
  const { tier, isPaid, isExpiringSoon, dailyUsed, dailyLimit, trackUsage } = useSubscription()

  // Clear walletAuth when wallet disconnects or changes
  useEffect(() => {
    if (!isConnected) {
      setWalletAuth(null)
    } else if (evmAddress && walletAuth && walletAuth.walletAddress.toLowerCase() !== evmAddress.toLowerCase()) {
      // Different wallet connected � clear old auth
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
      toast.success('? Wallet verified! NuxBee AI now has your full on-chain context.', { style: makeToastStyle('success') })
    } catch (err) {
      if ((err as Error)?.message?.includes('User rejected') || (err as Error)?.message?.includes('rejected')) {
        toast.error('Signature cancelled.', { style: makeToastStyle('error') })
      } else {
        toast.error('Failed to sign. Try again.', { style: makeToastStyle('error') })
      }
    } finally {
      setIsSigning(false)
    }
  }, [evmAddress, signMessageAsync, setWalletAuth])

  const handleSkillSelect = useCallback((skillId: SkillId) => {
    setSelectedSkillId(skillId)
  }, [])

  const handleSkillSubmit = useCallback(async (skillId: SkillId, params: Record<string, unknown>) => {
    const msgId = injectSkillLoading(skillId)
    setShowWelcome(false)
    setSelectedSkillId(null)
    try {
      const result = await skillInvocation.invokeSkill(skillId, params)
      updateSkillMessage(msgId, result)
      const config = SKILL_INPUT_CONFIG[skillId]
      if (config?.analysisPrompt) {
        setTimeout(() => { sendMessage(config.analysisPrompt(params, result)) }, 700)
      }
    } catch (err) {
      updateSkillMessage(msgId, null, err instanceof Error ? err.message : 'Skill execution failed')
    }
  }, [injectSkillLoading, updateSkillMessage, skillInvocation, sendMessage])

  // Session lifecycle
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    chatLogger.logSessionStart()
    return () => {
      document.body.style.overflow = 'auto'
      chatLogger.logSessionEnd()
    }
  }, [])

  // Auto-scroll is handled by ChatMessage component internally � removed to avoid dual scroll

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

  const handleLoadHistory = useCallback((conv: StoredConversation) => {
    if (loadHistory) {
      loadHistory(conv.id, conv);
      setShowWelcome(false);
    }
  }, [loadHistory])

  const handleDeleteHistory = useCallback((e: React.MouseEvent, convId: string) => {
    e.stopPropagation()
    deleteConversation(convId)
  }, [deleteConversation])

  const handleNewChat = useCallback(() => {
    clearMessages()
    setShowWelcome(true)
    setMessage('')
  }, [clearMessages])

  const handleModelChange = useCallback((newModel: GeminiModel) => {
    setSelectedModel(newModel)
    localStorage.setItem('selectedGeminiModel', newModel)
  }, [])

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!message.trim() || isLoading || isStreaming) return
    if (showWelcome) setShowWelcome(false)
    const imagesToUpload = pendingImages.slice()
    setPendingImages([])
    setMessage('')
    try {
      chatLogger.logMessageEvent({ type: 'SEND', messageId: `user_${Date.now()}`, sender: 'user', contentPreview: message.trim(), timestamp: new Date().toISOString() }, 'Chat')

      // Upload pending images as JSON/base64 before sending (avoids octet-stream 415 issues)
      const attachments: ImageAttachment[] = []
      if (imagesToUpload.length > 0) {
        for (const pending of imagesToUpload) {
          try {
            // Convert blob to base64
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload  = (ev) => resolve((ev.target?.result as string).split(',')[1] ?? '')
              reader.onerror = () => reject(new Error('FileReader error'))
              reader.readAsDataURL(pending.blob)
            })

            const res = await fetch('/api/chat/upload-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(evmAddress ? { 'X-Wallet-Address': evmAddress } : {}),
              },
              body: JSON.stringify({
                image:    base64,
                mimeType: 'image/webp',
                name:     pending.name,
              }),
            })

            if (res.ok) {
              const data = await res.json() as { id: string; url: string; name: string; size: number; type: string; uploadedAt: string }
              attachments.push({
                id:         data.id,
                url:        data.url,
                name:       data.name || pending.name,
                size:       data.size,
                type:       data.type as ImageAttachment['type'],
                uploadedAt: data.uploadedAt,
                metadata:   { width: pending.width, height: pending.height },
              })
            } else {
              const err = await res.json().catch(() => ({}))
              console.error('[Chat] Image upload failed:', res.status, err)
              toast.error(`Image upload failed (${res.status})`)
            }
          } catch (uploadErr) {
            console.error('[Chat] Image upload error:', uploadErr)
            toast.error('Could not upload one of the images')
          }
        }
      }

      await sendMessage(message.trim(), attachments.length > 0 ? attachments : undefined)
      trackUsage()
    } catch (error) {
      chatLogger.logError('Error sending message', 'Chat', { message: message.trim().substring(0, 50) }, error as Error)
      toast.error('Error sending message. Cannot connect to NuxBee AI.')
    }
  }, [message, isLoading, isStreaming, showWelcome, pendingImages, sendMessage, trackUsage, evmAddress, chatLogger])

  const handleQuestionSelect = useCallback(async (question: string) => {
    setShowWelcome(false)
    try {
      chatLogger.logMessageEvent({ type: 'SEND', messageId: `user_${Date.now()}`, sender: 'user', contentPreview: question, timestamp: new Date().toISOString() }, 'WelcomeScreen')
      await sendMessage(question)
      trackUsage()
      setMessage('')
    } catch (error) {
      chatLogger.logError('Error sending selected question', 'WelcomeScreen', { question: question.substring(0, 50) }, error as Error)
      toast.error('Error sending the selected question.')
    }
  }, [sendMessage, trackUsage, chatLogger])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as React.FormEvent)
    }
  }, [handleSendMessage])

  return (
    <div className="fixed inset-0 md:top-20 flex flex-col overflow-hidden text-white font-sans z-40 md:pb-0 jersey-20-regular" style={{ background: 'transparent' }}>
      {/* Animated network background � only visible on welcome screen */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="chat-network-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 pointer-events-none z-0"
          >
            <NetworkBackground />
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- Main layout: optional desktop sidebar + chat area ---- */}
        <div className="flex flex-1 min-h-0 relative overflow-hidden">

        {/* -- Desktop sidebar (slides in from left) ------------- */}
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
                    <span className="font-medium text-[15px] text-cente">New chat</span>
                  </button>

                  <div className="mt-8 flex-1 overflow-y-auto pr-1">
                    <p className="text-xs text-white/50 uppercase tracking-widest font-semibold ml-2 mb-3">AI Skills</p>
                    <SkillsPanel
                      onSkillSelect={handleSkillSelect}
                      onUpgrade={() => setShowSubscriptionModal(true)}
                      onShowAll={() => setShowSkillsModal(true)}
                    />
                    
                    {history.length > 0 && (
                      <div className="mt-8">
                        <p className="text-xs text-white/50 uppercase tracking-widest font-semibold ml-2 mb-3">History</p>
                        <div className="flex flex-col gap-2 px-2">
                          {history.map(conv => (
                            <div key={conv.id} className="relative group">
                              <button 
                                onClick={() => handleLoadHistory(conv)}
                                className="w-full text-left p-3 pr-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                              >
                                <div className="text-sm font-medium truncate text-white/90 group-hover:text-purple-400">
                                  {conv.title || 'Untitled Chat'}
                                </div>
                                <div className="text-[11px] text-white/40 mt-1">
                                  {new Date(conv.timestamp).toLocaleDateString()}
                                </div>
                              </button>
                              <button
                                onClick={(e) => handleDeleteHistory(e, conv.id)}
                                className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 flex items-center justify-center rounded-md text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete"
                              >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Bottom: Plan Details */}
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A] px-2 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      {/* Left: circular ring for free tier, tier icon for paid */}
                      {(dailyLimit > 0) ? (
                        <div className="relative w-9 h-9 flex-shrink-0">
                          <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
                            <circle
                              cx="18" cy="18" r="15"
                              fill="none"
                              stroke={Math.min(100, (dailyUsed / dailyLimit) * 100) > 80 ? '#ef4444' : Math.min(100, (dailyUsed / dailyLimit) * 100) > 50 ? '#eab308' : '#a855f7'}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 15}`}
                              strokeDashoffset={`${2 * Math.PI * 15 * (1 - Math.min(1, dailyUsed / dailyLimit))}`}
                              style={{ transition: 'stroke-dashoffset 0.7s ease' }}
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${tier === 'premium' ? 'bg-purple-500/20 text-purple-400' : tier === 'pro' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/70'}`}>
                          {tier === 'premium' ? '??' : tier === 'pro' ? '?' : '??'}
                        </div>
                      )}
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="text-lg font-semibold capitalize">{tier} Plan</span>
                        {dailyLimit === -1 ? (
                          <span className="text-xs text-green-400/80">8 Unlimited requests</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-white/90 tabular-nums">{dailyUsed}</span>
                            <span className="text-xs text-white/30">/</span>
                            <span className="text-sm font-bold text-white/40 tabular-nums">{dailyLimit}</span>
                            <span className="text-[10px] text-white/30 ml-0.5">daily</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isExpiringSoon && (
                      <div className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                        ?? Plan expires soon
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
                                  <span className="text-sm">{selectedModel === modelId ? '?' : ''}</span>
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
                        <span>?</span> Upgrade Plan
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

          {/* -- Action bar -- */}
          <motion.div
            className="flex-shrink-0 flex items-center justify-between px-3 md:px-6 py-3 z-20"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              {/* Panel toggle */}
              <button
                onClick={() => setShowPanel(p => !p)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-white/70 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="20" height="2" rx="1" fill="currentColor"/>
                  <rect x="0" y="5.33" width="20" height="2" rx="1" fill="currentColor"/>
                  <rect x="0" y="10.67" width="20" height="2" rx="1" fill="currentColor"/>
                  <rect x="0" y="16" width="20" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>

            {/* Center brand on mobile */}
            {isMobile && (
              <span className="absolute left-1/2 -translate-x-1/2 text-xl font-medium text-white/50 tracking-wide pointer-events-none">
                Nuxbee AI
              </span>
            )}

            {/* User avatar button (top-right) */}
            <button
              onClick={() => setShowUserModal(v => !v)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white/15 flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-purple-500/50 hover:border-purple-500/40 transition-all active:scale-95 shadow-lg"
              aria-label="Open user menu"
            >
              {userPhoto ? (
                <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600/80 to-blue-600/80 flex items-center justify-center">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </button>
          </motion.div>

          {/* -- Messages / Welcome area ---------------------------- */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 min-h-0 flex flex-col">
            {showWelcome ? (
              /* Gemini-style: vertically centered welcome */
              <div className="flex-1 flex flex-col justify-center items-center py-8 px-2">
                <WelcomeScreen onQuestionSelect={handleQuestionSelect} />
              </div>
            ) : (
              <div className="flex-1 max-w-4xl mx-auto w-full pb-6 px-0 md:px-4">
                <ChatMessageComponent messages={messages} isLoading={isLoading || isStreaming} onSkillAnalyze={sendMessage} />
                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>

          {/* -- Fixed bottom input � always visible (welcome + active) ---- */}
          <motion.div
            className={`flex-shrink-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-4 md:pt-8 ${optimizationConfig.reduceAnimations ? '' : 'transition-transform duration-300'} ${isDragging ? 'pointer-events-none' : ''}`}
            style={{
              transform: isDragging ? `translateY(${Math.max(0, -dragY)}px)` : 'none',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-3xl mx-auto w-full px-3 md:px-8 pb-4 pt-2">
              <motion.form
                onSubmit={handleSendMessage}
                className="relative"
              >
                
                {/* -- Wallet Sign Banner -- */}
                {isConnected && !isWalletSigned && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30"
                  >
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span>🔒</span>
                      <span className="hidden sm:inline">Sign your wallet to unlock personalized AI context</span>
                      <span className="sm:hidden">Sign wallet for AI context</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignWallet}
                      disabled={isSigning}
                      className="flex-shrink-0 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                    >
                      {isSigning ? '🔒 Signing...' : '🔒 Sign'}
                    </button>
                  </motion.div>
                )}
                {!isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/50 text-center"
                  >
                    Connect your wallet to unlock personalized AI context
                  </motion.div>
                )}

                {/* Indicators (URL, Blockchain, KB, Image) */}
                {(isUsingUrlContext || blockchainAction || isSearchingKB || isAnalyzingImage) && (
                  <motion.div className="mb-3 flex items-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="px-4 py-2 border border-purple-500/30 rounded-full bg-gradient-to-r from-purple-900/20 to-blue-900/20 flex items-center space-x-2 text-sm text-white/80 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                      {isUsingUrlContext && <span className="font-medium">🌐 Analyzing URL...</span>}
                      {blockchainAction && <span className="font-medium">{blockchainAction}</span>}
                      {isAnalyzingImage && !blockchainAction && (
                        <motion.span className="font-medium flex items-center gap-2" animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          <span>🖼️</span> Analyzing image...
                        </motion.span>
                      )}
                      {isSearchingKB && !blockchainAction && !isAnalyzingImage && (
                        <motion.span className="font-medium flex items-center gap-2" animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          <span>📚</span> Searching Knowledge Base...
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Input box */}
                <motion.div
                  className="bg-[#1e1e24]/30 backdrop-blur-xl border border-white/10 rounded-[28px] overflow-hidden shadow-2xl focus-within:shadow-[0_0_30px_rgba(168,85,247,0.15)] focus-within:border-purple-500/40 transition-all duration-500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <ImagePreviewStrip
                    images={pendingImages}
                    onRemove={(id) => setPendingImages(prev => prev.filter(a => a.id !== id))}
                  />
                  <div className="flex items-center pl-4 pr-2 py-2">
                    <div className="flex-1 min-w-0">
                      <InputTextArea
                        value={message}
                        onChange={setMessage}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading || isStreaming || !isWalletSigned}
                        placeholder={isWalletSigned ? "Ask Nuxbee..." : isConnected ? "Sign wallet to start..." : "Connect wallet to start..."}
                      />
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 ml-2">
                      <FileUploadButton
                        onImageSelected={(img) => setPendingImages(prev => [...prev, img].slice(0, 3))}
                        currentCount={pendingImages.length}
                        isDisabled={isLoading || isStreaming || !isWalletSigned}
                      />
                      {isStreaming && <PauseButton onClick={() => pauseStream()} />}
                      <SendMessageButton disabled={!message.trim() || isLoading || isStreaming || !isWalletSigned} isLoading={isLoading || isStreaming} onClick={() => handleSendMessage()} hasText={message.trim().length > 0} />
                    </div>
                  </div>
                </motion.div>
              </motion.form>

              <motion.p
                className="text-[12px] text-white/30 mt-2.5 mb-1 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Nuxbee AI can make mistakes. Please double-check critical information.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* -- Mobile Sidebar (slides in from left) --- */}
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
                     <button onClick={() => setShowPanel(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white/70">?</button>
                  </div>
                  {/* New Chat Button */}
                  <button
                    onClick={() => { handleNewChat(); setShowPanel(false); }}
                    className="flex justify-between items-center w-full bg-[#212121] hover:bg-[#303030] border border-[#3A3A3A] px-4 py-3 rounded-2xl transition-colors duration-200"
                  >
                    <span className="font-medium text-[15px]">New chat</span>
                  </button>

                  <div className="mt-8 flex-1 overflow-y-auto pr-1">
                    <p className="text-xs text-white/50 uppercase tracking-widest font-semibold ml-2 mb-3">AI Skills</p>
                    <SkillsPanel
                      onSkillSelect={handleSkillSelect}
                      onUpgrade={() => { setShowPanel(false); setShowSubscriptionModal(true); }}
                      onShowAll={() => { setShowPanel(false); setShowSkillsModal(true); }}
                    />
                    
                    {history.length > 0 && (
                      <div className="mt-8">
                        <p className="text-xs text-white/50 uppercase tracking-widest font-semibold ml-2 mb-3">History</p>
                        <div className="flex flex-col gap-2 px-2">
                          {history.map(conv => (
                            <div key={conv.id} className="relative group">
                              <button 
                                onClick={() => { handleLoadHistory(conv); setShowPanel(false); }}
                                className="w-full text-left p-3 pr-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                              >
                                <div className="text-sm font-medium truncate text-white/90 group-hover:text-purple-400">
                                  {conv.title || 'Untitled Chat'}
                                </div>
                                <div className="text-[11px] text-white/40 mt-1">
                                  {new Date(conv.timestamp).toLocaleDateString()}
                                </div>
                              </button>
                              <button
                                onClick={(e) => handleDeleteHistory(e, conv.id)}
                                className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 flex items-center justify-center rounded-md text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete"
                              >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Bottom: Plan Details */}
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A] px-2 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      {/* Left: circular ring for free tier, tier icon for paid */}
                      {(dailyLimit > 0) ? (
                        <div className="relative w-9 h-9 flex-shrink-0">
                          <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
                            <circle
                              cx="18" cy="18" r="15"
                              fill="none"
                              stroke={Math.min(100, (dailyUsed / dailyLimit) * 100) > 80 ? '#ef4444' : Math.min(100, (dailyUsed / dailyLimit) * 100) > 50 ? '#eab308' : '#a855f7'}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 15}`}
                              strokeDashoffset={`${2 * Math.PI * 15 * (1 - Math.min(1, dailyUsed / dailyLimit))}`}
                              style={{ transition: 'stroke-dashoffset 0.7s ease' }}
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${tier === 'premium' ? 'bg-purple-500/20 text-purple-400' : tier === 'pro' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/70'}`}>
                          {tier === 'premium' ? '??' : tier === 'pro' ? '?' : '??'}
                        </div>
                      )}
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="text-sm font-semibold capitalize">{tier} Plan</span>
                        {dailyLimit === -1 ? (
                          <span className="text-xs text-green-400/80">8 Unlimited requests</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-white/90 tabular-nums">{dailyUsed}</span>
                            <span className="text-xs text-white/30">/</span>
                            <span className="text-sm font-bold text-white/40 tabular-nums">{dailyLimit}</span>
                            <span className="text-[10px] text-white/30 ml-0.5">daily</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isExpiringSoon && (
                      <div className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                        ?? Plan expires soon
                      </div>
                    )}
                    {!isPaid ? (
                      <button
                        onClick={() => { setShowPanel(false); setShowSubscriptionModal(true); }}
                        className="w-full text-center text-2xl font-medium py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <span>?</span> Upgrade Plan
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

      {/* -- Modals (lazy-loaded � deferred from main bundle) ---- */}
      <Suspense fallback={null}>
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
        <SkillsShowcaseModal
          isOpen={showSkillsModal}
          onClose={() => setShowSkillsModal(false)}
          onSubscribe={() => { setShowSkillsModal(false); setShowSubscriptionModal(true); }}
        />
        <SkillInputModal
          skillId={selectedSkillId}
          onClose={() => setSelectedSkillId(null)}
          onSubmit={handleSkillSubmit}
          isLoading={skillInvocation.state.isLoading}
        />
        <ChatTutorialModal
          isOpen={showTutorialModal}
          onClose={() => {
            setShowTutorialModal(false)
            localStorage.setItem('nuxbee_chat_tutorial_seen', 'true')
          }}
        />
        <ChatUserModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          currentPhoto={userPhoto}
          onPhotoChange={(url) => setUserPhoto(url)}
          isWalletSigned={isWalletSigned}
          onDisconnectContext={() => setWalletAuth(null)}
        />
      </Suspense>
    </div>
  )
}

export default Chat
