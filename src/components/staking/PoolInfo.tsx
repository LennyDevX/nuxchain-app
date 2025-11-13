import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { formatEther } from 'viem'

import { useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'

interface PoolInfoProps {
  totalPoolBalance: bigint | undefined
  uniqueUsersCount: bigint | undefined
}

// Contract address from environment variables
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS || '0xe7A0586f2fB63905BbC771Caf62BF0412cf9DbF3'
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
    <motion.div 
      className="card-unified rounded-xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <motion.h3 
        className="text-xl font-bold text-white mb-4"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        viewport={{ once: true }}
      >
        Pool Info
      </motion.h3>
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        viewport={{ once: true }}
      >
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          viewport={{ once: true }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60">Contract Balance:</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {formatPOL(contractBalance)} POL
            </span>
            <p className="text-white/40 text-xs">Available in contract</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          viewport={{ once: true }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60">Total in Pool:</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {formatPOL(totalPoolBalance)} POL
            </span>
            <p className="text-white/40 text-xs">Total Value Locked</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          viewport={{ once: true }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60">Active Users:</span>
          <div className="text-right">
            <span className="text-white font-medium">
              {uniqueUsersCount ? uniqueUsersCount.toString() : '0'}
            </span>
            <p className="text-white/40 text-xs">Unique stakers</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          viewport={{ once: true }}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        >
          <span className="text-white/60">Estimated APY:</span>
          <div className="text-right">
            <span className="text-green-400 font-bold text-lg">43.8%</span>
            <p className="text-white/40 text-xs">Base Annual Percentage Yield</p>
          </div>
        </motion.div>

        {/* Pool Health Indicator */}
        <motion.div 
          className="mt-6 pt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">Pool Health:</span>
            <motion.span 
              className={`font-medium text-sm ${
                !contractBalance || contractBalance === 0n
                  ? 'text-red-400'
                  : !totalPoolBalance || totalPoolBalance === 0n
                  ? 'text-yellow-400'
                  : contractBalance >= totalPoolBalance
                  ? 'text-green-400'
                  : 'text-orange-400'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {!contractBalance || contractBalance === 0n
                ? 'No Funds'
                : !totalPoolBalance || totalPoolBalance === 0n
                ? 'No Stakes'
                : contractBalance >= totalPoolBalance
                ? 'Excellent'
                : 'Low Funds'}
            </motion.span>
          </div>
          <motion.div 
            className="w-full bg-white/10 rounded-full h-2 overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            viewport={{ once: true }}
          >
            <motion.div 
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
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            ></motion.div>
          </motion.div>
          <motion.p 
            className="text-white/40 text-xs mt-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.55 }}
            viewport={{ once: true }}
          >
            {!contractBalance || contractBalance === 0n
              ? 'Contract has no funds for rewards'
              : !totalPoolBalance || totalPoolBalance === 0n
              ? 'No active stakes in pool'
              : contractBalance >= totalPoolBalance
              ? 'Contract has sufficient funds for all rewards'
              : 'Contract funds may be insufficient for all rewards'}
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
})

PoolInfo.displayName = 'PoolInfo'

export default PoolInfo