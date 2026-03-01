import React, { memo, useState, useMemo, lazy, Suspense } from 'react';
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
import { useStakingV620 } from '../../hooks/staking/useStakingV620';
import { STAKING_PERIODS } from '../../constants/stakingConstants';

const APYRatesTable = lazy(() => import('./APYRatesTable'));

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

  // On-chain staking rates — single source of truth for APY values
  const { stakingRates } = useStakingV620();

  // Note: Dynamic APY hook available for future enhancements
  useDynamicAPY(currentTVL);

  // Calculate rewards for selected amount and period
  const calculation = useMemo(() => {
    // Validate stakingAmount - use default if invalid
    const validAmount = !isNaN(stakingAmount) && stakingAmount >= 10 ? stakingAmount : 10;
    
    const period = STAKING_PERIODS[selectedPeriod];

    // Ensure period exists and has valid data
    if (!period || !period.value) {
      return {
        dailyReward: '0.00',
        monthlyReward: '0.00',
        totalReward: '0.00',
        finalAmount: '0.00',
        apy: 0
      };
    }

    const baseAmount = parseEther(validAmount.toString());
    // Use on-chain APY if available, else fall back to constants
    const onchainAPYBps = stakingRates?.annualAPY?.[selectedPeriod];
    const baseAPY = onchainAPYBps
      ? Number(onchainAPYBps) / 100
      : parseFloat((period.roi?.annual ?? '0').replace(/[^0-9.]/g, ''));

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
  }, [stakingAmount, selectedPeriod, stakingRates]);

  const formatAmount = (value: string): string => {
    const num = parseFloat(value);
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    if (num >= 1) return num.toFixed(2);
    return num.toFixed(4);
  };

  // Memoized chart data to prevent recreation on every render
  const chartData = useMemo(() => ({
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
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
          gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
          return gradient;
        },
        borderColor: (context: { chart: { ctx: CanvasRenderingContext2D; width: number } }) => {
          const canvas = context.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, context.chart.width, 0);
          gradient.addColorStop(0, '#8b5cf6');
          gradient.addColorStop(1, '#ef4444');
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
  }), [rewardsProjection]);

  // Memoized chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      intersect: true,
      axis: 'x' as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(139, 92, 246, 0.4)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        titleFont: { size: 12, family: 'Inter, system-ui, sans-serif' },
        bodyFont: { size: 13, family: 'Inter, system-ui, sans-serif', weight: 600 },
        callbacks: {
          label: function (context: { parsed: { y: number | null } }) {
            const value = context.parsed.y ?? 0;
            return `${value.toFixed(6)} POL`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 10, family: 'Inter, system-ui, sans-serif' },
          maxRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: {
          color: 'rgba(255, 255, 255, 0.4)',
          font: { size: 9, family: 'Inter, system-ui, sans-serif' },
          callback: function (value: number | string) {
            const num = typeof value === 'string' ? parseFloat(value) : value;
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toFixed(3);
          },
          maxTicksLimit: 5,
        },
      },
    },
  }), []);

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
    <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      {/* Left column: On-chain APY rates table */}
      <Suspense fallback={<div className="h-48 bg-white/5 animate-pulse rounded-xl" />}>
        <APYRatesTable />
      </Suspense>

      {/* Right column: Rewards Hub card */}
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
            <h4 className="jersey-15-regular text-base lg:text-4xl font-semibold text-white">Rewards Hub</h4>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-5 pt-3">
          <motion.button
            onClick={() => setActiveTab('projection')}
            className={`flex-1 py-2 px-3 rounded-lg jersey-15-regular text-3xl font-medium transition-all md:jersey-15-regular ${
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
            className={`flex-1 py-2 px-3 rounded-lg jersey-15-regular text-3xl font-medium transition-all md:jersey-15-regular ${
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
                <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-3 rounded-lg border-2 border-emerald-500/40 w-fit">
                  <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="jersey-20-regular text-emerald-400 text-base lg:text-lg font-bold">
                    {rewardsProjection.pending || '0.00'} POL pending
                  </span>
                </div>
              )}

              {/* Ascending Rewards Chart */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/5 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="jersey-15-regular text-white/80 text-sm lg:text-base font-medium">Rewards Growth</h5>
                  <span className="jersey-20-regular text-[10px] lg:text-xs text-white/40 bg-white/5 px-2 py-1 rounded">Cumulative</span>
                </div>
                <div className="relative h-[200px] md:h-[280px]">
                  <Line data={chartData} options={chartOptions} />
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
                <label className="jersey-15-regular text-white/80 text-sm lg:text-base font-medium block mb-2">Stake Amount (POL)</label>
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
                    className="flex-1 bg-transparent jersey-20-regular text-white text-lg lg:text-xl font-bold outline-none"
                    placeholder="1000"
                  />
                  <span className="jersey-20-regular text-white/50 text-sm lg:text-base font-medium flex-shrink-0">POL</span>
                </div>
                <p className="jersey-20-regular text-white/30 text-xs lg:text-sm mt-1">Min: 10 POL · Max: 100,000 POL (auto-adjusts on blur)</p>
              </div>

              {/* Period Selector */}
              <div>
                <label className="jersey-15-regular text-white/80 text-sm lg:text-base font-medium block mb-2">Lockup Period</label>
                <div className="grid grid-cols-5 gap-1">
                  {STAKING_PERIODS.map((period, index) => {
                    const liveAPYBps = stakingRates?.annualAPY?.[index];
                    const liveAPYPct = liveAPYBps
                      ? (Number(liveAPYBps) / 100).toFixed(1) + '%'
                      : period.roi?.annual ?? '-';
                    return (
                      <button
                        key={period.value}
                        onClick={() => setSelectedPeriod(index)}
                        className={`py-2 px-1 rounded-lg jersey-15-regular text-sm lg:text-base font-medium transition-all ${
                          selectedPeriod === index
                            ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        <div className={`jersey-20-regular text-xs lg:text-sm font-bold ${
                          selectedPeriod === index ? 'text-indigo-300' : 'text-emerald-400/70'
                        }`}>{liveAPYPct}</div>
                        <div className="jersey-15-regular text-[11px] lg:text-xs mt-0.5">{period.value === '0' ? 'Flex' : `${period.value}d`}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Results */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="jersey-20-regular text-white/40 text-sm lg:text-base">Effective APY</p>
                    <p className="jersey-20-regular text-3xl lg:text-4xl font-bold text-indigo-400">{calculation.apy.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="jersey-20-regular text-white/40 text-sm lg:text-base">Period</p>
                    <p className="jersey-15-regular text-white font-semibold text-base lg:text-lg">
                      {STAKING_PERIODS[selectedPeriod].value === '0' ? 'Flexible' : `${STAKING_PERIODS[selectedPeriod].value}d`}
                    </p>
                  </div>
                </div>

                {/* Reward breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <p className="jersey-20-regular text-white/40 text-xs lg:text-sm">Daily</p>
                    <p className="jersey-20-regular text-green-400 font-semibold text-base lg:text-lg">{formatAmount(calculation.dailyReward)}</p>
                  </div>
                  <div className="text-center">
                    <p className="jersey-20-regular text-white/40 text-xs lg:text-sm">Monthly</p>
                    <p className="jersey-20-regular text-blue-400 font-semibold text-base lg:text-lg">{formatAmount(calculation.monthlyReward)}</p>
                  </div>
                  <div className="text-center">
                    <p className="jersey-20-regular text-white/40 text-xs lg:text-sm">Total</p>
                    <p className="jersey-20-regular text-purple-400 font-semibold text-base lg:text-lg">{formatAmount(calculation.totalReward)}</p>
                  </div>
                </div>

                {/* Final amount */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="jersey-20-regular text-white/60 text-sm lg:text-base">After {STAKING_PERIODS[selectedPeriod].value || '30'} days</p>
                  <p className="jersey-20-regular text-white font-bold text-xl lg:text-2xl">
                    {formatAmount(calculation.finalAmount)} POL{' '}
                    <span className="jersey-20-regular text-emerald-400 text-sm lg:text-base">
                      +{formatAmount(calculation.totalReward)} earned
                    </span>
                  </p>
                </div>
              </div>

              {/* Info */}
              <p className="jersey-20-regular text-[10px] lg:text-xs text-white/30 text-center">
                Rates based on current pool state · Updates every 60 seconds
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>

    </div>
    </div>
  );
});

RewardsHub.displayName = 'RewardsHub';

export default RewardsHub;
