import React, { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther, parseEther } from 'viem';
import { useStakingAnalytics } from '../../hooks/staking/useStakingAnalytics';
import { useDynamicAPY } from '../../hooks/apy/useDynamicAPY';
import { STAKING_PERIODS } from '../../constants/stakingConstants';

interface RewardsHubProps {
  currentTVL?: bigint;
  className?: string;
}

/**
 * RewardsHub - Consolidated Rewards Projection & Calculator
 * Combines two related components into one deslizable interface
 * Saves UI space while improving UX with tabbed navigation
 */
const RewardsHub: React.FC<RewardsHubProps> = memo(({ currentTVL, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'projection' | 'calculator'>('projection');
  const [stakingAmount, setStakingAmount] = useState<number>(1000);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1); // Default: 30d

  // Projection data
  const { rewardsProjection, loadingProjection } = useStakingAnalytics();

  // Note: Dynamic APY hook available for future enhancements
  useDynamicAPY(currentTVL);

  // Calculate rewards for selected amount and period
  const calculation = useMemo(() => {
    // Validate stakingAmount - use default if invalid
    const validAmount = !isNaN(stakingAmount) && stakingAmount >= 10 ? stakingAmount : 10;
    
    const period = STAKING_PERIODS[selectedPeriod];
    
    // Ensure period exists and has valid data
    if (!period || !period.roi || !period.value) {
      return {
        dailyReward: '0.00',
        monthlyReward: '0.00',
        totalReward: '0.00',
        finalAmount: '0.00',
        apy: 0
      };
    }

    const baseAmount = parseEther(validAmount.toString());
    // Extract numeric value from string like "~19.7%"
    const baseAPY = parseFloat(period.roi.annual.replace(/[^0-9.]/g, ''));

    // Validate baseAPY is a valid number
    if (isNaN(baseAPY) || baseAPY <= 0) {
      return {
        dailyReward: '0.00',
        monthlyReward: '0.00',
        totalReward: '0.00',
        finalAmount: formatEther(baseAmount),
        apy: 0
      };
    }

    // Daily reward calculation
    const dailyPercentage = baseAPY / 365;
    const dailyPercentageRounded = Math.round(dailyPercentage * 10000);
    const dailyReward = (baseAmount * BigInt(dailyPercentageRounded)) / BigInt(1000000);
    const monthlyReward = dailyReward * BigInt(30);
    const periodDays = Math.max(1, parseInt(period.value) || 30);
    const totalReward = dailyReward * BigInt(periodDays);
    const finalAmount = baseAmount + totalReward;

    return {
      dailyReward: formatEther(dailyReward),
      monthlyReward: formatEther(monthlyReward),
      totalReward: formatEther(totalReward),
      finalAmount: formatEther(finalAmount),
      apy: baseAPY
    };
  }, [stakingAmount, selectedPeriod]);

  const periods = [
    { key: '1h', label: '1h', value: rewardsProjection?.hourly || '0.00' },
    { key: '1d', label: '1d', value: rewardsProjection?.daily || '0.00' },
    { key: '1w', label: '1w', value: rewardsProjection?.weekly || '0.00' },
    { key: '1m', label: '1m', value: rewardsProjection?.monthly || '0.00' },
    { key: '1y', label: '1y', value: rewardsProjection?.yearly || '0.00' },
  ];
  const [selectedPeriodProjection, setSelectedPeriodProjection] = useState<number>(1);

  const formatAmount = (value: string): string => {
    const num = parseFloat(value);
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    if (num >= 1) return num.toFixed(2);
    return num.toFixed(4);
  };

  // Loading state
  if (loadingProjection) {
    return (
      <div className={`card-unified rounded-xl p-5 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-56"></div>
          <div className="h-40 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`card-unified rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Tabs */}
      <div className="border-b border-white/10">
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-lg">📊</span>
            <h4 className="text-sm font-semibold text-white">Rewards Hub</h4>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-5 pt-3">
          <motion.button
            onClick={() => setActiveTab('projection')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'projection'
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📈 Projection
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'calculator'
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🧮 Calculator
          </motion.button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {activeTab === 'projection' && (
            <motion.div
              key="projection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Pending Rewards Status */}
              {rewardsProjection && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 w-fit">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-emerald-400 text-xs font-medium">
                    {rewardsProjection.pending || '0.00'} POL pending
                  </span>
                </div>
              )}

              {/* Period Selector */}
              <div className="flex gap-1.5 p-1 bg-white/5 rounded-lg">
                {periods.map((period, index) => (
                  <button
                    key={period.key}
                    onClick={() => setSelectedPeriodProjection(index)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                      selectedPeriodProjection === index
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Main Display */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/40 text-xs mb-1">
                      Est. {
                        periods[selectedPeriodProjection].key === '1h' ? 'Hourly' :
                        periods[selectedPeriodProjection].key === '1d' ? 'Daily' :
                        periods[selectedPeriodProjection].key === '1w' ? 'Weekly' :
                        periods[selectedPeriodProjection].key === '1m' ? 'Monthly' : 'Yearly'
                      }
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white">
                        {periods[selectedPeriodProjection].value}
                      </span>
                      <span className="text-sm text-white/50">POL</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-xs">Annual</p>
                    <p className="text-emerald-400 font-semibold text-sm">{periods[4].value} POL</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex justify-between pt-2 border-t border-white/5">
                <div className="flex gap-3">
                  {periods.slice(0, 3).map((p) => (
                    <div key={p.key} className="text-center">
                      <p className="text-white/70 text-xs font-medium">{p.value}</p>
                      <p className="text-white/30 text-[10px]">{p.label}</p>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/30">Based on current stake</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calculator' && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Amount Input */}
              <div>
                <label className="text-white/80 text-xs font-medium block mb-2">Stake Amount (POL)</label>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10 focus-within:border-indigo-500/50 transition-colors">
                  <input
                    type="number"
                    value={stakingAmount || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      // Allow typing any value, validation happens on blur
                      if (!isNaN(val) && val > 0) {
                        setStakingAmount(val);
                      }
                    }}
                    onBlur={() => {
                      // Auto-correct on blur: min 10, max 100,000
                      let correctedValue = stakingAmount;
                      if (correctedValue < 10) correctedValue = 10;
                      if (correctedValue > 100000) correctedValue = 100000;
                      setStakingAmount(correctedValue);
                    }}
                    className="flex-1 bg-transparent text-white text-base font-bold outline-none"
                    placeholder="1000"
                  />
                  <span className="text-white/50 text-xs font-medium flex-shrink-0">POL</span>
                </div>
                <p className="text-white/30 text-[10px] mt-1">Min: 10 POL · Max: 100,000 POL (auto-adjusts on blur)</p>
              </div>

              {/* Period Selector */}
              <div>
                <label className="text-white/80 text-xs font-medium block mb-2">Lockup Period</label>
                <div className="grid grid-cols-5 gap-1">
                  {STAKING_PERIODS.map((period, index) => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(index)}
                      className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                        selectedPeriod === index
                          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-[10px] opacity-70">{period.roi.annual}</div>
                      <div>{period.value === '0' ? 'Flex' : `${period.value}d`}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/40 text-xs">Effective APY</p>
                    <p className="text-2xl font-bold text-indigo-400">{calculation.apy.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-xs">Period</p>
                    <p className="text-white font-semibold">
                      {STAKING_PERIODS[selectedPeriod].value === '0' ? 'Flexible' : `${STAKING_PERIODS[selectedPeriod].value}d`}
                    </p>
                  </div>
                </div>

                {/* Reward breakdown */}
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

                {/* Final amount */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-white/60 text-xs">After {STAKING_PERIODS[selectedPeriod].value || '30'} days</p>
                  <p className="text-white font-bold text-lg">
                    {formatAmount(calculation.finalAmount)} POL{' '}
                    <span className="text-emerald-400 text-xs">
                      +{formatAmount(calculation.totalReward)} earned
                    </span>
                  </p>
                </div>
              </div>

              {/* Info */}
              <p className="text-[10px] text-white/30 text-center">
                Rates based on current pool state · Updates every 60 seconds
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

RewardsHub.displayName = 'RewardsHub';

export default RewardsHub;
