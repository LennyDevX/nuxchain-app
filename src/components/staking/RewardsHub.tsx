import React, { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther, parseEther } from 'viem';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useStakingAnalytics } from '../../hooks/staking/useStakingAnalytics';
import { useDynamicAPY } from '../../hooks/apy/useDynamicAPY';
import { STAKING_PERIODS } from '../../constants/stakingConstants';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

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
            <span className="text-purple-400 text-xl">📊</span>
            <h4 className="text-base font-semibold text-white md:text-lg">Rewards Hub</h4>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-5 pt-3">
          <motion.button
            onClick={() => setActiveTab('projection')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all md:text-base ${
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
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all md:text-base ${
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

              {/* Ascending Rewards Chart */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/5 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-white/80 text-sm font-medium md:text-base">Rewards Growth</h5>
                  <span className="text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded md:text-xs">Cumulative</span>
                </div>
                <div className="relative h-[200px] md:h-[280px]">
                  <Line
                    data={{
                      labels: ['Start', '1h', '1d', '1w', '1m', '1y'],
                      datasets: [
                        {
                          label: 'Cumulative Rewards',
                          data: (() => {
                            const values = [
                              0,
                              parseFloat(rewardsProjection?.hourly || '0'),
                              parseFloat(rewardsProjection?.daily || '0'),
                              parseFloat(rewardsProjection?.weekly || '0'),
                              parseFloat(rewardsProjection?.monthly || '0'),
                              parseFloat(rewardsProjection?.yearly || '0'),
                            ];
                            // Calculate cumulative sum
                            return values.reduce((acc: number[], val, i) => {
                              if (i === 0) return [0];
                              acc.push(acc[acc.length - 1] + val);
                              return acc;
                            }, []);
                          })(),
                          fill: true,
                          tension: 0.4,
                          backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; height: number } }) => {
                            const canvas = context.chart.ctx;
                            const gradient = canvas.createLinearGradient(0, 0, 0, context.chart.height);
                            // Platform gradient: purple to red
                            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)');  // #8b5cf6
                            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)'); // #ef4444
                            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
                            return gradient;
                          },
                          borderColor: (context: { chart: { ctx: CanvasRenderingContext2D; width: number } }) => {
                            const canvas = context.chart.ctx;
                            const gradient = canvas.createLinearGradient(0, 0, context.chart.width, 0);
                            gradient.addColorStop(0, '#8b5cf6');  // Purple
                            gradient.addColorStop(1, '#ef4444');  // Red
                            return gradient;
                          },
                          borderWidth: 3,
                          pointRadius: [0, 4, 4, 4, 4, 6],
                          pointBackgroundColor: ['#8b5cf6', '#9f5bf5', '#b35af3', '#c759f1', '#dc58ef', '#ef4444'],
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 2,
                          pointHoverRadius: 8,
                          pointHoverBackgroundColor: '#ef4444',
                          pointHoverBorderWidth: 3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'nearest' as const,
                        intersect: true,
                        axis: 'x',
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: 'rgba(10, 10, 10, 0.95)',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: 'rgba(139, 92, 246, 0.4)',
                          borderWidth: 1,
                          padding: 10,
                          displayColors: false,
                          titleFont: {
                            size: 12,
                            family: 'Inter, system-ui, sans-serif',
                          },
                          bodyFont: {
                            size: 13,
                            family: 'Inter, system-ui, sans-serif',
                            weight: 600,
                          },
                          callbacks: {
                            label: function (context) {
                              const value = context.parsed.y ?? 0;
                              return `${value.toFixed(6)} POL`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            color: 'rgba(255, 255, 255, 0.03)',
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            font: {
                              size: 10,
                              family: 'Inter, system-ui, sans-serif',
                            },
                            maxRotation: 0,
                          },
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.03)',
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.4)',
                            font: {
                              size: 9,
                              family: 'Inter, system-ui, sans-serif',
                            },
                            callback: function (value: number | string) {
                              const num = typeof value === 'string' ? parseFloat(value) : value;
                              if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                              return num.toFixed(3);
                            },
                            maxTicksLimit: 5,
                          },
                        },
                      },
                    }}
                  />
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
                <label className="text-white/80 text-sm font-medium block mb-2 md:text-base">Stake Amount (POL)</label>
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
                    className="flex-1 bg-transparent text-white text-lg font-bold outline-none md:text-xl"
                    placeholder="1000"
                  />
                  <span className="text-white/50 text-sm font-medium flex-shrink-0 md:text-base">POL</span>
                </div>
                <p className="text-white/30 text-xs mt-1 md:text-sm">Min: 10 POL · Max: 100,000 POL (auto-adjusts on blur)</p>
              </div>

              {/* Period Selector */}
              <div>
                <label className="text-white/80 text-sm font-medium block mb-2 md:text-base">Lockup Period</label>
                <div className="grid grid-cols-5 gap-1">
                  {STAKING_PERIODS.map((period, index) => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(index)}
                      className={`py-2 px-1 rounded-lg text-sm font-medium transition-all md:text-base ${
                        selectedPeriod === index
                          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs opacity-70 md:text-sm">{period.roi.annual}</div>
                      <div>{period.value === '0' ? 'Flex' : `${period.value}d`}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/40 text-sm md:text-base">Effective APY</p>
                    <p className="text-3xl font-bold text-indigo-400 md:text-4xl">{calculation.apy.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-sm md:text-base">Period</p>
                    <p className="text-white font-semibold text-base md:text-lg">
                      {STAKING_PERIODS[selectedPeriod].value === '0' ? 'Flexible' : `${STAKING_PERIODS[selectedPeriod].value}d`}
                    </p>
                  </div>
                </div>

                {/* Reward breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-white/40 text-xs md:text-sm">Daily</p>
                    <p className="text-green-400 font-semibold text-base md:text-lg">{formatAmount(calculation.dailyReward)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-xs md:text-sm">Monthly</p>
                    <p className="text-blue-400 font-semibold text-base md:text-lg">{formatAmount(calculation.monthlyReward)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-xs md:text-sm">Total</p>
                    <p className="text-purple-400 font-semibold text-base md:text-lg">{formatAmount(calculation.totalReward)}</p>
                  </div>
                </div>

                {/* Final amount */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-white/60 text-sm md:text-base">After {STAKING_PERIODS[selectedPeriod].value || '30'} days</p>
                  <p className="text-white font-bold text-xl md:text-2xl">
                    {formatAmount(calculation.finalAmount)} POL{' '}
                    <span className="text-emerald-400 text-sm md:text-base">
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
