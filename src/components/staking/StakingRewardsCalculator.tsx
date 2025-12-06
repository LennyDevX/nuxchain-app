import { useState, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatEther, parseEther } from 'viem'

interface RewardCalculation {
  dailyReward: string
  monthlyReward: string
  totalReward: string
  finalAmount: string
  apy: number
  effectiveAPY: number
}

interface StakingRewardsCalculatorProps {
  defaultAmount?: number
  className?: string
}

// APY rates - Updated December 2024
const PERIODS = [
  { key: 'flex', days: 0, apy: 26.3, label: '0d' },
  { key: '30d', days: 30, apy: 43.8, label: '30d' },
  { key: '90d', days: 90, apy: 78.8, label: '90d' },
  { key: '180d', days: 180, apy: 105.1, label: '180d' },
  { key: '365d', days: 365, apy: 157.7, label: '365d' }
]

// Skills that affect staking rewards - Based on IStakingIntegration.sol
const STAKING_SKILLS = [
  { id: 'STAKE_BOOST_I', name: 'Stake Boost I', emoji: '📈', bonus: 5, type: 'apy' },
  { id: 'STAKE_BOOST_II', name: 'Stake Boost II', emoji: '📊', bonus: 10, type: 'apy' },
  { id: 'STAKE_BOOST_III', name: 'Stake Boost III', emoji: '💹', bonus: 20, type: 'apy' },
  { id: 'AUTO_COMPOUND', name: 'Auto Compound', emoji: '🔄', bonus: 15, type: 'compound' },
  { id: 'LOCK_REDUCER', name: 'Lock Reducer', emoji: '🔓', bonus: 25, type: 'lock' },
  { id: 'FEE_REDUCER_I', name: 'Fee Reducer I', emoji: '💰', bonus: 10, type: 'fee' },
  { id: 'FEE_REDUCER_II', name: 'Fee Reducer II', emoji: '💸', bonus: 25, type: 'fee' },
]

const StakingRewardsCalculator = memo(({ defaultAmount = 1000, className = '' }: StakingRewardsCalculatorProps) => {
  const [stakingAmount, setStakingAmount] = useState<number>(defaultAmount)
  const [inputValue, setInputValue] = useState<string>(defaultAmount.toString())
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1) // Default: 30d
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setInputValue(value)
    const numValue = parseInt(value) || 0
    if (numValue >= 10 && numValue <= 100000) {
      setStakingAmount(numValue)
    }
  }

  // Handle blur - validate and format
  const handleInputBlur = () => {
    let value = parseInt(inputValue) || 10
    if (value < 10) value = 10
    if (value > 100000) value = 100000
    setStakingAmount(value)
    setInputValue(value.toString())
  }

  // Toggle skill selection
  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(s => s !== skillId)
        : [...prev, skillId]
    )
  }

  // Calculate total skill bonus
  const skillBonuses = useMemo(() => {
    let apyBonus = 0
    let compoundBonus = 0
    let lockReduction = 0
    let feeReduction = 0

    selectedSkills.forEach(skillId => {
      const skill = STAKING_SKILLS.find(s => s.id === skillId)
      if (skill) {
        if (skill.type === 'apy') apyBonus += skill.bonus
        if (skill.type === 'compound') compoundBonus += skill.bonus
        if (skill.type === 'lock') lockReduction += skill.bonus
        if (skill.type === 'fee') feeReduction += skill.bonus
      }
    })

    return { apyBonus, compoundBonus, lockReduction, feeReduction, totalBonus: apyBonus + compoundBonus }
  }, [selectedSkills])

  // Calculate rewards
  const calculation = useMemo((): RewardCalculation => {
    const period = PERIODS[selectedPeriod]
    const baseAmount = parseEther(stakingAmount.toString())
    const baseAPY = period.apy
    const effectiveAPY = baseAPY + skillBonuses.totalBonus

    // Daily reward with skill bonuses
    const dailyPercentage = effectiveAPY / 365
    const dailyReward = (baseAmount * BigInt(Math.round(dailyPercentage * 10000))) / BigInt(1000000)
    const monthlyReward = dailyReward * BigInt(30)
    const totalReward = dailyReward * BigInt(period.days || 30)
    const finalAmount = baseAmount + totalReward

    return {
      dailyReward: formatEther(dailyReward),
      monthlyReward: formatEther(monthlyReward),
      totalReward: formatEther(totalReward),
      finalAmount: formatEther(finalAmount),
      apy: baseAPY,
      effectiveAPY
    }
  }, [stakingAmount, selectedPeriod, skillBonuses.totalBonus])

  const formatAmount = (value: string): string => {
    const num = parseFloat(value)
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    if (num >= 1) return num.toFixed(2)
    return num.toFixed(4)
  }

  const period = PERIODS[selectedPeriod]

  return (
    <motion.div
      className={`card-unified rounded-xl p-5 border border-white/10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 text-lg">🧮</span>
          <h4 className="text-sm font-semibold text-white">Rewards Calculator</h4>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
        >
          <motion.span
            className="text-white/50 text-sm inline-block"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.span>
        </button>
      </div>

      {/* Amount Input - Always visible */}
      <div className="mb-4">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10 focus-within:border-indigo-500/50 transition-colors">
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="flex-1 bg-transparent text-white text-lg font-bold outline-none w-full min-w-0"
            placeholder="1000"
          />
          <span className="text-white/50 text-sm font-medium flex-shrink-0">POL</span>
        </div>
        <p className="text-white/30 text-[10px] mt-1">Min: 10 POL · Max: 100,000 POL</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-1 mb-4 p-1 bg-white/5 rounded-lg">
        {PERIODS.map((p, index) => (
          <button
            key={p.key}
            onClick={() => setSelectedPeriod(index)}
            className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium transition-all duration-200 ${selectedPeriod === index
              ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <div className="text-[10px] opacity-70">{p.apy}%</div>
            <div>{p.label}</div>
          </button>
        ))}
      </div>

      {/* Main Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedPeriod}-${skillBonuses.totalBonus}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="bg-white/5 rounded-lg p-4 border border-white/5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/40 text-xs">Effective APY</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-indigo-400">{calculation.effectiveAPY.toFixed(1)}%</span>
                {skillBonuses.totalBonus > 0 && (
                  <span className="text-emerald-400 text-xs font-medium">+{skillBonuses.totalBonus}%</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">Lock Period</p>
              <p className="text-white font-semibold">{period.days || 'Flex'}d</p>
            </div>
          </div>

          {/* Results Row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
            <div className="text-center">
              <p className="text-white/40 text-[10px]">Daily</p>
              <p className="text-green-400 font-semibold text-sm">{formatAmount(calculation.dailyReward)}</p>
            </div>
            <div className="text-center">
              <p className="text-white/40 text-[10px]">Monthly</p>
              <p className="text-blue-400 font-semibold text-sm">{formatAmount(calculation.monthlyReward)}</p>
            </div>
            <div className="text-center">
              <p className="text-white/40 text-[10px]">Total</p>
              <p className="text-purple-400 font-semibold text-sm">{formatAmount(calculation.totalReward)}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Expanded: Skills Selection */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-3"
          >
            {/* Skills Header */}
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs font-medium">NFT Skills Simulation</span>
              {selectedSkills.length > 0 && (
                <span className="text-emerald-400 text-xs font-medium">+{skillBonuses.totalBonus}% APY</span>
              )}
            </div>

            {/* Skills Grid - Compact */}
            <div className="grid grid-cols-2 gap-1.5">
              {STAKING_SKILLS.filter(s => s.type === 'apy' || s.type === 'compound').map((skill) => {
                const isSelected = selectedSkills.includes(skill.id)
                return (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`p-2 rounded-lg text-left transition-all ${isSelected
                      ? 'bg-emerald-500/20 border border-emerald-500/40'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{skill.emoji}</span>
                      <span className={`text-[10px] font-medium truncate ${isSelected ? 'text-emerald-300' : 'text-white/60'}`}>
                        {skill.name}
                      </span>
                    </div>
                    <div className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-white/40'}`}>
                      +{skill.bonus}%
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Utility Skills - Non APY */}
            <div className="pt-2 border-t border-white/5">
              <p className="text-white/40 text-[10px] mb-1.5">Utility Skills (no APY impact)</p>
              <div className="flex gap-1.5 flex-wrap">
                {STAKING_SKILLS.filter(s => s.type === 'lock' || s.type === 'fee').map((skill) => {
                  const isSelected = selectedSkills.includes(skill.id)
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-all flex items-center gap-1 ${isSelected
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-white/5 text-white/50 border border-white/10'
                      }`}
                    >
                      <span>{skill.emoji}</span>
                      <span>{skill.type === 'lock' ? `-${skill.bonus}% Lock` : `-${skill.bonus}% Fee`}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Final Projection */}
            <div className="p-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white/60 text-xs">After {period.days || 30} days</span>
                  {skillBonuses.lockReduction > 0 && (
                    <p className="text-blue-400 text-[10px]">🔓 -{skillBonuses.lockReduction}% lock time</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-white font-bold">{formatAmount(calculation.finalAmount)} POL</span>
                  <p className="text-emerald-400 text-[10px]">+{formatAmount(calculation.totalReward)} earned</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-white/5">
        <p className="text-[10px] text-white/30 text-center">
          {selectedSkills.length > 0 
            ? `Simulating ${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} effect`
            : 'Expand to simulate NFT skill bonuses'
          }
        </p>
      </div>
    </motion.div>
  )
})

StakingRewardsCalculator.displayName = 'StakingRewardsCalculator'

export default StakingRewardsCalculator
