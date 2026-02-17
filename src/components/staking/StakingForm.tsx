import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther, formatUnits } from 'viem'
import { polygon } from 'wagmi/chains'
import EnhancedSmartStakingCoreABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json'
import EnhancedSmartStakingViewABI from '../../abi/SmartStaking/EnhancedSmartStakingView.json'
import { showContractError, validateDepositAmount, validateLockupDuration } from '../../utils/errors/contractErrors'
import { useIsMobile } from '../../hooks/mobile'
import { getOptimizedFontSize } from '../../utils/mobile/performanceOptimization'
import { stakingLogger } from '../../utils/log/stakingLogger'
import { stakingToasts } from '../../utils/toasts/stakingToasts'
import { useUserDeposits } from '../../hooks/staking/useUserDeposits'
import { useTotalClaimedRewardsV2 } from '../../hooks/staking/useTotalClaimedRewardsV2'
import { useStakingAnalytics } from '../../hooks/staking/useStakingAnalytics'
import { WithdrawConfirmationModal } from './WithdrawConfirmationModal'
import { STAKING_PERIODS } from '../../constants/stakingConstants'

interface StakingFormProps {
  stakingContractAddress: string
  pendingRewards: bigint | undefined
  isPaused: boolean
  userStaked: bigint | undefined
}

function StakingForm({ stakingContractAddress, pendingRewards, isPaused, userStaked }: StakingFormProps) {
  const { address } = useAccount()
  const isMobile = useIsMobile()
  // State for form
  const [depositAmount, setDepositAmount] = useState('')
  const [lockupDuration, setLockupDuration] = useState('0') // default: Flexible
  const [compoundLockupDuration, setCompoundLockupDuration] = useState('0') // default: Flexible
  const [activeTab, setActiveTab] = useState('stake')
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Get contract balance for validation
  const { data: poolStats } = useReadContract({
    address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingViewABI.abi,
    functionName: 'getPoolStats',
  }) as { data: readonly [bigint?, bigint?, bigint?, bigint?, bigint?] | undefined }

  const contractBalance = (poolStats?.[4] as bigint) || 0n

  // Get user info and refetch function
  const {
    lockedDeposits,
    refetch: refetchUserDeposits
  } = useUserDeposits()

  const tabs = useMemo(() => ['stake', 'claim', 'withdraw', 'compound', 'emergency'], [])
  const currentTabIndex = tabs.indexOf(activeTab)

  // ✅ Get total claimed rewards directly from contract
  const {
    totalClaimed: totalRewardsClaimed,
    isLoading: isLoadingClaimed,
    refetch: refetchClaimed
  } = useTotalClaimedRewardsV2(
    stakingContractAddress as `0x${string}`,
    address
  )

  // ✅ Get withdrawal status from new analytics hook
  const { withdrawalStatus, loadingWithdrawal } = useStakingAnalytics()

  // Log rewards for debugging
  useEffect(() => {
    if (pendingRewards !== undefined && totalRewardsClaimed !== undefined) {
      stakingLogger.logRewards({
        pending: formatEther(pendingRewards),
        accumulated: formatEther(totalRewardsClaimed),
        claimed: formatEther(totalRewardsClaimed),
        baseAPY: 19.7,
        finalAPY: 19.7
      })
    }
  }, [pendingRewards, totalRewardsClaimed])

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

  // Refetch user deposits info when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      console.log('✅ Transaction confirmed, refetching user deposits...')
      refetchUserDeposits()
      // Refetch claimed rewards after withdraw/claim
      if (activeTab === 'claim' || activeTab === 'withdraw') {
        setTimeout(() => refetchClaimed(), 2000)
      }
    }
  }, [isConfirmed, refetchUserDeposits, refetchClaimed, activeTab])

  const handleDeposit = async () => {
    if (!depositAmount || !address) return

    // Validate deposit amount
    const amountValidation = validateDepositAmount(depositAmount, balance?.value)
    if (!amountValidation.isValid) {
      if (amountValidation.error?.includes('Minimum')) {
        stakingToasts.minimumDepositError('10 POL')
      } else if (amountValidation.error?.includes('Maximum')) {
        stakingToasts.maximumDepositError('10,000 POL')
      } else if (amountValidation.error?.includes('Insufficient')) {
        stakingToasts.insufficientBalance(depositAmount, balance ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4) : '0')
      } else {
        stakingToasts.error(amountValidation.error || 'Invalid deposit amount')
      }
      return
    }

    // Validate lockup duration
    const lockupValidation = validateLockupDuration(lockupDuration)
    if (!lockupValidation.isValid) {
      stakingToasts.invalidLockupPeriod()
      return
    }

    try {
      const lockupInDays = BigInt(parseInt(lockupDuration))

      stakingLogger.logDeposit({
        amount: depositAmount,
        lockupPeriod: parseInt(lockupDuration),
        user: address || '',
        success: false
      })

      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingCoreABI.abi,
        functionName: 'deposit',
        args: [lockupInDays],
        value: parseEther(depositAmount),
      })
    } catch (error) {
      stakingLogger.logError({
        context: 'deposit',
        error: error instanceof Error ? error : new Error(String(error))
      })
      showContractError(error, 'Error al realizar el depósito')
    }
  }



  const handleWithdrawAll = async () => {
    if (!address) {
      stakingToasts.walletNotConnected()
      return
    }

    // Validate that user has something to withdraw
    if (!userStaked || userStaked === 0n) {
      stakingToasts.noDeposits()
      return
    }

    // Show info about locked deposits if any
    if (lockedDeposits > 0) {
      console.log(`⚠️ User has ${lockedDeposits} locked deposit(s) that may incur penalties`)
    }

    // Open modal for validation and confirmation
    setIsWithdrawModalOpen(true)
  }

  const executeWithdraw = async () => {
    try {
      stakingLogger.logWithdraw({
        positionId: 1,
        amount: userStaked ? formatEther(userStaked) : '0',
        user: address || '',
        success: false
      })

      await writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingCoreABI.abi,
        functionName: 'withdrawAll',
        chain: polygon,
      })
      setIsWithdrawModalOpen(false)
    } catch (error) {
      stakingLogger.logError({
        context: 'withdraw',
        error: error instanceof Error ? error : new Error(String(error))
      })
      showContractError(error, 'Error withdrawing all')
      setIsWithdrawModalOpen(false)
    }
  }

  const handleCompound = async () => {
    if (!address) return

    // Validate lockup duration for compound
    const lockupValidation = validateLockupDuration(compoundLockupDuration)
    if (!lockupValidation.isValid) {
      stakingToasts.invalidLockupPeriod()
      return
    }

    try {
      const lockupInDays = BigInt(parseInt(compoundLockupDuration))

      stakingLogger.logCompound({
        positionId: 1,
        rewardsCompounded: pendingRewards ? formatEther(pendingRewards) : '0',
        newTotalStaked: userStaked && pendingRewards ? formatEther(userStaked + pendingRewards) : '0',
        user: address,
        success: false
      })

      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingCoreABI.abi,
        functionName: 'compound',
        args: [lockupInDays],
      })
    } catch (error) {
      stakingLogger.logError({
        context: 'compound',
        error: error instanceof Error ? error : new Error(String(error))
      })
      showContractError(error, 'Error al hacer compound')
    }
  }

  const handleClaimRewards = async () => {
    if (!address) return

    try {
      stakingLogger.logClaim({
        positionId: 1,
        amount: pendingRewards ? formatEther(pendingRewards) : '0',
        user: address,
        success: false
      })

      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingCoreABI.abi,
        functionName: 'withdraw',
      })
    } catch (error) {
      stakingLogger.logError({
        context: 'claim',
        error: error instanceof Error ? error : new Error(String(error))
      })
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

    if (!confirmed) {
      return
    }

    try {
      stakingLogger.logEmergencyWithdraw({
        positionId: 1,
        amount: userStaked ? formatEther(userStaked) : '0',
        penalty: '0', // Will be calculated on-chain
        user: address,
        success: false
      })

      writeContract({
        address: stakingContractAddress as `0x${string}`,
        abi: EnhancedSmartStakingCoreABI.abi,
        functionName: 'emergencyUserWithdraw',
      })
    } catch (error) {
      stakingLogger.logError({
        context: 'emergency',
        error: error instanceof Error ? error : new Error(String(error))
      })
      showContractError(error, 'Error in emergency withdrawal')
    }
  }

  return (
    <motion.div
      className="card-unified overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tabs */}
      <motion.div
        className={`border-b border-white/20 relative flex`}
        role="tablist"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div
          ref={tabsContainerRef}
          className={`flex w-full px-0`}
        >
          <motion.button
            onClick={() => setActiveTab('stake')}
            role="tab"
            aria-selected={activeTab === 'stake'}
            aria-label="Stake Tab - Use Arrow Keys to Navigate"
            className={`font-medium transition-all duration-300 flex-1
              ${isMobile ? 'py-2 px-2 text-xs rounded-lg' : 'py-5 px-6 text-lg rounded-lg'}
              ${activeTab === 'stake'
                ? isMobile
                  ? 'bg-blue-500/30 text-blue-300 shadow-lg'
                  : 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
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
            className={`font-medium transition-all duration-300 flex-1
              ${isMobile ? 'py-2 px-2 text-xs rounded-lg' : 'py-5 px-6 text-lg rounded-lg'}
              ${activeTab === 'claim'
                ? isMobile
                  ? 'bg-yellow-500/30 text-yellow-300 shadow-lg'
                  : 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
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
            className={`font-medium transition-all duration-300 flex-1
              ${isMobile ? 'py-2 px-2 text-xs rounded-lg' : 'py-5 px-6 text-lg rounded-lg'}
              ${activeTab === 'withdraw'
                ? isMobile
                  ? 'bg-red-500/30 text-red-300 shadow-lg'
                  : 'bg-red-500/20 text-red-400 border-b-2 border-red-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
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
            className={`font-medium transition-all duration-300 flex-1
              ${isMobile ? 'py-2 px-2 text-xs rounded-lg' : 'py-5 px-6 text-lg rounded-lg'}
              ${activeTab === 'compound'
                ? isMobile
                  ? 'bg-green-500/30 text-green-300 shadow-lg'
                  : 'bg-green-500/20 text-green-400 border-b-2 border-green-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Compound
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('emergency')}
            role="tab"
            aria-selected={activeTab === 'emergency'}
            aria-label="Emergency Tab"
            className={`font-medium transition-all duration-300 flex-1
              ${isMobile ? 'py-2 px-2 text-xs rounded-lg' : 'py-5 px-6 text-lg rounded-lg'}
              ${activeTab === 'emergency'
                ? isMobile
                  ? 'bg-orange-500/30 text-orange-300 shadow-lg'
                  : 'bg-orange-500/20 text-orange-400 border-b-2 border-orange-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
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
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
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
                Balance: {balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}` : '0 POL'}
              </div>
            </div>

            {/* Period Selector Grid (Simplified) */}
            <div className="space-y-3">
              <label className="text-white/80 text-sm font-medium">Lockup Period</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {STAKING_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => setLockupDuration(period.value)}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200
                      ${lockupDuration === period.value
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                      }
                    `}
                  >
                    <div className="text-center">
                      <p className={`text-sm font-bold mb-1 ${
                        lockupDuration === period.value ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {period.label}
                      </p>
                      <p className="text-xs text-white/60">{period.roi.annual}</p>
                    </div>
                    {lockupDuration === period.value && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={!depositAmount || isPending || isConfirming || isPaused}
              className="w-full btn-primary"
            >
              {isPaused ? 'Contract Paused' : isPending || isConfirming ? 'Processing...' : 'Stake Now'}
            </button>
          </div>
        )}

        {activeTab === 'claim' && (
          <div className="space-y-6">
            {/* Pending Rewards Section */}
            <div className="space-y-2">
              <p className="text-white/80 text-sm font-medium">Available to Claim</p>
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-3xl font-bold text-white mb-1">
                  {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
                </p>
                <p className="text-white/60 text-xs">
                  {pendingRewards && pendingRewards > 0n
                    ? 'These rewards are ready to be claimed and transferred to your wallet'
                    : 'No pending rewards at this moment. Keep staking to earn more!'
                  }
                </p>
              </div>
            </div>

            {/* Total Claimed Summary */}
            <div className="grid grid-cols-2 gap-4">
              {/* Total Rewards Claimed */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs font-semibold">💎 Total Claimed</p>
                  <div className="flex items-center gap-1">
                    {isLoadingClaimed && (
                      <svg className="animate-spin h-3 w-3 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}

                  </div>
                </div>
                <p className="text-xl font-bold text-purple-400 mb-1">
                  {totalRewardsClaimed && totalRewardsClaimed > 0n
                    ? `${parseFloat(formatEther(totalRewardsClaimed)).toFixed(6)} POL`
                    : '0.000000 POL'}
                </p>
                <p className="text-white/50 text-xs">
                  {isLoadingClaimed
                    ? 'Loading from contract...'
                    : totalRewardsClaimed && totalRewardsClaimed > 0n
                      ? 'Total rewards withdrawn since inception'
                      : 'No rewards claimed yet. Stake and earn!'}
                </p>
              </div>

              {/* Total Staked */}
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-white/70 text-xs font-semibold mb-2">💰 Total Staked</p>
                <p className="text-xl font-bold text-cyan-400 mb-1">
                  {userStaked ? `${parseFloat(formatEther(userStaked)).toFixed(6)} POL` : '0 POL'}
                </p>
                <p className="text-white/50 text-xs">
                  Your current stake
                </p>
              </div>
            </div>

            {/* Information Section */}
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-300 text-sm leading-relaxed">
                <strong>ℹ️ How it works:</strong>
              </p>
              <ul className="text-blue-200/70 text-xs mt-2 space-y-1 ml-4 list-disc">
                <li>Claiming rewards does NOT affect your staked amount</li>
                <li>Claimed rewards go directly to your wallet</li>
                <li>You can claim multiple times as rewards accumulate</li>
                <li>Rewards continue accruing after each claim</li>
              </ul>
            </div>

            {/* Claim Button */}
            <button
              onClick={handleClaimRewards}
              disabled={isPending || isConfirming || !pendingRewards || pendingRewards === 0n}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : !pendingRewards || pendingRewards === 0n ? (
                'No Rewards to Claim'
              ) : (
                `Claim ${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL`
              )}
            </button>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            {/* Withdrawal Status Info from Contract */}
            {!loadingWithdrawal && withdrawalStatus && (
              <motion.div
                className={`p-4 rounded-lg border ${withdrawalStatus.canWithdraw
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Withdrawal Status</span>
                  <span className={`text-sm font-semibold ${withdrawalStatus.canWithdraw ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                    {withdrawalStatus.canWithdraw ? '✅ Available' : '⏳ Pending'}
                  </span>
                </div>
                {withdrawalStatus.dailyLimitRemaining !== '0.00' && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Daily Limit Remaining</span>
                    <span className="text-white/80">{withdrawalStatus.dailyLimitRemaining} POL</span>
                  </div>
                )}
                {!withdrawalStatus.canWithdraw && withdrawalStatus.lockedUntilFormatted && (
                  <p className="text-amber-300/80 text-xs mt-2">
                    🔒 Next unlock: {withdrawalStatus.lockedUntilFormatted}
                  </p>
                )}
              </motion.div>
            )}

            <div className="text-center">
              <p className="text-white/80 mb-4">
                Withdraw all your staked amount and accumulated rewards
              </p>
              <p className="text-2xl font-bold text-white mb-6">
                Total: {userStaked ? `${parseFloat(formatEther(userStaked)).toFixed(6)} POL` : '0 POL'} (Staked)
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

            {/* Period Selector Grid for Compound (Simplified) */}
            <div className="space-y-3">
              <label className="text-white/80 text-sm font-medium">Lockup Period for Compounded Rewards</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {STAKING_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => setCompoundLockupDuration(period.value)}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200
                      ${compoundLockupDuration === period.value
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                      }
                    `}
                  >
                    <div className="text-center">
                      <p className={`text-sm font-bold mb-1 ${
                        compoundLockupDuration === period.value ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {period.label}
                      </p>
                      <p className="text-xs text-white/60">{period.roi.annual}</p>
                    </div>
                    {compoundLockupDuration === period.value && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

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
                {userStaked ? `${parseFloat(formatEther(userStaked)).toFixed(6)} POL` : '0 POL'}
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
              disabled={isPending || isConfirming || !userStaked || userStaked === 0n || !isPaused}
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

      {/* Withdraw Confirmation Modal */}
      <WithdrawConfirmationModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={executeWithdraw}
        userStaked={userStaked || 0n}
        pendingRewards={pendingRewards || 0n}
        contractBalance={contractBalance}
        isProcessing={isPending || isConfirming}
      />
    </motion.div>
  )
}

export default StakingForm