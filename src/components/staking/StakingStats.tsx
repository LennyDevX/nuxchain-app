import React, { memo } from 'react'
import { formatEther } from 'viem'
import { useIsMobile } from '../../hooks/mobile'

interface StakingStatsProps {
  totalPoolBalance: bigint
  uniqueUsersCount: bigint
  totalDeposit: bigint
  pendingRewards: bigint
  contractVersion: bigint | undefined
  contractBalance: bigint | undefined
}

const StakingStats: React.FC<StakingStatsProps> = memo(({
  totalPoolBalance,
  uniqueUsersCount,
  totalDeposit,
  pendingRewards,
  contractVersion,
  contractBalance,
}) => {
  const isMobile = useIsMobile()

  return (
    <div className={`grid gap-4 mb-8 ${
      isMobile 
        ? 'grid-cols-2 gap-3' 
        : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6'
    }`}>
      <div className={`card-stats ${
        isMobile ? 'p-4' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-white/60 font-medium truncate ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>Total Pool</span>
          <span className={isMobile ? 'text-base' : 'text-lg'}>💰</span>
        </div>
        <div className="mb-1">
          <h3 className={`font-bold text-white truncate ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            {totalPoolBalance ? parseFloat(formatEther(totalPoolBalance)).toFixed(2) : '0'}
          </h3>
        </div>
        <div className={`text-white/40 truncate ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          POL staked
        </div>
      </div>

      <div className={`card-stats ${
        isMobile ? 'p-4' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-white/60 font-medium truncate ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>Users</span>
          <span className={isMobile ? 'text-base' : 'text-lg'}>👥</span>
        </div>
        <div className="mb-1">
          <h3 className={`font-bold text-white truncate ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            {uniqueUsersCount ? uniqueUsersCount.toString() : '0'}
          </h3>
        </div>
        <div className={`text-white/40 truncate ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          {isMobile ? 'Participants' : 'Staking participants'}
        </div>
      </div>

      <div className={`card-stats ${
        isMobile ? 'p-4' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-white/60 font-medium truncate ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>Your Stake</span>
          <span className={isMobile ? 'text-base' : 'text-lg'}>📈</span>
        </div>
        <div className="mb-1">
          <h3 className={`font-bold text-white truncate ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            {totalDeposit ? parseFloat(formatEther(totalDeposit)).toFixed(4) : '0'}
          </h3>
        </div>
        <div className={`text-white/40 truncate ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          POL deposited
        </div>
      </div>

      <div className={`card-stats ${
        isMobile ? 'p-4' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-white/60 font-medium truncate ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>Rewards</span>
          <span className={isMobile ? 'text-base' : 'text-lg'}>🎁</span>
        </div>
        <div className="mb-1">
          <h3 className={`font-bold text-white truncate ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            {pendingRewards ? parseFloat(formatEther(pendingRewards)).toFixed(6) : '0'}
          </h3>
        </div>
        <div className={`text-white/40 truncate ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          {isMobile ? 'Pending' : 'Pending rewards'}
        </div>
      </div>

      {!isMobile && (
        <>
          <div className="card-stats">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-xs font-medium truncate">Contract Version</span>
              <span className="text-lg">📄</span>
            </div>
            <div className="mb-1">
              <h3 className="text-xl font-bold text-white truncate">
                {contractVersion ? `v${contractVersion.toString()}` : 'v0'}
              </h3>
            </div>
            <div className="text-white/40 text-xs truncate">
              Smart contract
            </div>
          </div>

          <div className="card-stats">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-xs font-medium truncate">Contract Balance</span>
              <span className="text-lg">🏦</span>
            </div>
            <div className="mb-1">
              <h3 className="text-xl font-bold text-white truncate">
                {contractBalance ? parseFloat(formatEther(contractBalance)).toFixed(4) : '0'}
              </h3>
            </div>
            <div className="text-white/40 text-xs truncate">
              Available funds
            </div>
          </div>
        </>
      )}
    </div>
  )
})

StakingStats.displayName = 'StakingStats'

export default StakingStats