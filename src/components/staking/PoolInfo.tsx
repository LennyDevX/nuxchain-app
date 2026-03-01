import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { formatEther } from 'viem'
import { useReadContract, useAccount, useWatchContractEvent } from 'wagmi'
import type { Abi } from 'viem'
import EnhancedSmartStakingABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json'
import { stakingLogger } from '../../utils/log/stakingLogger'

interface PoolInfoProps {
  totalPoolBalance?: bigint
  uniqueUsersCount?: bigint
  poolContractBalance?: bigint
}

// Contract address from environment variables - using Core Contract only (View Contract functions are reverting)
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`

const PoolInfo: React.FC<PoolInfoProps> = memo(({ totalPoolBalance, uniqueUsersCount, poolContractBalance: passedPoolBalance }) => {
  const { chain, address } = useAccount()

  // ✅ FIX: Use Core Contract instead of failing View Contract
  // Get contract balance directly from Core Contract (View Contract is reverting)
  const { data: poolContractBalanceData, refetch: refetchPoolBalance } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: EnhancedSmartStakingABI.abi as Abi,
    functionName: 'getContractBalance',
    chainId: chain?.id,
  }) as { data: bigint | undefined; refetch: () => Promise<unknown> }

  // Watch for deposits and refetch pool balance
  useWatchContractEvent({
    address: STAKING_CONTRACT_ADDRESS,
    abi: EnhancedSmartStakingABI.abi as Abi,
    eventName: 'Deposited',
    onLogs: () => {
      // Refetch pool balance when any deposit is made
      setTimeout(() => refetchPoolBalance(), 2000);
    },
  });

  // ✅ Get user info from Core Contract (View Contract functions are reverting)
  const { data: userInfoData } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: EnhancedSmartStakingABI.abi as Abi,
    functionName: 'getUserInfo',
    args: [address],
    chainId: chain?.id,
    query: { enabled: !!address, staleTime: 10000, gcTime: 30000 }
  }) as { data: readonly [bigint?, bigint?, bigint?, bigint?] | undefined }

  // Extract values from Core Contract calls
  // Use passed balance if available, otherwise use fetched data or 0n
  const poolContractBalance = passedPoolBalance || poolContractBalanceData || 0n
  const poolTotalValue = totalPoolBalance // Passed from parent component
  const poolActiveUsers = uniqueUsersCount // Passed from parent component

  // Extract user info from getUserInfo: [totalDeposited, totalRewards, depositCount, lastWithdrawTime]
  const userTotalStaked = userInfoData?.[0] || 0n
  const userFlexibleBalance = userTotalStaked || 0n // For now, all staked is considered flexible unless locked
  const userLockedBalance = 0n // Would need additional logic to determine locked amount

  // Debug: Log pool balance data
  if (import.meta.env.DEV && poolContractBalance) {
    console.log('[PoolInfo] Core Contract Balance:', {
      raw: poolContractBalance,
      formatted: poolContractBalance.toString(),
    });
  }

  // ✅ FIX: Calculate Pool Health based on reserve ratio
  // Reserve Ratio = (contractBalance / totalPoolValue) * 100
  // Healthy pool should have contractBalance >= totalPoolValue (ratio >= 100%)
  const calculateHealthStatus = () => {
    if (!poolContractBalance || !poolTotalValue || poolTotalValue === 0n) {
      return {
        status: 1, // Default to "Low" if no data
        message: 'Calculating pool health...',
        ratio: 0n,
      };
    }

    // Calculate reserve ratio in basis points (10000 = 100%)
    const ratioBasisPoints = (poolContractBalance * 10000n) / poolTotalValue;

    // Determine health status based on ratio
    // > 100% (10000bp) = Excellent (3)
    // 75-100% (7500-10000bp) = Moderate (2) 
    // 50-75% (5000-7500bp) = Low (1)
    // < 50% (< 5000bp) = Critical (0)
    let status: number;
    let message: string;

    if (ratioBasisPoints >= 10000n) {
      status = 3; // Excellent
      message = 'Pool is fully backed and healthy';
    } else if (ratioBasisPoints >= 7500n) {
      status = 2; // Moderate
      message = 'Pool health is moderate, sufficient reserves';
    } else if (ratioBasisPoints >= 5000n) {
      status = 1; // Low
      message = 'Pool reserves are lower than optimal';
    } else {
      status = 0; // Critical
      message = 'Critical: Pool reserves are significantly low';
    }

    return { status, message, ratio: ratioBasisPoints };
  };

  const poolHealth = calculateHealthStatus();
  const healthStatus = poolHealth.status;
  const statusMessage = poolHealth.message;
  const reserveRatio = poolHealth.ratio;

  // Debug logs to verify data extraction (remove in production)
  stakingLogger.logPool({
    totalPoolBalance: poolTotalValue ? formatEther(poolTotalValue) : '0',
    uniqueUsers: poolActiveUsers ? Number(poolActiveUsers) : 0,
    totalDeposits: poolTotalValue ? formatEther(poolTotalValue) : '0',
    isPaused: false,
    minDeposit: '1',
    maxDeposit: statusMessage
  })

  // Format balance with proper decimals (POL has 18 decimals like ETH)
  const formatPOL = (balance: bigint | undefined, decimals = 4) => {
    if (!balance) return '0.00'
    return parseFloat(formatEther(balance)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    })
  }

  // Get health status text and color - MORE VIBRANT COLORS
  const getHealthStatus = (status?: number) => {
    switch (status) {
      case 0: return { text: 'Critical', color: 'text-red-500', bgColor: 'bg-gradient-to-r from-red-500 to-red-600', borderColor: 'border-red-400', shadowColor: 'shadow-red-500/50' }
      case 1: return { text: 'Low', color: 'text-orange-500', bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600', borderColor: 'border-orange-400', shadowColor: 'shadow-orange-500/50' }
      case 2: return { text: 'Moderate', color: 'text-yellow-500', bgColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600', borderColor: 'border-yellow-400', shadowColor: 'shadow-yellow-500/50' }
      case 3: return { text: 'Excellent', color: 'text-emerald-500', bgColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600', borderColor: 'border-emerald-400', shadowColor: 'shadow-emerald-500/50' }
      default: return { text: 'Unknown', color: 'text-slate-400', bgColor: 'bg-gradient-to-r from-slate-500 to-slate-600', borderColor: 'border-slate-400', shadowColor: 'shadow-slate-500/50' }
    }
  }

  return (
    <motion.div
      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="jersey-15-regular text-xl lg:text-3xl font-bold text-white mb-1">Pool Contract</h3>
        <p className="jersey-20-regular text-sm lg:text-base text-white/60">Smart contract status & metrics</p>
      </div>

      {/* Key Metrics - Vertical Compact Layout */}
      <div className="space-y-4">
        {/* Pool Contract Balance */}
        <div className="bg-white/5 rounded-lg p-4">
          <p className="jersey-20-regular text-xs lg:text-sm text-white/60 mb-1">Contract Reserve</p>
          <p className="jersey-20-regular text-2xl lg:text-3xl font-bold text-emerald-400">
            {formatPOL(poolContractBalance, 2)} POL
          </p>
          <p className="jersey-20-regular text-xs lg:text-sm text-white/40 mt-1">Available liquidity</p>
        </div>

        {/* Pool Health Status */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="jersey-20-regular text-xs lg:text-sm text-white/60">Reserve Health</p>
            <span className={`jersey-15-regular text-sm font-bold px-3 py-1 rounded-full border ${getHealthStatus(healthStatus).borderColor} ${getHealthStatus(healthStatus).color}`}>
              {getHealthStatus(healthStatus).text}
            </span>
          </div>
          
          {/* Health Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-2 rounded-full ${getHealthStatus(healthStatus).bgColor} transition-all duration-500`}
              style={{ width: `${Math.min((Number(reserveRatio || 0n) / 100), 100)}%` }}
            ></div>
          </div>
          
          <p className="jersey-20-regular text-xs lg:text-sm text-white/50">
            Reserve Ratio: <span className={`jersey-20-regular ${getHealthStatus(healthStatus).color}`}>
              {reserveRatio ? (Number(reserveRatio) / 100).toFixed(1) : '0'}%
            </span>
          </p>
        </div>

        {/* Commission Rate */}
        <div className="bg-white/5 rounded-lg p-4">
          <p className="jersey-20-regular text-xs lg:text-sm text-white/60 mb-1">Commission Rate</p>
          <p className="jersey-20-regular text-lg lg:text-xl font-semibold text-blue-400">6%</p>
          <p className="jersey-20-regular text-xs lg:text-sm text-white/40 mt-1">Per deposit transaction</p>
        </div>

        {/* Daily Withdrawal Limit */}
        <div className="bg-white/5 rounded-lg p-4">
          <p className="jersey-20-regular text-xs lg:text-sm text-white/60 mb-1">Daily Withdrawal Limit</p>
          <p className="jersey-20-regular text-lg lg:text-xl font-semibold text-orange-400">2,000 POL</p>
          <p className="jersey-20-regular text-xs lg:text-sm text-white/40 mt-1">Per 24 hours</p>
        </div>

        {/* Flexible/Locked Ratio - Optional visibility for connected users */}
        {address && userTotalStaked > 0n && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-lg p-4">
            <p className="jersey-20-regular text-xs lg:text-sm text-white/60 mb-2">Flexible / Locked Staking</p>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="jersey-15-regular text-xs text-blue-400 mb-1">Flexible</p>
                <p className="jersey-20-regular text-sm font-semibold text-white">
                  {userFlexibleBalance > 0n ? formatPOL(userFlexibleBalance, 2) : '0.00'}
                </p>
              </div>
              <div className="text-white/40">/</div>
              <div className="text-center">
                <p className="jersey-15-regular text-xs text-purple-400 mb-1">Locked</p>
                <p className="jersey-20-regular text-sm font-semibold text-white">
                  {userLockedBalance > 0n ? formatPOL(userLockedBalance, 2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer: View on PolygonScan */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <a
          href={`https://polygonscan.com/address/${STAKING_CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 jersey-15-regular text-sm lg:text-base text-white/60 hover:text-white/90 transition-colors"
        >
          <span>View Contract</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </motion.div>
  )
})

PoolInfo.displayName = 'PoolInfo'

export default PoolInfo