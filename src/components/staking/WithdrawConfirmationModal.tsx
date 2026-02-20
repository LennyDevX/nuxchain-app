import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatEther } from 'viem'

interface WithdrawConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userStaked: bigint
  pendingRewards: bigint
  contractBalance: bigint
  isProcessing: boolean
}

export const WithdrawConfirmationModal: React.FC<WithdrawConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userStaked,
  pendingRewards,
  contractBalance,
  isProcessing,
}) => {
  const totalToWithdraw = userStaked + pendingRewards
  const hasSufficientBalance = contractBalance >= totalToWithdraw
  const balanceDeficit = totalToWithdraw - contractBalance

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isProcessing, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatPOL = (value: bigint) => {
    return parseFloat(formatEther(value)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isProcessing) {
            onClose()
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
            <h3 className="jersey-15-regular text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
              <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Confirm Withdrawal
            </h3>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Withdrawal Summary */}
            <div className="space-y-3">
              <h4 className="jersey-15-regular text-sm lg:text-base font-semibold text-white/80 uppercase tracking-wide">Withdrawal Summary</h4>
              
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="jersey-20-regular text-white/60 text-sm lg:text-base">Your Staked Amount:</span>
                  <span className="jersey-20-regular text-white font-semibold text-sm lg:text-base">{formatPOL(userStaked)} POL</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="jersey-20-regular text-white/60 text-sm lg:text-base">Pending Rewards:</span>
                  <span className="jersey-20-regular text-green-400 font-semibold text-sm lg:text-base">+{formatPOL(pendingRewards)} POL</span>
                </div>
                
                <div className="h-px bg-white/10 my-2"></div>
                
                <div className="flex justify-between items-center">
                  <span className="jersey-20-regular text-white font-semibold text-sm lg:text-base">Total to Withdraw:</span>
                  <span className="jersey-20-regular text-xl text-cyan-400 font-bold lg:text-2xl">{formatPOL(totalToWithdraw)} POL</span>
                </div>
              </div>
            </div>

            {/* Contract Balance Validation */}
            <div className="space-y-3">
              <h4 className="jersey-15-regular text-sm lg:text-base font-semibold text-white/80 uppercase tracking-wide">Contract Balance Check</h4>
              
              <div className={`rounded-lg p-4 border-2 ${
                hasSufficientBalance 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-red-900/20 border-red-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  {hasSufficientBalance ? (
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="jersey-20-regular text-white/80 text-sm lg:text-base">Available in Contract:</span>
                      <span className={`jersey-20-regular font-semibold text-sm lg:text-base ${hasSufficientBalance ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPOL(contractBalance)} POL
                      </span>
                    </div>
                    
                    {!hasSufficientBalance && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="jersey-20-regular text-red-300">Deficit:</span>
                          <span className="jersey-20-regular text-red-400 font-semibold">-{formatPOL(balanceDeficit)} POL</span>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-red-500/20">
                          <p className="jersey-20-regular text-sm text-red-200 leading-relaxed">
                            ⚠️ <strong>Insufficient contract balance!</strong>
                          </p>
                          <p className="jersey-20-regular text-xs text-red-300 mt-2 leading-relaxed lg:text-sm">
                            The contract doesn't have enough POL to process your full withdrawal right now. 
                            This can happen when rewards are still being generated or other users are withdrawing.
                          </p>
                          <p className="jersey-20-regular text-xs text-yellow-300 mt-2 leading-relaxed lg:text-sm">
                            💡 You can try withdrawing a smaller amount or wait for more liquidity to be added to the contract.
                          </p>
                        </div>
                      </>
                    )}
                    
                    {hasSufficientBalance && (
                      <p className="jersey-20-regular text-sm text-green-300 mt-2 lg:text-base">
                        ✅ The contract has sufficient balance to process your withdrawal.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Message for successful validation */}
            {hasSufficientBalance && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="jersey-20-regular text-sm text-yellow-200 leading-relaxed lg:text-base">
                  <strong>⚠️ Important:</strong> This action will withdraw all your staked POL and accumulated rewards. 
                  This cannot be undone.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-900/50 border-t border-white/10 flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed jersey-20-regular text-base lg:text-lg"
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              disabled={!hasSufficientBalance || isProcessing}
              className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-all jersey-20-regular text-base lg:text-lg ${
                hasSufficientBalance && !isProcessing
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-700 text-white/40 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2 jersey-20-regular">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : hasSufficientBalance ? (
                <span className="jersey-20-regular">Confirm & Withdraw</span>
              ) : (
                <span className="jersey-20-regular">Insufficient Balance</span>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

