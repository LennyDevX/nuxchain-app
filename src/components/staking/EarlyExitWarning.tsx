/**
 * EarlyExitWarning — Warns about 0.5% early exit fee for flexible deposits < 7 days old
 * Uses: useStakingV620().earlyExitFeePreview
 * Props: list of flexible deposits from DepositsManager
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStakingV620 } from '../../hooks/staking/useStakingV620';

export interface FlexibleDeposit {
  depositId: bigint;
  amount: bigint;
  startTime: bigint;
}

interface Props {
  deposits: FlexibleDeposit[];
}

const EARLY_EXIT_FEE_BPS = 50n; // 0.5%
const MIN_AGE_SECONDS = 7n * 24n * 3600n; // 7 days

function getAgeLabel(startTime: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const age = now - startTime;
  if (age < 3600n) return `${(age / 60n).toString()}m old`;
  if (age < 86400n) return `${(age / 3600n).toString()}h old`;
  return `${(age / 86400n).toString()}d old`;
}

function formatPOL(wei: bigint): string {
  return (Number(wei) / 1e18).toLocaleString('en-US', { maximumFractionDigits: 4 });
}

const EarlyExitWarning = memo(({ deposits }: Props) => {
  const { earlyExitFeePreview } = useStakingV620();

  const now = BigInt(Math.floor(Date.now() / 1000));
  const earlyDeposits = deposits.filter(d => now - d.startTime < MIN_AGE_SECONDS);

  if (earlyDeposits.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="border border-orange-500/40 bg-orange-500/5 rounded-xl p-4 space-y-3"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <p className="jersey-15-regular text-orange-400 font-semibold text-sm">
            Early exit fee applies to {earlyDeposits.length} deposit{earlyDeposits.length > 1 ? 's' : ''}
          </p>
        </div>
        <p className="jersey-20-regular text-white/50 text-xs">
          Flexible deposits withdrawn within 7 days incur a{' '}
          <span className="text-orange-300 font-semibold">
            {Number(EARLY_EXIT_FEE_BPS) / 100}% early exit fee
          </span>
          . Wait until 7 days to avoid it.
        </p>

        {/* Per-deposit fee preview */}
        <div className="space-y-2">
          {earlyDeposits.map(d => {
            const preview = earlyExitFeePreview(d.amount, d.startTime);
            const daysLeft = Number((MIN_AGE_SECONDS - (now - d.startTime)) / 86400n);
            const hoursLeft = Number(((MIN_AGE_SECONDS - (now - d.startTime)) % 86400n) / 3600n);
            const timeLabel = daysLeft > 0
              ? `${daysLeft}d ${hoursLeft}h until fee-free`
              : `${hoursLeft}h until fee-free`;

            return (
              <div
                key={d.depositId.toString()}
                className="grid grid-cols-3 bg-white/5 rounded-lg px-3 py-2 gap-2 items-center"
              >
                <div>
                  <p className="jersey-20-regular text-white/70 text-xs">#{d.depositId.toString()}</p>
                  <p className="jersey-20-regular text-white/40 text-xs">{getAgeLabel(d.startTime)}</p>
                </div>
                <div className="text-center">
                  <p className="jersey-20-regular text-orange-400 text-xs font-semibold">
                    -{formatPOL(preview.fee)} POL
                  </p>
                  <p className="jersey-20-regular text-white/40 text-xs">fee</p>
                </div>
                <div className="text-right">
                  <p className="jersey-20-regular text-white/60 text-xs">{timeLabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

EarlyExitWarning.displayName = 'EarlyExitWarning';
export default EarlyExitWarning;
