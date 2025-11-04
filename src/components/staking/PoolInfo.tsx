import React, { memo } from 'react'
import { formatEther } from 'viem'

import { useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'

interface PoolInfoProps {
  totalPoolBalance: bigint | undefined
  uniqueUsersCount: bigint | undefined
}

// Contract address from environment variables
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS || '0xae57acBf4efE2F6536D992F86145a20e11DB8C3D'
const POL_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000001010' // POL token on Polygon

const PoolInfo: React.FC<PoolInfoProps> = memo(({ totalPoolBalance, uniqueUsersCount }) => {
  // Get actual contract balance
  const { data: contractBalance } = useReadContract({
    address: POL_CONTRACT_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [STAKING_CONTRACT_ADDRESS as `0x${string}`],
  })

  // Format balance with proper decimals (POL has 18 decimals like ETH)
  const formatPOL = (balance: bigint | undefined) => {
    if (!balance) return '0.00'
    return parseFloat(formatEther(balance)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    })
  }

  return (
    <div className="card-unified rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Pool Info</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Contract Balance:</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {formatPOL(contractBalance)} POL
            </span>
            <p className="text-white/40 text-xs">Available in contract</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/60">Total in Pool:</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {formatPOL(totalPoolBalance)} POL
            </span>
            <p className="text-white/40 text-xs">Total Value Locked</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/60">Active Users:</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {uniqueUsersCount ? uniqueUsersCount.toString() : '0'}
            </span>
            <p className="text-white/40 text-xs">Unique stakers</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/60">Estimated APY:</span>
          <div className="text-right">
            <span className="text-green-400 font-bold text-lg">43.8%</span>
            <p className="text-white/40 text-xs">Base Annual Percentage Yield</p>
          </div>
        </div>

        {/* Pool Health Indicator */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">Pool Health:</span>
            <span className={`font-medium text-sm ${
              !contractBalance || contractBalance === 0n
                ? 'text-red-400'
                : !totalPoolBalance || totalPoolBalance === 0n
                ? 'text-yellow-400'
                : contractBalance >= totalPoolBalance
                ? 'text-green-400'
                : 'text-orange-400'
            }`}>
              {!contractBalance || contractBalance === 0n
                ? 'No Funds'
                : !totalPoolBalance || totalPoolBalance === 0n
                ? 'No Stakes'
                : contractBalance >= totalPoolBalance
                ? 'Excellent'
                : 'Low Funds'}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                !contractBalance || contractBalance === 0n
                  ? 'bg-gradient-to-r from-red-400 to-red-500'
                  : !totalPoolBalance || totalPoolBalance === 0n
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  : contractBalance >= totalPoolBalance
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-orange-400 to-orange-500'
              }`}
              style={{ 
                width: !contractBalance || contractBalance === 0n
                  ? '0%'
                  : !totalPoolBalance || totalPoolBalance === 0n
                  ? '50%'
                  : `${Math.min(100, Number((contractBalance * 100n) / totalPoolBalance))}%`
              }}
            ></div>
          </div>
          <p className="text-white/40 text-xs mt-1">
            {!contractBalance || contractBalance === 0n
              ? 'Contract has no funds for rewards'
              : !totalPoolBalance || totalPoolBalance === 0n
              ? 'No active stakes in pool'
              : contractBalance >= totalPoolBalance
              ? 'Contract has sufficient funds for all rewards'
              : 'Contract funds may be insufficient for all rewards'}
          </p>
        </div>


      </div>
    </div>
  )
})

PoolInfo.displayName = 'PoolInfo'

export default PoolInfo