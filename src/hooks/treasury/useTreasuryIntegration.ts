/**
 * useTreasuryIntegration - Hook for tracking SmartStaking → Treasury commission flow
 * Watches for CommissionPaid events and provides visibility into the 6% commission system
 */

import { useState, useEffect } from 'react';
import { useAccount, useWatchContractEvent, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import type { Abi } from 'viem';
import EnhancedSmartStakingABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';

const STAKING_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_MANAGER_ADDRESS as `0x${string}`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CommissionEvent {
  receiver: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}

export interface TreasuryIntegrationData {
  // Latest commission event
  lastCommission: CommissionEvent | null;
  
  // Commission stats
  commissionRate: number; // 6%
  totalCommissionsPaid: bigint;
  totalCommissionsPaidFormatted: string;
  
  // Recent activity
  recentCommissions: CommissionEvent[];
  
  // Integration status
  isIntegrated: boolean;
  treasuryAddress: `0x${string}` | null;
}

// ============================================
// MAIN HOOK
// ============================================

export function useTreasuryIntegration(): TreasuryIntegrationData {
  const { chain } = useAccount();
  const [lastCommission, setLastCommission] = useState<CommissionEvent | null>(null);
  const [recentCommissions, setRecentCommissions] = useState<CommissionEvent[]>([]);

  // Get treasury manager address from contract
  const { data: treasuryManagerAddress } = useReadContract({
    address: STAKING_ADDRESS,
    abi: EnhancedSmartStakingABI.abi as Abi,
    functionName: 'treasuryManager',
    chainId: chain?.id,
  }) as { data: `0x${string}` | undefined };

  // Watch for CommissionPaid events from SmartStaking contract
  useWatchContractEvent({
    address: STAKING_ADDRESS,
    abi: EnhancedSmartStakingABI.abi as Abi,
    eventName: 'CommissionPaid',
    onLogs: (logs) => {
      logs.forEach((log) => {
        try {
          // Type assertion for event log with args
          const eventLog = log as typeof log & { args?: { receiver?: `0x${string}`; amount?: bigint; timestamp?: bigint } };
          const { args, transactionHash, blockNumber } = eventLog;
          if (!args) return;

          const commissionEvent: CommissionEvent = {
            receiver: args.receiver as `0x${string}`,
            amount: args.amount as bigint,
            timestamp: args.timestamp as bigint,
            txHash: transactionHash || '0x',
            blockNumber: blockNumber || 0n,
          };

          // Update last commission
          setLastCommission(commissionEvent);

          // Add to recent list (keep last 10)
          setRecentCommissions((prev) => [commissionEvent, ...prev].slice(0, 10));

          // Log for debugging
          console.log('💰 Commission paid to treasury:', {
            amount: formatEther(commissionEvent.amount),
            receiver: commissionEvent.receiver,
            timestamp: new Date(Number(commissionEvent.timestamp) * 1000).toLocaleString(),
          });
        } catch (error) {
          console.error('[useTreasuryIntegration] Error parsing CommissionPaid event:', error);
        }
      });
    },
    enabled: !!STAKING_ADDRESS && !!chain?.id,
  });

  // Load recent commissions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('treasury_recent_commissions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const events: CommissionEvent[] = parsed.map((e: Record<string, unknown>) => ({
          receiver: e.receiver as `0x${string}`,
          amount: BigInt(e.amount as string),
          timestamp: BigInt(e.timestamp as string),
          txHash: e.txHash as string,
          blockNumber: BigInt(e.blockNumber as string),
        }));
        setRecentCommissions(events);
        if (events.length > 0) {
          setLastCommission(events[0]);
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  // Save recent commissions to localStorage when updated
  useEffect(() => {
    if (recentCommissions.length > 0) {
      const serializable = recentCommissions.map((e) => ({
        receiver: e.receiver,
        amount: e.amount.toString(),
        timestamp: e.timestamp.toString(),
        txHash: e.txHash,
        blockNumber: e.blockNumber.toString(),
      }));
      localStorage.setItem('treasury_recent_commissions', JSON.stringify(serializable));
    }
  }, [recentCommissions]);

  // Calculate total commissions from recent events
  const totalCommissionsPaid = recentCommissions.reduce(
    (acc, commission) => acc + commission.amount,
    0n
  );

  const isIntegrated = 
    !!treasuryManagerAddress && 
    treasuryManagerAddress.toLowerCase() === TREASURY_ADDRESS.toLowerCase();

  return {
    lastCommission,
    commissionRate: 6, // 6% commission rate
    totalCommissionsPaid,
    totalCommissionsPaidFormatted: formatEther(totalCommissionsPaid),
    recentCommissions,
    isIntegrated,
    treasuryAddress: treasuryManagerAddress || null,
  };
}

export default useTreasuryIntegration;
