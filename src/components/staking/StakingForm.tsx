import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther, formatUnits } from 'viem'
import { polygon } from 'wagmi/chains'
import toast from 'react-hot-toast'
import {
  EnhancedSmartStakingCoreV2ABI as EnhancedSmartStakingCoreABI,
  EnhancedSmartStakingViewABI,
} from '../../lib/export/abis/legacy'
import { validateDepositAmount, validateLockupDuration } from '../../utils/errors/contractErrors'
import { useIsMobile } from '../../hooks/mobile'
import { stakingLogger } from '../../utils/log/stakingLogger'
import { stakingToasts } from '../../utils/toasts/stakingToasts'
import { useUserDeposits } from '../../hooks/staking/useUserDeposits'
import { useTotalClaimedRewardsV2 } from '../../hooks/staking/useTotalClaimedRewardsV2'
import { useStakingAnalytics } from '../../hooks/staking/useStakingAnalytics'
import { WithdrawConfirmationModal } from './WithdrawConfirmationModal'
import { STAKING_PERIODS } from '../../constants/stakingConstants'
import { useStakingContext } from '../../context/useStakingContext'

interface StakingFormProps {
  stakingContractAddress: string
  pendingRewards: bigint | undefined
  isPaused: boolean
  userStaked: bigint | undefined
}

function StakingForm({ stakingContractAddress, pendingRewards, isPaused, userStaked }: StakingFormProps) {
  const { address } = useAccount()
  const isMobile = useIsMobile()
  const { refetchUser, circuitBreaker } = useStakingContext()
  // State for form
  const [depositAmount, setDepositAmount] = useState('')
  const [lockupDuration, setLockupDuration] = useState('0') // default: Flexible
  const [activeTab, setActiveTab] = useState('stake')
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [showCompound, setShowCompound] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const activeToastRef = useRef<string | undefined>(undefined)
  const activeOpRef = useRef<'deposit' | 'withdraw' | 'claim' | 'compound' | 'emergency' | null>(null)

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

  const tabs = useMemo(() => ['stake', 'withdraw'], [])
  const currentTabIndex = tabs.indexOf(activeTab)

  // Get total claimed rewards directly from contract
  const {
    totalClaimed: totalRewardsClaimed,
    refetch: refetchClaimed
  } = useTotalClaimedRewardsV2(
    stakingContractAddress as `0x${string}`,
    address
  )

  // Get withdrawal status from new analytics hook
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

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    e.stopPropagation() // Prevenir propagación al TabNavigation padre
    // Don't interfere with form elements
    const target = e.target as HTMLElement
    if (target.tagName === 'SELECT' || target.tagName === 'OPTION' || target.closest('select')) {
      return
    }
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return
    e.stopPropagation() // Prevenir propagación al TabNavigation padre
    // Don't interfere with form elements
    const target = e.target as HTMLElement
    if (target.tagName === 'SELECT' || target.tagName === 'OPTION' || target.closest('select')) {
      return
    }
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation() // Prevenir propagación al TabNavigation padre
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

  // Keyboard navigation para tabs (Arrow Left/Right)
  const handleKeyDown = useCallback((e: globalThis.KeyboardEvent) => {
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
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Dismiss loading toast on wallet rejection / error
  useEffect(() => {
    if (!writeError) return
    const tid = activeToastRef.current
    const op = activeOpRef.current
    if (op === 'deposit') stakingToasts.depositError(tid)
    else if (op === 'withdraw') stakingToasts.withdrawError(tid)
    else if (op === 'claim') stakingToasts.claimError(tid)
    else if (op === 'compound') stakingToasts.compoundError(tid)
    else if (op === 'emergency') stakingToasts.emergencyError(tid)
    else if (tid) { toast.dismiss(tid) }
    activeToastRef.current = undefined
    activeOpRef.current = null
  }, [writeError])

  // Dismiss loading toast and show success when confirmed
  useEffect(() => {
    if (isConfirmed) {
      const op = activeOpRef.current
      const tid = activeToastRef.current
      if (op === 'deposit') {
        stakingToasts.depositSuccess(depositAmount || '?', tid)
      } else if (op === 'withdraw') {
        stakingToasts.withdrawSuccess(userStaked ? parseFloat(formatEther(userStaked)).toFixed(4) : '?', tid)
      } else if (op === 'claim') {
        stakingToasts.claimSuccess(pendingRewards ? parseFloat(formatEther(pendingRewards)).toFixed(6) : '?', tid)
      } else if (op === 'compound') {
        stakingToasts.compoundSuccess(pendingRewards ? parseFloat(formatEther(pendingRewards)).toFixed(6) : '?', tid)
      } else if (op === 'emergency') {
        stakingToasts.emergencySuccess(userStaked ? parseFloat(formatEther(userStaked)).toFixed(4) : '?', tid)
      }
      activeToastRef.current = undefined
      activeOpRef.current = null
      refetchUserDeposits()
      setTimeout(() => refetchUser(), 1000)
      setTimeout(() => refetchClaimed(), 2000)
    }
  }, [isConfirmed, refetchUserDeposits, refetchUser, refetchClaimed, depositAmount, userStaked, pendingRewards])

  const handleDeposit = useCallback(() => {
    if (!depositAmount || !address) return

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

    const lockupValidation = validateLockupDuration(lockupDuration)
    if (!lockupValidation.isValid) {
      stakingToasts.invalidLockupPeriod()
      return
    }

    const lockupInDays = BigInt(parseInt(lockupDuration))

    stakingLogger.logDeposit({
      amount: depositAmount,
      lockupPeriod: parseInt(lockupDuration),
      user: address || '',
      success: false
    })

    activeOpRef.current = 'deposit'
    activeToastRef.current = stakingToasts.depositPending(depositAmount)
    writeContract({
      address: stakingContractAddress as `0x${string}`,
      abi: EnhancedSmartStakingCoreABI.abi,
      functionName: 'deposit',
      args: [lockupInDays],
      value: parseEther(depositAmount),
    })
  }, [depositAmount, address, balance, lockupDuration, stakingContractAddress, writeContract])

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

  const executeWithdraw = () => {
    stakingLogger.logWithdraw({
      positionId: 1,
      amount: userStaked ? formatEther(userStaked) : '0',
      user: address || '',
      success: false
    })

    activeOpRef.current = 'withdraw'
    activeToastRef.current = stakingToasts.withdrawPending()
    writeContract({
      address: stakingContractAddress as `0x${string}`,
      abi: EnhancedSmartStakingCoreABI.abi,
      functionName: 'withdrawAll',
      chain: polygon,
    })
    setIsWithdrawModalOpen(false)
  }

  const handleCompound = () => {
    if (!address) return

    stakingLogger.logCompound({
      positionId: 1,
      rewardsCompounded: pendingRewards ? formatEther(pendingRewards) : '0',
      newTotalStaked: userStaked && pendingRewards ? formatEther(userStaked + pendingRewards) : '0',
      user: address,
      success: false
    })

    activeOpRef.current = 'compound'
    activeToastRef.current = stakingToasts.compoundPending(
      pendingRewards ? parseFloat(formatEther(pendingRewards)).toFixed(6) : '0'
    )
    writeContract({
      address: stakingContractAddress as `0x${string}`,
      abi: EnhancedSmartStakingCoreABI.abi,
      functionName: 'compound',
    })
  }

  const handleClaimRewards = () => {
    if (!address) return

    stakingLogger.logClaim({
      positionId: 1,
      amount: pendingRewards ? formatEther(pendingRewards) : '0',
      user: address,
      success: false
    })

    activeOpRef.current = 'claim'
    activeToastRef.current = stakingToasts.claimPending(
      pendingRewards ? parseFloat(formatEther(pendingRewards)).toFixed(6) : '0'
    )
    writeContract({
      address: stakingContractAddress as `0x${string}`,
      abi: EnhancedSmartStakingCoreABI.abi,
      functionName: 'withdraw',
    })
  }

  const handleEmergencyWithdraw = () => {
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

    stakingLogger.logEmergencyWithdraw({
      positionId: 1,
      amount: userStaked ? formatEther(userStaked) : '0',
      penalty: '0', // Will be calculated on-chain
      user: address,
      success: false
    })

    activeOpRef.current = 'emergency'
    activeToastRef.current = stakingToasts.emergencyPending()
    writeContract({
      address: stakingContractAddress as `0x${string}`,
      abi: EnhancedSmartStakingCoreABI.abi,
      functionName: 'emergencyUserWithdraw',
    })
  }

  return (
    <motion.div
      className="card-unified overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 2-Tab Header */}
      <div
        ref={tabsContainerRef}
        className="flex border-b border-white/20"
        role="tablist"
      >
        <motion.button
          onClick={() => setActiveTab('stake')}
          role="tab"
          aria-selected={activeTab === 'stake'}
          aria-label="Stake Tab"
          className={`jersey-15-regular flex-1 transition-all duration-200
            ${isMobile ? 'py-3 text-lg' : 'py-4 text-4xl'}
            ${activeTab === 'stake'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          whileTap={{ scale: 0.97 }}
        >
          ⚡ Stake
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('withdraw')}
          role="tab"
          aria-selected={activeTab === 'withdraw'}
          aria-label="Withdraw Tab"
          className={`jersey-15-regular flex-1 transition-all duration-200
            ${isMobile ? 'py-3 text-lg' : 'py-4 text-4xl'}
            ${activeTab === 'withdraw'
              ? 'text-red-400 border-b-2 border-red-400 bg-red-500/10'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          whileTap={{ scale: 0.97 }}
        >
          💸 Withdraw
        </motion.button>
      </div>

      <motion.div
        ref={contentRef}
        className={`${isMobile ? 'p-4' : 'p-6'} relative`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* ── TAB 1: STAKE ── */}
        {activeTab === 'stake' && (
          <div className="space-y-4">

            {/* Rewards bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="jersey-15-regular text-white/60 text-sm">Pending Rewards</p>
                <p className="jersey-20-regular text-yellow-400 font-bold text-2xl md:text-3xl truncate leading-tight">
                  {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0.000000 POL'}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleClaimRewards}
                  disabled={isPending || isConfirming || !pendingRewards || pendingRewards === 0n}
                  className="jersey-20-regular text-2xl px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isPending || isConfirming ? '...' : 'Claim'}
                </button>
                <button
                  onClick={() => setShowCompound(v => !v)}
                  disabled={!pendingRewards || pendingRewards === 0n}
                  className="jersey-20-regular text-sm px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Compound {showCompound ? '▴' : '▾'}
                </button>
              </div>
            </div>

            {/* Compound inline panel */}
            {showCompound && (
              <div className="space-y-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="jersey-15-regular text-emerald-400 text-lg font-medium">Compound Rewards</p>
                  {userStaked && userStaked > 0n && pendingRewards && pendingRewards > 0n && (
                    <p className="jersey-20-regular text-white/60 text-xl">
                      New total: <span className="text-emerald-400 font-bold">{parseFloat(formatEther(userStaked + pendingRewards)).toFixed(4)} POL</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCompound}
                  disabled={isPending || isConfirming || !pendingRewards || pendingRewards === 0n}
                  className="w-full jersey-20-regular text-base py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white border border-emerald-500/50 transition-all"
                >
                  {isPending || isConfirming ? 'Processing...' : 'Compound Now'}
                </button>
              </div>
            )}

            {/* Deposit input */}
            <div>
              <label className="block jersey-15-regular text-white/80 font-medium mb-2 text-lg">
                Amount to deposit (POL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3.5 pr-16 jersey-20-regular text-white text-lg placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
                <div className="absolute right-3 top-3.5 jersey-20-regular text-white/60 text-lg">POL</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="jersey-20-regular text-base md:text-xl text-white/60">
                  Balance: <span className="text-white/80 font-medium">{balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}` : '0 POL'}</span>
                </span>
                {depositAmount && parseFloat(depositAmount) > 0 && (
                  <span className="jersey-20-regular text-base : md:text-xl text-blue-400">
                    Fee 6%: {(parseFloat(depositAmount) * 0.06).toFixed(4)} · Net: <span className="font-bold">{(parseFloat(depositAmount) * 0.94).toFixed(4)} POL</span>
                  </span>
                )}
              </div>
            </div>

            {/* Lockup period */}
            <div className="space-y-2">
              <label className="jersey-15-regular text-white/80 text-xl font-medium">Lockup Period</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {STAKING_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => setLockupDuration(period.value)}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200
                      ${lockupDuration === period.value
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                  >
                    <div className="text-center">
                      <p className={`jersey-15-regular text-xl font-bold ${lockupDuration === period.value ? 'text-emerald-400' : 'text-white'}`}>
                        {period.label}
                      </p>
                      <p className={`jersey-20-regular text-xl font-semibold mt-0.5 ${lockupDuration === period.value ? 'text-emerald-300' : 'text-white/60'}`}>{period.roi.annual}</p>
                    </div>
                    {lockupDuration === period.value && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={!depositAmount || isPending || isConfirming || isPaused || circuitBreaker?.isBlocked}
              title={circuitBreaker?.isBlocked ? 'Deposits temporarily paused by circuit breaker' : undefined}
              className="w-full btn-primary jersey-20-regular text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {circuitBreaker?.isBlocked
                ? '🛑 Deposits Temporarily Paused'
                : isPaused
                ? 'Contract Paused'
                : isPending || isConfirming
                ? 'Processing...'
                : 'Stake Now'}
            </button>


          </div>
        )}

        {/* ── TAB 2: WITHDRAW ── */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4">

            {/* Withdrawal status badge */}
            {!loadingWithdrawal && withdrawalStatus && (
              <div className={`flex items-center justify-between px-4 py-3 rounded-lg border
                ${withdrawalStatus.canWithdraw
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <span className="jersey-20-regular text-white/60 text-sm">Withdrawal Status</span>
                <div className="text-right">
                  <span className={`jersey-15-regular font-bold text-base ${withdrawalStatus.canWithdraw ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {withdrawalStatus.canWithdraw ? '✅ Available' : '⏳ Locked'}
                  </span>
                  {!withdrawalStatus.canWithdraw && withdrawalStatus.lockedUntilFormatted && (
                    <p className="jersey-20-regular text-amber-300/80 text-sm mt-0.5">
                      Unlocks: {withdrawalStatus.lockedUntilFormatted}
                    </p>
                  )}
                  {withdrawalStatus.dailyLimitRemaining !== '0.00' && (
                    <p className="jersey-20-regular text-white/60 text-sm mt-0.5">
                      Daily limit: {withdrawalStatus.dailyLimitRemaining} POL
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Locked deposits warning */}
            {lockedDeposits > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <span className="text-amber-400 text-base">⚠️</span>
                <p className="jersey-20-regular text-amber-400 text-sm">
                  {lockedDeposits} locked deposit(s) — early withdrawal may incur penalties
                </p>
              </div>
            )}

            {/* Amounts summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="jersey-15-regular text-white/60 text-sm mb-1">Staked</p>
                <p className="jersey-20-regular text-white font-bold text-2xl md:text-3xl leading-tight">
                  {userStaked ? `${parseFloat(formatEther(userStaked)).toFixed(4)}` : '0'}
                </p>
                <p className="jersey-20-regular text-white/50 text-sm">POL</p>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="jersey-15-regular text-white/60 text-sm mb-1">Rewards</p>
                <p className="jersey-20-regular text-yellow-400 font-bold text-2xl md:text-3xl leading-tight">
                  {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(4)}` : '0'}
                </p>
                <p className="jersey-20-regular text-yellow-400/60 text-sm">POL</p>
              </div>
            </div>

            <button
              onClick={handleWithdrawAll}
              disabled={isPending || isConfirming}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg jersey-20-regular text-lg"
            >
              {isPending || isConfirming ? 'Processing...' : 'Withdraw All (Stake + Rewards)'}
            </button>

            {/* Emergency — collapsible */}
            <div className="border border-red-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowEmergency(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-red-500/5 hover:bg-red-500/10 transition-colors"
              >
                <span className="jersey-15-regular text-red-400/80 text-sm font-medium">⚠️ Emergency Withdrawal</span>
                <span className="text-red-400/60 text-sm">{showEmergency ? '▴' : '▾'}</span>
              </button>

              {showEmergency && (
                <div className="p-3 space-y-3 bg-red-500/5">
                  <ul className="jersey-20-regular text-red-300/80 text-sm space-y-1">
                    <li>• Ignores lockup periods — withdraws principal only</li>
                    <li>• You <strong>lose ALL pending rewards</strong> — irreversible</li>
                    <li>• Only available when contract is paused</li>
                  </ul>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="jersey-15-regular text-white/50 text-xs">Principal</p>
                      <p className="jersey-20-regular text-white font-bold text-lg">
                        {userStaked ? `${parseFloat(formatEther(userStaked)).toFixed(4)} POL` : '0 POL'}
                      </p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <p className="jersey-15-regular text-red-400/60 text-xs">Rewards lost</p>
                      <p className="jersey-20-regular text-red-400 font-bold text-lg">
                        {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(4)} POL` : '0 POL'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleEmergencyWithdraw}
                    disabled={isPending || isConfirming || !userStaked || userStaked === 0n || !isPaused}
                    className="w-full jersey-20-regular text-base py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white border border-red-500/50 transition-all"
                  >
                    {!isPaused ? 'Only available when paused' : isPending || isConfirming ? 'Processing...' : '🚨 Emergency Withdraw'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Transaction Success */}
      {isConfirmed && (
        <motion.div
          className="mx-4 mb-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="jersey-15-regular text-green-400 text-base">Transaction completed successfully</span>
          </div>
        </motion.div>
      )}

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