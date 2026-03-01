/**
 * ExpiringDepositsAlert - Warn when deposits unlock soon (< 3 days)
 * Uses: useStakingV620().expiringDeposits
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStakingV620, type ExpiringDeposit } from '../../hooks/staking/useStakingV620';

function getCountdownLabel(unlockTimestamp: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const diff = unlockTimestamp - now;
  if (diff <= 0n) return 'Unlocked';
  const h = diff / 3600n;
  const m = (diff % 3600n) / 60n;
  if (h > 48n) return `${(h / 24n).toString()}d ${(h % 24n).toString()}h`;
  return `${h.toString()}h ${m.toString()}m`;
}

function formatAmount(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

const ExpiringDepositsAlert = memo(() => {
  const { expiringDeposits } = useStakingV620();
  const [expanded, setExpanded] = useState(false);

  const deposits = expiringDeposits as ExpiringDeposit[];

  if (!deposits || deposits.length === 0) return null;

  return (
    <motion.div
      className="border border-amber-500/40 bg-amber-500/5 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-500/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <span className="jersey-15-regular text-amber-400 font-semibold text-sm">
            {deposits.length === 1
              ? '1 deposit unlocks soon'
              : `${deposits.length} deposits unlock soon`}
          </span>
        </div>
        <span className="jersey-20-regular text-white/40 text-xs">
          {expanded ? '▲ Collapse' : '▼ View'}
        </span>
      </button>

      {/* Expanded deposit list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-4 pb-4 space-y-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="grid grid-cols-3 gap-2 text-xs mb-1">
              <span className="jersey-20-regular text-white/40">Deposit ID</span>
              <span className="jersey-20-regular text-white/40 text-right">Amount</span>
              <span className="jersey-20-regular text-white/40 text-right">Time Left</span>
            </div>
            {deposits.map((d) => (
              <div
                key={d.index.toString()}
                className="grid grid-cols-3 gap-2 bg-white/5 rounded-lg px-3 py-2"
              >
                <span className="jersey-20-regular text-white/70 text-sm">
                  #{d.index.toString()}
                </span>
                <span className="jersey-20-regular text-white text-sm text-right">
                  {formatAmount(d.amount)} POL
                </span>
                <span className="jersey-15-regular text-amber-400 text-sm text-right">
                  {getCountdownLabel(d.unlockTime)}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ExpiringDepositsAlert.displayName = 'ExpiringDepositsAlert';
export default ExpiringDepositsAlert;
