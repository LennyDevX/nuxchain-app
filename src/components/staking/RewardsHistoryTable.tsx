import React, { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useWatchContractEvent } from 'wagmi';
import { formatEther, type Log } from 'viem';
import EnhancedSmartStakingCoreV2ABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';
import { formatPOL, formatRelativeTime, getTxUrl } from '../../utils/staking/formatters';

// ============================================
// TYPES
// ============================================

type EventType = 'deposit' | 'withdraw' | 'compound' | 'quest_reward' | 'emergency';

interface StakingEvent {
  id: string;
  type: EventType;
  amount: string;
  amountRaw: bigint;
  timestamp: Date;
  txHash: string;
  blockNumber: bigint;
  extra?: Record<string, string>;
}

interface RewardsHistoryTableProps {
  className?: string;
  maxEvents?: number;
}

// ============================================
// CONSTANTS
// ============================================

const EVENT_CONFIG: Record<EventType, { label: string; icon: string; color: string; bgColor: string }> = {
  deposit: { label: 'Deposit', icon: '📥', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  withdraw: { label: 'Withdraw', icon: '📤', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  compound: { label: 'Compound', icon: '🔄', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  quest_reward: { label: 'Quest Reward', icon: '🏆', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  emergency: { label: 'Emergency', icon: '🚨', color: 'text-red-400', bgColor: 'bg-red-500/10' },
};

const STORAGE_KEY = 'nuxchain_staking_events';

// ============================================
// LOCAL STORAGE PERSISTENCE
// ============================================

function loadPersistedEvents(): StakingEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((e: Record<string, unknown>) => ({
      ...e,
      amountRaw: BigInt(e.amountRaw as string),
      timestamp: new Date(e.timestamp as string),
      blockNumber: BigInt(e.blockNumber as string),
    }));
  } catch {
    return [];
  }
}

function persistEvents(events: StakingEvent[]) {
  try {
    const serialized = events.map((e) => ({
      ...e,
      amountRaw: e.amountRaw.toString(),
      blockNumber: e.blockNumber.toString(),
      timestamp: e.timestamp.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized.slice(0, 100)));
  } catch {
    // silently fail on storage quota
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

const RewardsHistoryTable: React.FC<RewardsHistoryTableProps> = memo(({ className = '', maxEvents = 50 }) => {
  const { address } = useAccount();

  const [events, setEvents] = useState<StakingEvent[]>(() => loadPersistedEvents());
  const [filter, setFilter] = useState<EventType | 'all'>('all');

  const contractAddress = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;

  // Add event helper - deduplicates by txHash+type
  const addEvent = useCallback((newEvent: StakingEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === newEvent.id);
      if (exists) return prev;
      const updated = [newEvent, ...prev].slice(0, maxEvents);
      persistEvents(updated);
      return updated;
    });
  }, [maxEvents]);

  // Helper to create event from log
  const createEvent = useCallback(
    (type: EventType, amount: bigint, txHash: string, blockNumber: bigint, extra?: Record<string, string>): StakingEvent => ({
      id: `${txHash}-${type}`,
      type,
      amount: formatEther(amount),
      amountRaw: amount,
      timestamp: new Date(),
      txHash,
      blockNumber,
      extra,
    }),
    []
  );

  // Watch Deposited events
  useWatchContractEvent({
    address: contractAddress,
    abi: EnhancedSmartStakingCoreV2ABI.abi,
    eventName: 'Deposited',
    args: { user: address },
    enabled: !!address && !!contractAddress,
    onLogs: (logs: Log[]) => {
      logs.forEach((log: Log) => {
        const args = (log as unknown as { args: { amount?: bigint; lockupDuration?: bigint } }).args;
        const amount = args?.amount;
        const lockup = args?.lockupDuration;
        if (amount && log.transactionHash) {
          const lockupDays = lockup ? (Number(lockup) / 86400).toFixed(0) : '0';
          addEvent(createEvent('deposit', amount, log.transactionHash, log.blockNumber ?? 0n, { lockup: `${lockupDays}d` }));
        }
      });
    },
  });

  // Watch Withdrawn events
  useWatchContractEvent({
    address: contractAddress,
    abi: EnhancedSmartStakingCoreV2ABI.abi,
    eventName: 'Withdrawn',
    args: { user: address },
    enabled: !!address && !!contractAddress,
    onLogs: (logs: Log[]) => {
      logs.forEach((log: Log) => {
        const args = (log as unknown as { args: { amount?: bigint } }).args;
        const amount = args?.amount;
        if (amount && log.transactionHash) {
          addEvent(createEvent('withdraw', amount, log.transactionHash, log.blockNumber ?? 0n));
        }
      });
    },
  });

  // Watch Compounded events
  useWatchContractEvent({
    address: contractAddress,
    abi: EnhancedSmartStakingCoreV2ABI.abi,
    eventName: 'Compounded',
    args: { user: address },
    enabled: !!address && !!contractAddress,
    onLogs: (logs: Log[]) => {
      logs.forEach((log: Log) => {
        const args = (log as unknown as { args: { amount?: bigint } }).args;
        const amount = args?.amount;
        if (amount && log.transactionHash) {
          addEvent(createEvent('compound', amount, log.transactionHash, log.blockNumber ?? 0n));
        }
      });
    },
  });

  // Watch AutoCompoundTriggered events
  useWatchContractEvent({
    address: contractAddress,
    abi: EnhancedSmartStakingCoreV2ABI.abi,
    eventName: 'AutoCompoundTriggered',
    args: { user: address },
    enabled: !!address && !!contractAddress,
    onLogs: (logs: Log[]) => {
      logs.forEach((log: Log) => {
        const args = (log as unknown as { args: { compoundedAmount?: bigint } }).args;
        const amount = args?.compoundedAmount;
        if (amount && log.transactionHash) {
          addEvent(createEvent('compound', amount, log.transactionHash, log.blockNumber ?? 0n, { auto: 'true' }));
        }
      });
    },
  });

  // Watch EmergencyWithdrawal events
  useWatchContractEvent({
    address: contractAddress,
    abi: EnhancedSmartStakingCoreV2ABI.abi,
    eventName: 'EmergencyWithdrawal',
    args: { user: address },
    enabled: !!address && !!contractAddress,
    onLogs: (logs: Log[]) => {
      logs.forEach((log: Log) => {
        const args = (log as unknown as { args: { amount?: bigint } }).args;
        const amount = args?.amount;
        if (amount && log.transactionHash) {
          addEvent(createEvent('emergency', amount, log.transactionHash, log.blockNumber ?? 0n));
        }
      });
    },
  });

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  // Stats summary
  const stats = useMemo(() => {
    const totalDeposited = events
      .filter((e) => e.type === 'deposit')
      .reduce((acc, e) => acc + e.amountRaw, 0n);
    const totalWithdrawn = events
      .filter((e) => e.type === 'withdraw' || e.type === 'emergency')
      .reduce((acc, e) => acc + e.amountRaw, 0n);
    const totalCompounded = events
      .filter((e) => e.type === 'compound')
      .reduce((acc, e) => acc + e.amountRaw, 0n);
    return { totalDeposited, totalWithdrawn, totalCompounded };
  }, [events]);

  if (!address) {
    return (
      <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 ${className}`}>
        <p className="text-white/30 text-sm text-center">Connect wallet to see history</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="text-white font-semibold text-sm">Activity History</h3>
          </div>
          <span className="text-white/30 text-[10px]">{events.length} events tracked</span>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-emerald-500/5 rounded-lg p-2 text-center border border-emerald-500/10">
            <p className="text-emerald-400/60 text-[9px]">Deposited</p>
            <p className="text-emerald-400 text-xs font-bold">{formatPOL(stats.totalDeposited)}</p>
          </div>
          <div className="bg-blue-500/5 rounded-lg p-2 text-center border border-blue-500/10">
            <p className="text-blue-400/60 text-[9px]">Withdrawn</p>
            <p className="text-blue-400 text-xs font-bold">{formatPOL(stats.totalWithdrawn)}</p>
          </div>
          <div className="bg-purple-500/5 rounded-lg p-2 text-center border border-purple-500/10">
            <p className="text-purple-400/60 text-[9px]">Compounded</p>
            <p className="text-purple-400 text-xs font-bold">{formatPOL(stats.totalCompounded)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(['all', 'deposit', 'withdraw', 'compound', 'quest_reward', 'emergency'] as const).map((type) => {
            const config = type === 'all' ? { label: 'All', icon: '📋', color: 'text-white/60' } : EVENT_CONFIG[type];
            const count = type === 'all' ? events.length : events.filter((e) => e.type === type).length;
            if (type !== 'all' && count === 0) return null;
            return (
              <button
                key={type}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] transition-all whitespace-nowrap ${
                  filter === type
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/[0.03] text-white/40 border border-transparent hover:bg-white/5'
                }`}
                onClick={() => setFilter(type)}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="text-white/20">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="px-5 pb-5 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence mode="popLayout">
          {filteredEvents.length === 0 ? (
            <motion.div
              key="empty"
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-white/20 text-3xl mb-2">📭</p>
              <p className="text-white/30 text-xs">No activity recorded yet</p>
              <p className="text-white/15 text-[10px] mt-1">Events will appear here as you stake</p>
            </motion.div>
          ) : (
            filteredEvents.map((event, index) => {
              const config = EVENT_CONFIG[event.type];
              return (
                <motion.div
                  key={event.id}
                  className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0 group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-sm">{config.icon}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                      {event.extra?.lockup && (
                        <span className="text-white/20 text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full">
                          {event.extra.lockup}
                        </span>
                      )}
                      {event.extra?.auto === 'true' && (
                        <span className="text-purple-400/50 text-[9px] bg-purple-500/10 px-1.5 py-0.5 rounded-full">
                          Auto
                        </span>
                      )}
                    </div>
                    <p className="text-white/25 text-[10px]">
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-bold ${
                      event.type === 'deposit' || event.type === 'compound' ? 'text-emerald-400' : 'text-white/70'
                    }`}>
                      {event.type === 'deposit' || event.type === 'compound' ? '+' : '-'}
                      {formatPOL(event.amountRaw)} POL
                    </p>
                    {/* Tx link */}
                    <a
                      href={getTxUrl(event.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/15 text-[9px] hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      View tx →
                    </a>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Clear history */}
      {events.length > 0 && (
        <div className="px-5 pb-3 border-t border-white/5 pt-2">
          <button
            className="text-white/15 text-[10px] hover:text-red-400/50 transition-colors"
            onClick={() => {
              setEvents([]);
              localStorage.removeItem(STORAGE_KEY);
            }}
          >
            Clear history
          </button>
        </div>
      )}
    </motion.div>
  );
});

RewardsHistoryTable.displayName = 'RewardsHistoryTable';

export default RewardsHistoryTable;
