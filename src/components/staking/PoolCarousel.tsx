/**
 * PoolCarousel - Tab toggle for StakingPoolChart and TreasuryPoolChart
 * Shows a bottom tab bar to switch between charts (mobile-first, no swipe needed)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StakingPoolChart } from './StakingPoolChart';
import { TreasuryPoolChart } from './TreasuryPoolChart';

type Tab = 'staking' | 'treasury';

export function PoolCarousel() {
  const [active, setActive] = useState<Tab>('staking');

  return (
    <div className="w-full">
      {/* Chart area with animated transitions */}
      <AnimatePresence mode="wait">
        {active === 'staking' ? (
          <motion.div
            key="staking"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
          >
            <StakingPoolChart />
          </motion.div>
        ) : (
          <motion.div
            key="treasury"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <TreasuryPoolChart />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom tab toggle */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setActive('staking')}
          className={`flex-1 py-2.5 rounded-lg jersey-15-regular text-base font-medium transition-all duration-200 ${
            active === 'staking'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60'
          }`}
          aria-label="Show Staking Pool chart"
        >
          📊 Staking Pool
        </button>
        <button
          onClick={() => setActive('treasury')}
          className={`flex-1 py-2.5 rounded-lg jersey-15-regular text-base font-medium transition-all duration-200 ${
            active === 'treasury'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
              : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60'
          }`}
          aria-label="Show Treasury Pool chart"
        >
          🏦 Treasury
        </button>
      </div>
    </div>
  );
}

export default PoolCarousel;
