/**
 * ProtocolHealthBadge - Shows the real-time health status of the staking protocol.
 * Reads from getPoolHealth() → EnhancedSmartStakingViewStats
 * healthStatus: 4=Excellent 3=Healthy 2=Moderate 1=LowFunds 0=Critical
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { useStakingV620 } from '../../hooks/staking/useStakingV620';

const HEALTH_CONFIG: Record<number, { label: string; color: string; bg: string; dot: string }> = {
  4: { label: 'Excellent', color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30',  dot: 'bg-green-400' },
  3: { label: 'Healthy',   color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30',    dot: 'bg-blue-400' },
  2: { label: 'Moderate',  color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', dot: 'bg-yellow-400' },
  1: { label: 'Low Funds', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30', dot: 'bg-orange-400' },
  0: { label: 'Critical',  color: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/30',       dot: 'bg-red-500' },
};

interface Props {
  compact?: boolean;
}

const ProtocolHealthBadge = memo(({ compact = false }: Props) => {
  const { poolHealth } = useStakingV620();
  const cfg = HEALTH_CONFIG[poolHealth.healthStatus] ?? HEALTH_CONFIG[3];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs ${cfg.bg} ${cfg.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
        <span className="jersey-20-regular">{cfg.label}</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${cfg.bg}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} animate-pulse flex-shrink-0`} />
      <div>
        <p className={`jersey-15-regular text-sm font-semibold ${cfg.color}`}>
          Protocol: {cfg.label}
        </p>
        {poolHealth.statusMessage && (
          <p className="jersey-20-regular text-white/50 text-xs mt-0.5">{poolHealth.statusMessage}</p>
        )}
      </div>
    </motion.div>
  );
});

ProtocolHealthBadge.displayName = 'ProtocolHealthBadge';
export default ProtocolHealthBadge;
