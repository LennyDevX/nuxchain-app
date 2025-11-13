import { useState, useMemo, memo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatEther, parseEther } from 'viem'
import { useIsMobile } from '../../hooks/mobile'

interface RewardCalculation {
  dailyReward: string
  monthlyReward: string
  totalReward: string
  finalAmount: string
  apy: number
  baseAPY: number
  skillBonus: number
}

interface StakingRewardsCalculatorProps {
  defaultAmount?: number
}

// APY rates for different periods (annual percentages)
const STAKING_PERIODS = [
  { days: 30, apy: 87.6, label: 'Short Term', risk: 'Low Risk', color: 'from-green-500 to-emerald-500' },
  { days: 90, apy: 122.64, label: 'Medium Term', risk: 'Medium Risk', color: 'from-yellow-500 to-orange-500' },
  { days: 180, apy: 149.28, label: 'Long Term', risk: 'Medium Risk', color: 'from-orange-500 to-red-500' },
  { days: 365, apy: 219.0, label: 'Premium', risk: 'High Risk', color: 'from-red-500 to-pink-500' }
]

// Skill bonuses (percentage increases to base APY)
const SKILL_BONUSES = {
  STAKE_BOOST_I: 5,
  STAKE_BOOST_II: 10,
  STAKE_BOOST_III: 20,
  AUTO_COMPOUND: 15,
  LOCK_REDUCER: 0, // Does NOT increase APY - only reduces lock time by 25%
  FEE_REDUCER_I: 0, // Does NOT increase APY - only reduces withdrawal fee by 10%
  FEE_REDUCER_II: 0 // Does NOT increase APY - only reduces withdrawal fee by 25%
}

const WITHDRAWAL_FEE_BASE = 6 // 6% base withdrawal fee

const StakingRewardsCalculator = memo(({ defaultAmount = 1000 }: StakingRewardsCalculatorProps) => {
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [stakingAmount, setStakingAmount] = useState<number>(defaultAmount)
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [useAutoCompound, setUseAutoCompound] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false) // ✅ Collapsed by default

  // ✅ Handle expand with automatic scroll
  const handleExpand = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    
    // Scroll to component when expanding
    if (newState && containerRef.current) {
      setTimeout(() => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const scrollTop = window.scrollY || document.documentElement.scrollTop
          const targetTop = scrollTop + rect.top - 80 // 80px de offset para que se vea bien
          
          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          })
        }
      }, 150) // Wait for animation to complete
    }
  }

  // Calculate rewards based on inputs - returns serializable data
  const calculation = useMemo((): RewardCalculation => {
    const period = STAKING_PERIODS[selectedPeriod]
    const baseAmount = parseEther(stakingAmount.toString())
    const baseAPY = period.apy
    
    // Apply skill bonuses
    let skillBonus = 0
    selectedSkills.forEach(skill => {
      skillBonus += (SKILL_BONUSES[skill as keyof typeof SKILL_BONUSES] || 0)
    })
    
    // Auto compound bonus
    if (useAutoCompound) {
      skillBonus += 15
    }
    
    // Final APY
    const finalAPY = baseAPY + skillBonus
    
    // Calculate daily reward (APY / 365 days)
    const dailyPercentage = finalAPY / 365
    const dailyReward = (baseAmount * BigInt(Math.round(dailyPercentage * 10000))) / BigInt(1000000)
    
    // Calculate monthly reward (30 days)
    const monthlyReward = (dailyReward * BigInt(30))
    
    // Calculate total reward for the period
    // NOTE: Always use original period.days for calculation
    // Lock Reducer ONLY affects display, not actual rewards
    const daysInPeriod = BigInt(period.days)
    const totalReward = (dailyReward * daysInPeriod)
    
    // Final amount = principal + total reward
    const finalAmount = baseAmount + totalReward
    
    // Return ONLY serializable values, never BigInt directly
    return {
      dailyReward: formatEther(dailyReward),
      monthlyReward: formatEther(monthlyReward),
      totalReward: formatEther(totalReward),
      finalAmount: formatEther(finalAmount),
      apy: finalAPY,
      baseAPY,
      skillBonus
    }
  }, [stakingAmount, selectedPeriod, selectedSkills, useAutoCompound])

  const toggleSkill = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    )
  }

  const formatAmount = (value: string): string => {
    const parsed = parseFloat(value)
    return parsed >= 1000 
      ? (parsed / 1000).toFixed(2) + 'K'
      : parsed.toFixed(4)
  }

  const period = STAKING_PERIODS[selectedPeriod]
  
  // Calculate actual lock days with Lock Reducer
  let actualLockDays = period.days
  if (selectedSkills.includes('LOCK_REDUCER')) {
    actualLockDays = Math.round(period.days * 0.75) // 25% reduction
  }
  
  // Calculate withdrawal fee with Fee Reducer
  let withdrawalFee = WITHDRAWAL_FEE_BASE
  if (selectedSkills.includes('FEE_REDUCER_II')) {
    withdrawalFee = WITHDRAWAL_FEE_BASE * 0.75 // 25% reduction (total: 4.5%)
  } else if (selectedSkills.includes('FEE_REDUCER_I')) {
    withdrawalFee = WITHDRAWAL_FEE_BASE * 0.90 // 10% reduction (total: 5.4%)
  }
  
  const feeAmount = parseFloat(calculation.finalAmount) * (withdrawalFee / 100)
  const savedFee = parseFloat(calculation.finalAmount) * ((WITHDRAWAL_FEE_BASE - withdrawalFee) / 100)

  return (
    <motion.div 
      ref={containerRef}
      className="card-form space-y-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      viewport={{ once: true }}
    >
      {/* ✅ Header con Toggle para Mobile y Desktop */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        viewport={{ once: true }}
      >
        <div>
          <h3 className="text-lg font-bold text-white mb-1">📊 Rewards Calculator</h3>
          <p className="text-white/50 text-xs">Estimate your earnings before staking</p>
        </div>
        <motion.button
          onClick={handleExpand}
          className="ml-2 px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 transition-all"
          aria-label={isExpanded ? "Collapse calculator" : "Expand calculator"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span 
            className="text-white text-lg inline-block"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ▼
          </motion.span>
        </motion.button>
      </motion.div>

      {/* ✅ Contenido colapsable con animación */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // Resumen colapsado
          <motion.div 
            key="collapsed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <p className="text-white/60 text-xs">Amount</p>
                  <p className="text-green-400 font-bold">{stakingAmount.toLocaleString()} POL</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs">APY</p>
                  <p className="text-blue-400 font-bold">{calculation.apy}%</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs">Daily</p>
                  <p className="text-yellow-400 font-bold">{formatAmount(calculation.dailyReward)} POL</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs">Total Reward</p>
                  <p className="text-purple-400 font-bold">{formatAmount(calculation.totalReward)} POL</p>
                </div>
              </div>
              {isMobile && <p className="text-center text-white/50 text-xs mt-2">Click arrow to expand for details</p>}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Amount to Stake */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex justify-between items-center"
            >
              <label className="text-white/70 text-xs font-medium">Amount to Stake</label>
              <span className="text-purple-300 font-bold text-sm">{stakingAmount.toLocaleString()} POL</span>
            </motion.div>
            <motion.input
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              type="range"
              min="1"
              max="100000"
              step="100"
              value={stakingAmount}
              onChange={(e) => setStakingAmount(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />

            {/* Period Selection - Grid Compacto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-1"
            >
              <label className="text-white/70 text-xs font-medium block">Lockup Period & APY</label>
              <div className="grid grid-cols-4 gap-1">
                {STAKING_PERIODS.map((p, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPeriod(idx)}
                    className={`p-2 rounded-lg text-center text-xs font-bold transition-all ${
                      selectedPeriod === idx
                        ? `border border-purple-500 bg-purple-500/30 text-white`
                        : `border border-white/10 bg-white/5 text-white/60 hover:bg-white/10`
                    }`}
                  >
                    <div className="text-purple-300">{p.apy}%</div>
                    <div className="text-white/70">{p.days}d</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Skills - Ultra Compacto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between">
                <label className="text-white/70 text-xs font-medium">Skill Bonuses</label>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Optional</span>
              </div>
              <div className="space-y-1">
                {Object.entries(SKILL_BONUSES).map(([skillName, bonus], idx) => (
                  <motion.button
                    key={skillName}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + idx * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSkill(skillName)}
                    className={`w-full p-1.5 rounded text-xs transition-all flex items-center justify-between ${
                      selectedSkills.includes(skillName)
                        ? `bg-blue-500/30 border border-blue-500 text-blue-300`
                        : `bg-white/5 border border-white/10 text-white/60 hover:bg-white/10`
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skillName)}
                        onChange={() => {}}
                        className="w-3 h-3 accent-blue-500 cursor-pointer flex-shrink-0"
                      />
                      <span className="text-xs truncate flex-1">{skillName.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-blue-300 font-bold text-xs flex-shrink-0 ml-1">+{bonus}%</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Auto Compound - Toggle Simple */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUseAutoCompound(!useAutoCompound)}
              className={`w-full p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                useAutoCompound
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'bg-white/5 border border-white/10 text-white/60'
              }`}
            >
              <span>🔄 Auto Compound 24h</span>
              <span className="text-emerald-300 font-bold">+15%</span>
            </motion.button>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
            />

            {/* Results - Compacto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.42 }}
              className="space-y-2"
            >
              <div className="text-xs text-white/70 font-medium flex justify-between">
                <span>APY: <span className="text-green-400">{calculation.apy.toFixed(1)}%</span></span>
                <span>Period: <span className="text-cyan-300">{period.days}d</span></span>
              </div>

              {/* Daily Reward */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.45 }}
                className="p-2 bg-white/5 rounded border border-white/10 flex justify-between items-center"
              >
                <span className="text-white/60 text-xs">Daily</span>
                <span className="text-green-400 font-bold text-sm">{formatAmount(calculation.dailyReward)} POL</span>
              </motion.div>

              {/* Monthly Reward */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="p-2 bg-white/5 rounded border border-white/10 flex justify-between items-center"
              >
                <span className="text-white/60 text-xs">Monthly</span>
                <span className="text-blue-400 font-bold text-sm">{formatAmount(calculation.monthlyReward)} POL</span>
              </motion.div>

              {/* Final Amount - Destacado */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.55 }}
                className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/40 flex justify-between items-center"
              >
                <span className="text-white/80 text-xs font-medium">Total ({period.days}d)</span>
                <div className="text-right">
                  <span className="text-white font-bold text-lg">{formatAmount(calculation.finalAmount)}</span>
                  <div className="text-purple-300 text-xs">+{formatAmount(calculation.totalReward)} earned</div>
                </div>
              </motion.div>

              {/* Lock Reducer Impact */}
              {selectedSkills.includes('LOCK_REDUCER') && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyan-300">🔓 Lock Period Reduced</span>
                    <span className="text-cyan-400 font-bold">{period.days}d → {actualLockDays}d (-25%)</span>
                  </div>
                </motion.div>
              )}

              {/* Fee Reducer Impact */}
              {(selectedSkills.includes('FEE_REDUCER_I') || selectedSkills.includes('FEE_REDUCER_II')) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.65 }}
                  className="p-2 bg-green-500/10 rounded border border-green-500/20"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-green-300">💰 Withdrawal Fee</span>
                    <span className="text-green-400 font-bold">{withdrawalFee.toFixed(1)}% ({feeAmount.toFixed(4)} POL)</span>
                  </div>
                  {savedFee > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-300">💎 You save</span>
                      <span className="text-emerald-400 font-bold">{savedFee.toFixed(4)} POL</span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

StakingRewardsCalculator.displayName = 'StakingRewardsCalculator'

export default StakingRewardsCalculator
