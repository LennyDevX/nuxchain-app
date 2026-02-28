import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatEther } from 'viem'

interface StakingStatsProps {
  totalPoolBalance: bigint
  uniqueUsersCount: bigint
  userStaked: bigint
  pendingRewards: bigint
}

const StakingStats: React.FC<StakingStatsProps> = memo(({
  totalPoolBalance,
  uniqueUsersCount,
  userStaked,
  pendingRewards,
}) => {
  const statsData = useMemo(() => [
    {
      title: 'Total Pool',
      value: totalPoolBalance ? parseFloat(formatEther(totalPoolBalance)).toFixed(2) : '0',
      subtitle: 'Contract Balance',
      emoji: '💰'
    },
    {
      title: 'Users',
      value: uniqueUsersCount ? uniqueUsersCount.toString() : '0',
      subtitle: 'Staking participants',
      emoji: '👥'
    },
    {
      title: 'Your Stake',
      value: userStaked ? parseFloat(formatEther(userStaked)).toFixed(4) : '0',
      subtitle: 'POL deposited',
      emoji: '📈'
    },
    {
      title: 'Rewards',
      value: pendingRewards ? parseFloat(formatEther(pendingRewards)).toFixed(6) : '0.000000',
      subtitle: 'Pending rewards',
      emoji: '🎁'
    }
  ], [totalPoolBalance, uniqueUsersCount, userStaked, pendingRewards])

  // Simplified minimalist design matching mockup
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-3 lg:p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-lg lg:text-2xl">{stat.emoji}</span>
            <p className="jersey-15-regular text-white/60 text-xs lg:text-base font-medium leading-tight">{stat.title}</p>
          </div>
          <p className="jersey-20-regular text-white text-xl lg:text-3xl font-bold mb-0.5">{stat.value}</p>
          <p className="jersey-20-regular text-white/40 text-xs lg:text-sm">{stat.subtitle}</p>
        </motion.div>
      ))}
    </div>
  )
})

StakingStats.displayName = 'StakingStats'

export default StakingStats