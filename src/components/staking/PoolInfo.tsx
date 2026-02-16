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
}

// Contract address from environment variables - using Core Contract only (View Contract functions are reverting)
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`

const PoolInfo: React.FC<PoolInfoProps> = memo(({ totalPoolBalance, uniqueUsersCount }) => {
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
  // poolContractBalanceData is bigint directly from getContractBalance
  const poolContractBalance = poolContractBalanceData
  const poolTotalValue = totalPoolBalance // Passed from parent component
  const poolActiveUsers = uniqueUsersCount // Passed from parent component

  // Extract user info from getUserInfo: [totalDeposited, totalRewards, depositCount, lastWithdrawTime]
  const userTotalStaked = userInfoData?.[0] as bigint | undefined
  const userFlexibleBalance = userTotalStaked // For now, all staked is considered flexible unless locked
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
      className="card-unified rounded-xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        className="text-xl font-bold text-white mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Pool Info
      </motion.h3>
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60">Contract Balance:</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {formatPOL(poolContractBalance)} POL
            </span>
            <p className="text-white/40 text-xs">Available in contract</p>
          </div>
        </motion.div>

        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60">Total Pool Value:</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {formatPOL(poolTotalValue || totalPoolBalance)} POL
            </span>
            <p className="text-white/40 text-xs">All stakes + rewards</p>
          </div>
        </motion.div>

        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60">Active Users:</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {poolActiveUsers ? poolActiveUsers.toString() : (uniqueUsersCount ? uniqueUsersCount.toString() : '0')}
            </span>
            <p className="text-white/40 text-xs">Unique stakers</p>
          </div>
        </motion.div>

        {/* Reward Payout Capacity - Based on Pool Health */}
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60">Reward Payout:</span>
          <div className="text-right">
            <span className={`font-medium ${healthStatus === 3 ? 'text-emerald-500' : healthStatus === 2 ? 'text-yellow-500' : healthStatus === 1 ? 'text-orange-500' : 'text-red-500'}`}>
              {healthStatus === 3 ? '✅ Optimal' : healthStatus === 2 ? '⚠️ Stable' : healthStatus === 1 ? '⚠️ Limited' : '❌ Insufficient'}
            </span>
            <p className="text-white/40 text-xs">Capacity to pay rewards</p>
          </div>
        </motion.div>

        {/* Stake Distribution - User Personal Breakdown */}
        {address && (userFlexibleBalance > 0n || userLockedBalance > 0n || userTotalStaked > 0n) && (
          <motion.div
            className="mt-4 pt-4 border-t border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <h4 className="text-white/80 font-semibold text-sm mb-3">📊 Your Stake Distribution</h4>
            
            {/* Total Staked */}
            <motion.div
              className="flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-lg p-3 mb-3"
              whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}
            >
              <div>
                <div className="text-cyan-300 text-sm font-semibold">💎 Total Staked</div>
                <div className="text-white/50 text-xs">All your deposits</div>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-bold text-lg">{formatPOL(userTotalStaked, 2)} POL</div>
                <div className="text-white/40 text-xs">Flexible + Locked</div>
              </div>
            </motion.div>

            <div className="space-y-3">
              {/* Flexible Stakes */}
              <motion.div
                className="flex justify-between items-center bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-3"
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
              >
                <div>
                  <div className="text-blue-300 text-sm font-semibold">🔓 Flexible Stakes</div>
                  <div className="text-white/50 text-xs">No lock - withdraw anytime</div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 font-bold text-base">{formatPOL(userFlexibleBalance, 2)} POL</div>
                  <div className="text-white/40 text-xs">
                    {userTotalStaked > 0n ? `${((Number(userFlexibleBalance) / Number(userTotalStaked)) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
              </motion.div>

              {/* Locked Stakes */}
              <motion.div
                className="flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-lg p-3"
                whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.15)' }}
              >
                <div>
                  <div className="text-purple-300 text-sm font-semibold">🔒 Locked Stakes</div>
                  <div className="text-white/50 text-xs">Time-locked (30-365 days)</div>
                </div>
                <div className="text-right">
                  <div className="text-purple-400 font-bold text-base">{formatPOL(userLockedBalance, 2)} POL</div>
                  <div className="text-white/40 text-xs">
                    {userTotalStaked > 0n ? `${((Number(userLockedBalance) / Number(userTotalStaked)) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Pool Health Indicator */}
        <motion.div
          className="mt-6 pt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/60 text-sm font-semibold">💪 Pool Health:</span>
            <motion.span
              className={`font-bold text-base ${getHealthStatus(healthStatus).color} px-3 py-1 rounded-full ${getHealthStatus(healthStatus).borderColor} border`}
              whileHover={{ scale: 1.1 }}
            >
              {getHealthStatus(healthStatus).text}
            </motion.span>
          </div>
          <motion.p className="text-white/50 text-xs mb-4 italic">
            {statusMessage || 'Loading pool health status...'}
          </motion.p>
          
          {/* Health Bar with Shadow Effect */}
          <motion.div
            className={`w-full bg-white/5 rounded-full h-3 overflow-hidden border ${getHealthStatus(healthStatus).borderColor} shadow-lg`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <motion.div
              className={`h-3 rounded-full ${getHealthStatus(healthStatus).bgColor} shadow-lg ${getHealthStatus(healthStatus).shadowColor}`}
              style={{
                width: `${(Number(reserveRatio || 0n) / 10000) * 100}%` // reserveRatio is in basis points
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            ></motion.div>
          </motion.div>
          
          <motion.p
            className="text-white/60 text-xs mt-2 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.55 }}
          >
            Reserve Ratio: <span className={`${getHealthStatus(healthStatus).color}`}>{reserveRatio ? (Number(reserveRatio) / 100).toFixed(2) : '0'}%</span>
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
})

PoolInfo.displayName = 'PoolInfo'

export default PoolInfo