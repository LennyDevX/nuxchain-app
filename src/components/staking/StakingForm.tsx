import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { polygon } from 'wagmi/chains'
import EnhancedSmartStakingABI from '../../abi/EnhancedSmartStaking.json'
import { showContractError, validateDepositAmount, validateLockupDuration } from '../../utils/errors/contractErrors'
import { useIsMobile } from '../../hooks/mobile'
import { getOptimizedFontSize } from '../../utils/mobile/performanceOptimization'
import StakingPeriodCarousel from './StakingPeriodCarousel'
import { STAKING_PERIODS } from '../../constants/stakingConstants'

interface StakingFormProps {
  stakingContractAddress: string
  pendingRewards: bigint | undefined
  isPaused: boolean
  totalDeposit: bigint | undefined
}

function StakingForm({ stakingContractAddress, pendingRewards, isPaused, totalDeposit }: StakingFormProps) {
  const { address } = useAccount()
  const isMobile = useIsMobile()
  const [depositAmount, setDepositAmount] = useState('')
  const [lockupDuration, setLockupDuration] = useState('0') // default: Flexible
  const [compoundLockupDuration, setCompoundLockupDuration] = useState('0') // default: Flexible
  const [activeTab, setActiveTab] = useState('stake')
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const tabs = useMemo(() => ['stake', 'claim', 'withdraw', 'compound', 'emergency'], [])
  const currentTabIndex = tabs.indexOf(activeTab)
  
  // ✅ Font size adaptativo
  const fontSize = useMemo(() => ({
    label: getOptimizedFontSize(14, isMobile), // 14px base
    value: getOptimizedFontSize(16, isMobile), // 16px base
    hint: getOptimizedFontSize(12, isMobile),  // 12px base
  }), [isMobile])
  
  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    // Don't interfere with form elements
    const target = e.target as HTMLElement
    if (target.tagName === 'SELECT' || target.tagName === 'OPTION' || target.closest('select')) {
      return
    }
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return
    // Don't interfere with form elements
    const target = e.target as HTMLElement
    if (target.tagName === 'SELECT' || target.tagName === 'OPTION' || target.closest('select')) {
      return
    }
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (!isMobile || !touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe && currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1])
    }
    if (isRightSwipe && currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1])
    }
    
    setTouchStart(0)
    setTouchEnd(0)
  }
  
  // Auto-scroll active tab into view
  useEffect(() => {
    if (isMobile && tabsContainerRef.current) {
      const activeButton = tabsContainerRef.current.children[currentTabIndex] as HTMLElement
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
  }, [activeTab, isMobile, currentTabIndex])

  // ✅ Keyboard navigation para tabs (Arrow Left/Right)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (currentTabIndex > 0) {
        setActiveTab(tabs[currentTabIndex - 1])
      }
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (currentTabIndex < tabs.length - 1) {
        setActiveTab(tabs[currentTabIndex + 1])
      }
    }
  }, [currentTabIndex, tabs])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const { data: balance } = useBalance({
    address: address,
    chainId: polygon.id,
  })

  // Write to contract
  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleDeposit = async () => {
    if (!depositAmount || !address) return
    
    // Validate deposit amount
    const amountValidation = validateDepositAmount(depositAmount, balance?.value)
    if (!amountValidation.isValid) {
      alert(amountValidation.error)
      return
    }
    
    // Validate lockup duration
    const lockupValidation = validateLockupDuration(lockupDuration)
    if (!lockupValidation.isValid) {
      alert(lockupValidation.error)
      return
    }
    
    try {
      const lockupInDays = BigInt(parseInt(lockupDuration))
      
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'deposit',
        args: [lockupInDays],
        value: parseEther(depositAmount),
      })
    } catch (error) {
      showContractError(error, 'Error al realizar el depósito')
    }
  }



  const handleWithdrawAll = async () => {
    if (!address) return
    
    try {
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'withdrawAll',
      })
    } catch (error) {
      showContractError(error, 'Error withdrawing all')
    }
  }

  const handleCompound = async () => {
    if (!address) return
    
    // Validate lockup duration for compound
    const lockupValidation = validateLockupDuration(compoundLockupDuration)
    if (!lockupValidation.isValid) {
      alert(lockupValidation.error)
      return
    }
    
    try {
      const lockupInDays = BigInt(parseInt(compoundLockupDuration))
      
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'compound',
        args: [lockupInDays],
      })
    } catch (error) {
      showContractError(error, 'Error al hacer compound')
    }
  }

  const handleClaimRewards = async () => {
    if (!address) return
    
    try {
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'withdraw',
      })
    } catch (error) {
      showContractError(error, 'Error claiming rewards')
    }
  }

  const handleEmergencyWithdraw = async () => {
    if (!address) return
    
    const confirmed = window.confirm(
      '⚠️ RETIRO DE EMERGENCIA ⚠️\n\n' +
      'This action will withdraw ALL your deposited funds immediately, ' +
      'regardless of the lockup period.\n\n' +
      'WARNINGS:\n' +
      '• You will lose ALL pending rewards\n' +
      '• You cannot recover lost rewards\n' +
      '• This action is IRREVERSIBLE\n\n' +
      'Are you sure you want to continue?'
    )
    
    if (!confirmed) return
    
    try {
      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'emergencyUserWithdraw',
      })
    } catch (error) {
      showContractError(error, 'Error in emergency withdrawal')
    }
  }

  return (
    <motion.div 
      className="card-unified overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {/* Tabs */}
      <motion.div 
        className={`border-b border-white/20 relative ${
          isMobile ? 'overflow-x-auto scrollbar-hide' : 'flex'
        }`}
        role="tablist"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <div 
          ref={tabsContainerRef}
          className={`${
            isMobile ? 'flex min-w-max px-2' : 'flex w-full'
          }`}
        >
          <motion.button
            onClick={() => setActiveTab('stake')}
            role="tab"
            aria-selected={activeTab === 'stake'}
            aria-label="Stake Tab - Use Arrow Keys to Navigate"
            className={`font-medium transition-all duration-300 ${
              isMobile 
                ? 'py-3 px-4 text-sm whitespace-nowrap min-w-[80px] mx-1 rounded-t-lg' 
                : 'flex-1 py-4 px-6 text-center'
            } ${
              activeTab === 'stake'
                ? isMobile 
                  ? 'bg-blue-500/30 text-blue-300 shadow-lg transform scale-105'
                  : 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Stake
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('claim')}
            role="tab"
            aria-selected={activeTab === 'claim'}
            aria-label="Claim Tab"
            className={`font-medium transition-all duration-300 ${
              isMobile 
                ? 'py-3 px-4 text-sm whitespace-nowrap min-w-[80px] mx-1 rounded-t-lg' 
                : 'flex-1 py-4 px-6 text-center'
            } ${
              activeTab === 'claim'
                ? isMobile 
                  ? 'bg-yellow-500/30 text-yellow-300 shadow-lg transform scale-105'
                  : 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Claim
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('withdraw')}
            role="tab"
            aria-selected={activeTab === 'withdraw'}
            aria-label="Withdraw Tab"
            className={`font-medium transition-all duration-300 ${
              isMobile 
                ? 'py-3 px-4 text-sm whitespace-nowrap min-w-[80px] mx-1 rounded-t-lg' 
                : 'flex-1 py-4 px-6 text-center'
            } ${
              activeTab === 'withdraw'
                ? isMobile 
                  ? 'bg-red-500/30 text-red-300 shadow-lg transform scale-105'
                  : 'bg-red-500/20 text-red-400 border-b-2 border-red-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Withdraw
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('compound')}
            role="tab"
            aria-selected={activeTab === 'compound'}
            aria-label="Compound Tab"
            className={`font-medium transition-all duration-300 ${
              isMobile 
                ? 'py-3 px-4 text-sm whitespace-nowrap min-w-[80px] mx-1 rounded-t-lg' 
                : 'flex-1 py-4 px-6 text-center'
            } ${
              activeTab === 'compound'
                ? isMobile 
                  ? 'bg-green-500/30 text-green-300 shadow-lg transform scale-105'
                  : 'bg-green-500/20 text-green-400 border-b-2 border-green-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            Compound
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('emergency')}
            role="tab"
            aria-selected={activeTab === 'emergency'}
            aria-label="Emergency Tab"
            className={`font-medium transition-all duration-300 ${
              isMobile 
                ? 'py-3 px-4 text-sm whitespace-nowrap min-w-[80px] mx-1 rounded-t-lg' 
                : 'flex-1 py-4 px-6 text-center'
            } ${
              activeTab === 'emergency'
                ? isMobile 
                  ? 'bg-orange-500/30 text-orange-300 shadow-lg transform scale-105'
                  : 'bg-orange-500/20 text-orange-400 border-b-2 border-orange-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Emergency
          </motion.button>
        </div>
        

      </motion.div>

      <motion.div 
        ref={contentRef}
        className={`${isMobile ? 'p-4' : 'p-6'} relative`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        viewport={{ once: true }}
      >

        {activeTab === 'stake' && (
          <div className="space-y-6">
            <div>
              <label 
                className="block text-white/80 font-medium mb-2"
                style={{ fontSize: `${fontSize.label}px` }}
              >
                Amount to deposit (POL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
                {depositAmount && (
                  <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400" style={{ fontSize: `${fontSize.hint}px` }}>
                    💡 6% Commission: {(parseFloat(depositAmount) * 0.06).toFixed(4)} POL
                  </p>
                  <p className="text-white/60" style={{ fontSize: `${fontSize.hint - 1}px` }}>
                    Effective deposit amount: {(parseFloat(depositAmount) * 0.94).toFixed(4)} POL
                  </p>
                  </div>
                )}
                <div className="absolute right-3 top-3 text-white/60 text-sm">
                  POL
                </div>
              </div>
              <div className="mt-2 text-sm text-white/60">
                Balance: {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 POL'}
              </div>
            </div>

            <StakingPeriodCarousel
              value={lockupDuration}
              onChange={setLockupDuration}
              options={STAKING_PERIODS}
              label="Lockup period (days)"
            />

            <button
              onClick={handleDeposit}
              disabled={!depositAmount || isPending || isConfirming || isPaused}
              className="w-full bg-gradient-to-r from-red-400 to-purple-500 hover:from-red-700 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPaused ? 'Contract Paused' : isPending || isConfirming ? 'Processing...' : 'Stake Now'}
            </button>
          </div>
        )}

        {activeTab === 'claim' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 mb-4">
                Claim your available rewards without affecting your staked amount
              </p>
              <p className="text-2xl font-bold text-white mb-6">
                {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
              </p>
            </div>
            
            <button
              onClick={handleClaimRewards}
              disabled={isPending || isConfirming || !pendingRewards || pendingRewards === 0n}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPending || isConfirming ? 'Processing...' : 'Claim Rewards'}
            </button>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 mb-4">
                Withdraw all your staked amount and accumulated rewards
              </p>
              <p className="text-2xl font-bold text-white mb-6">
                Total: {totalDeposit ? `${parseFloat(formatEther(totalDeposit)).toFixed(6)} POL` : '0 POL'} (Staked)
              </p>
              <p className="text-lg text-yellow-400 mb-6">
                + {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'} (Rewards)
              </p>
            </div>
            
            <button
              onClick={handleWithdrawAll}
              disabled={isPending || isConfirming}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPending || isConfirming ? 'Processing...' : 'Withdraw All (Stake + Rewards)'}
            </button>
          </div>
        )}

        {activeTab === 'compound' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 mb-4">
                Automatically reinvest your rewards to maximize earnings
              </p>
              <p className="text-2xl font-bold text-white mb-6">
                {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
              </p>
            </div>
            
            <StakingPeriodCarousel
              value={compoundLockupDuration}
              onChange={setCompoundLockupDuration}
              options={[
                {
                  value: "0",
                  label: "Flexible",
                  description: "0.01% per hour",
                  roi: {
                    daily: "~0.24%",
                    monthly: "~7.2%",
                    annual: "~87.6%"
                  }
                },
                {
                  value: "30",
                  label: "30 Days",
                  description: "0.012% per hour",
                  roi: {
                    daily: "~0.29%",
                    monthly: "~8.6%",
                    annual: "~105.1%"
                  }
                },
                {
                  value: "90",
                  label: "90 Days",
                  description: "0.016% per hour",
                  roi: {
                    daily: "~0.38%",
                    monthly: "~11.5%",
                    annual: "~140.2%"
                  }
                },
                {
                  value: "180",
                  label: "180 Days",
                  description: "0.02% per hour",
                  roi: {
                    daily: "~0.48%",
                    monthly: "~14.4%",
                    annual: "~175.2%"
                  }
                },
                {
                  value: "365",
                  label: "365 Days",
                  description: "0.03% per hour",
                  roi: {
                    daily: "~0.72%",
                    monthly: "~21.6%",
                    annual: "~262.8%"
                  }
                }
              ]}
              label="Lockup period for compounded rewards (days)"
            />
            
            <button
              onClick={handleCompound}
              disabled={isPending || isConfirming || !pendingRewards || pendingRewards === 0n}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPending || isConfirming ? 'Processing...' : 'Compound Now'}
            </button>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <div className="text-red-400 text-2xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-400 font-bold text-lg mb-2">EMERGENCY WITHDRAWAL</h3>
                  <p className="text-white/80 text-sm mb-2">
                    This function is designed ONLY for extreme emergency situations.
                  </p>
                  <ul className="text-red-300 text-sm space-y-1">
                    <li>• Withdraws ALL your deposited funds immediately</li>
                    <li>• Completely ignores lockup periods</li>
                    <li>• You LOSE ALL pending rewards</li>
                    <li>• Lost rewards CANNOT be recovered</li>
                    <li>• This action is IRREVERSIBLE</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-white/80 mb-4">
                Deposited funds that will be withdrawn:
              </p>
              <p className="text-2xl font-bold text-white mb-2">
                {totalDeposit ? `${parseFloat(formatEther(totalDeposit)).toFixed(6)} POL` : '0 POL'}
              </p>
              <p className="text-red-400 text-sm mb-6">
                Rewards that will be lost: {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
              </p>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
              <p className="text-orange-400 text-sm font-medium mb-2">🚨 BEFORE CONTINUING:</p>
              <p className="text-white/80 text-sm">
                Consider using "Withdraw All" instead, which allows you to withdraw both your funds and rewards, 
                respecting lockup periods when necessary.
              </p>
            </div>
            
            <button
              onClick={handleEmergencyWithdraw}
              disabled={isPending || isConfirming || !totalDeposit || totalDeposit === 0n || !isPaused}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 border-2 border-red-500 hover:border-red-400 shadow-lg"
            >
              {!isPaused ? 'Only available when contract is paused' : isPending || isConfirming ? 'Processing...' : '🚨 EMERGENCY WITHDRAWAL 🚨'}
            </button>
            
            <p className="text-center text-white/60 text-xs">
              {isPaused ? 'By clicking you confirm that you understand the irreversible consequences of this action' : 'Emergency withdrawal is only available when the contract owner has paused the contract'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Transaction Success Message */}
      {isConfirmed && (
        <motion.div 
          className="mx-6 mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-400 font-medium">Transaction completed successfully</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default StakingForm