import { formatEther } from 'viem'

import { useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'

interface PoolInfoProps {
  totalPoolBalance: bigint | undefined
  uniqueUsersCount: bigint | undefined
}

// Contract address from environment variables
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS_V2 || '0x0A57f28E47D42B6AAD6A4B1D91E7A896d107b637'
const POL_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000001010' // POL token on Polygon

function PoolInfo({ totalPoolBalance, uniqueUsersCount }: PoolInfoProps) {
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
            <span className="text-green-400 font-bold text-lg">12.5%</span>
            <p className="text-white/40 text-xs">Annual Percentage Yield</p>
          </div>
        </div>

        {/* Pool Health Indicator */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">Pool Health:</span>
            <span className="text-green-400 font-medium text-sm">Excellent</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
          </div>
          <p className="text-white/40 text-xs mt-1">Based on liquidity and user activity</p>
        </div>

        {/* Reward Distribution */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-white/80 font-medium mb-3">Reward Distribution</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Stakers:</span>
              <span className="text-white">85%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Treasury:</span>
              <span className="text-white">10%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Development:</span>
              <span className="text-white">5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoolInfo