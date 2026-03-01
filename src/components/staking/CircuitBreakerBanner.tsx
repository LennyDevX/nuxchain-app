/**
 * CircuitBreakerBanner - Full-width emergency banner when circuit breaker is active.
 * Disabling deposits is handled at the parent level (StakingForm checks this prop).
 * Reads circuitBreakerEnabled + circuitBreakerReserveRatio from Core contract.
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStakingV620 } from '../../hooks/staking/useStakingV620';

const CircuitBreakerBanner = memo(() => {
  const { circuitBreaker } = useStakingV620();

  return (
    <AnimatePresence>
      {circuitBreaker.isBlocked && (
        <motion.div
          className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex items-start gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <span className="text-2xl flex-shrink-0">🔒</span>
          <div className="flex-1 min-w-0">
            <p className="jersey-15-regular text-red-400 font-semibold text-base">
              Deposits Temporarily Paused — Protocol in Safe Mode
            </p>
            <p className="jersey-20-regular text-white/60 text-sm mt-1">
              The circuit breaker has been activated to protect protocol reserves.
              Withdrawals and compounds remain available. Reserve ratio:{' '}
              <span className="text-white/80">{(Number(circuitBreaker.reserveRatio) / 100).toFixed(2)}%</span>
            </p>
            <p className="jersey-20-regular text-white/40 text-xs mt-1">
              Deposits will resume automatically once reserves are restored.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CircuitBreakerBanner.displayName = 'CircuitBreakerBanner';
export default CircuitBreakerBanner;
