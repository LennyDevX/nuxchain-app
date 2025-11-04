import { useState, useMemo, memo } from 'react'
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
  { days: 90, apy: 122.6, label: 'Medium Term', risk: 'Medium Risk', color: 'from-yellow-500 to-orange-500' },
  { days: 180, apy: 148.9, label: 'Long Term', risk: 'Medium Risk', color: 'from-orange-500 to-red-500' },
  { days: 365, apy: 184.0, label: 'Premium', risk: 'High Risk', color: 'from-red-500 to-pink-500' }
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
  const [stakingAmount, setStakingAmount] = useState<number>(defaultAmount)
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [useAutoCompound, setUseAutoCompound] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(!isMobile) // ✅ Collapsed en mobile por defecto

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
    <div className="card-form space-y-4">
      {/* ✅ Header con Toggle para Mobile */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">📊 Rewards Calculator</h3>
          <p className="text-white/50 text-xs">Estimate your earnings before staking</p>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 transition-all"
            aria-label={isExpanded ? "Collapse calculator" : "Expand calculator"}
          >
            <span className="text-white text-lg">{isExpanded ? '▼' : '▶'}</span>
          </button>
        )}
      </div>

      {/* ✅ Contenido colapsable en mobile */}
      {(isMobile && !isExpanded) ? (
        // Resumen colapsado
        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
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
          <p className="text-center text-white/50 text-xs mt-2">Click arrow to expand for details</p>
        </div>
      ) : (
        <>
          {/* Amount Slider - Compact */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-white/70 text-xs font-medium">Amount to Stake</label>
              <span className="text-purple-300 font-bold text-sm">{stakingAmount.toLocaleString()} POL</span>
            </div>
        <input
          type="range"
          min="1"
          max="100000"
          step="100"
          value={stakingAmount}
          onChange={(e) => setStakingAmount(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* Period Selection - Grid Compacto */}
      <div className="space-y-1">
        <label className="text-white/70 text-xs font-medium block">Lockup Period & APY</label>
        <div className="grid grid-cols-4 gap-1">
          {STAKING_PERIODS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPeriod(idx)}
              className={`p-2 rounded-lg text-center text-xs font-bold transition-all ${
                selectedPeriod === idx
                  ? `border border-purple-500 bg-purple-500/30 text-white`
                  : `border border-white/10 bg-white/5 text-white/60 hover:bg-white/10`
              }`}
            >
              <div className="text-purple-300">{p.apy}%</div>
              <div className="text-white/70">{p.days}d</div>
            </button>
          ))}
        </div>
      </div>

      {/* Skills - Ultra Compacto */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-white/70 text-xs font-medium">Skill Bonuses</label>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Optional</span>
        </div>
        <div className="space-y-1">
          {Object.entries(SKILL_BONUSES).map(([skillName, bonus]) => (
            <button
              key={skillName}
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
            </button>
          ))}
        </div>
      </div>

      {/* Auto Compound - Toggle Simple */}
      <button
        onClick={() => setUseAutoCompound(!useAutoCompound)}
        className={`w-full p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
          useAutoCompound
            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
            : 'bg-white/5 border border-white/10 text-white/60'
        }`}
      >
        <span>🔄 Auto Compound 24h</span>
        <span className="text-emerald-300 font-bold">+15%</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      {/* Results - Compacto */}
      <div className="space-y-2">
        <div className="text-xs text-white/70 font-medium flex justify-between">
          <span>APY: <span className="text-green-400">{calculation.apy.toFixed(1)}%</span></span>
          <span>Period: <span className="text-cyan-300">{period.days}d</span></span>
        </div>

        {/* Daily Reward */}
        <div className="p-2 bg-white/5 rounded border border-white/10 flex justify-between items-center">
          <span className="text-white/60 text-xs">Daily</span>
          <span className="text-green-400 font-bold text-sm">{formatAmount(calculation.dailyReward)} POL</span>
        </div>

        {/* Monthly Reward */}
        <div className="p-2 bg-white/5 rounded border border-white/10 flex justify-between items-center">
          <span className="text-white/60 text-xs">Monthly</span>
          <span className="text-blue-400 font-bold text-sm">{formatAmount(calculation.monthlyReward)} POL</span>
        </div>

        {/* Final Amount - Destacado */}
        <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/40 flex justify-between items-center">
          <span className="text-white/80 text-xs font-medium">Total ({period.days}d)</span>
          <div className="text-right">
            <span className="text-white font-bold text-lg">{formatAmount(calculation.finalAmount)}</span>
            <div className="text-purple-300 text-xs">+{formatAmount(calculation.totalReward)} earned</div>
          </div>
        </div>

        {/* Lock Reducer Impact */}
        {selectedSkills.includes('LOCK_REDUCER') && (
          <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-300">🔓 Lock Period Reduced</span>
              <span className="text-cyan-400 font-bold">{period.days}d → {actualLockDays}d (-25%)</span>
            </div>
          </div>
        )}

        {/* Fee Reducer Impact */}
        {(selectedSkills.includes('FEE_REDUCER_I') || selectedSkills.includes('FEE_REDUCER_II')) && (
          <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
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
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
})

StakingRewardsCalculator.displayName = 'StakingRewardsCalculator'

export default StakingRewardsCalculator
