/**
 * useTreasuryDistributions — Fetch on-chain distribution history from TreasuryManager
 *
 * Uses the Polygonscan Logs API (archive access, no block range limits, CORS-open, free).
 * 3 requests total — one per event type — instead of 80+ chunked RPC calls.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, decodeEventLog, keccak256, toBytes } from 'viem';
import { TreasuryManagerABI as TreasuryManagerABIJSON } from '../../lib/export/abis/legacy';

const TREASURY_MANAGER = import.meta.env.VITE_TREASURY_MANAGER_ADDRESS as `0x${string}`;
const TreasuryManagerABI = TreasuryManagerABIJSON.abi as any[];

// Etherscan V2 unified API — archive access, no block range restrictions, CORS-open.
// chainid=137 targets Polygon mainnet. Uses VITE_ETHERSCAN_API_KEY (same key works for V2).
const POLYSCAN_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY ?? '';
const POLYSCAN_BASE = 'https://api.etherscan.io/v2/api';
const POLYSCAN_CHAIN = '137';

// Contract deployed at block 83626827; start 1000 blocks before to be safe
const FROM_BLOCK = 83625000;

// Pre-compute topic0 hashes
const TOPIC_DISTRIBUTED = keccak256(toBytes('RevenueDistributed(uint8,address,uint256)'));
const TOPIC_RECEIVED    = keccak256(toBytes('RevenueReceived(address,uint256,string)'));
const TOPIC_TRIGGERED   = keccak256(toBytes('DistributionTriggered(uint256,uint256)'));
const EVENT_TOPICS: Record<string, string> = {
  RevenueDistributed:    TOPIC_DISTRIBUTED,
  RevenueReceived:       TOPIC_RECEIVED,
  DistributionTriggered: TOPIC_TRIGGERED,
};

export const TREASURY_LABELS = ['Rewards', 'Staking', 'Collaborators', 'Development', 'Marketplace'];
export const TREASURY_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#64748b'];

export interface DistributionEvent {
  txHash: string;
  blockNumber: bigint;
  timestamp: number;
  treasuryType: number;
  treasuryAddress: string;
  amount: bigint;
}

export interface RevenueEvent {
  txHash: string;
  blockNumber: bigint;
  timestamp: number;
  source: string;
  amount: bigint;
  revenueType: string;
}

export interface DistributionCycle {
  txHash: string;
  blockNumber: bigint;
  timestamp: number;
  totalAmount: bigint;
  nextCycleTime: bigint;
}

export interface TreasuryDistributionSummary {
  index: number;
  name: string;
  color: string;
  address: string;
  totalReceived: bigint;
  eventCount: number;
  pct: number;
}

export function useTreasuryDistributions() {
  const { chain } = useAccount();

  const [distributions, setDistributions] = useState<DistributionEvent[]>([]);
  const [revenues, setRevenues] = useState<RevenueEvent[]>([]);
  const [cycles, setCycles] = useState<DistributionCycle[]>([]);
  const [summaries, setSummaries] = useState<TreasuryDistributionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const getExplorerUrl = useCallback(
    (txHash: string) => {
      const base = chain?.id === 137
        ? 'https://polygonscan.com/tx/'
        : 'https://amoy.polygonscan.com/tx/';
      return `${base}${txHash}`;
    },
    [chain?.id]
  );

  // Single Polygonscan API call per event type — full archive, real timestamps, no chunking
  const fetchLogs = useCallback(async (eventName: string) => {
    const topic0 = EVENT_TOPICS[eventName];
    if (!topic0) return [];

    const params = new URLSearchParams({
      chainid: POLYSCAN_CHAIN,
      module: 'logs',
      action: 'getLogs',
      address: TREASURY_MANAGER,
      topic0,
      fromBlock: String(FROM_BLOCK),
      toBlock: 'latest',
      apikey: POLYSCAN_KEY || 'YourApiKeyToken',
    });

    const res = await fetch(`${POLYSCAN_BASE}?${params}`);
    const json = await res.json();

    if (json.status !== '1') {
      // status '0' with message 'No records found' is normal for empty results
      if (json.message !== 'No records found') {
        console.warn(`[TreasuryDist] ${eventName}: ${json.message ?? 'API error'} — ${json.result ?? '(no detail)'} | apikey=${POLYSCAN_KEY ? 'present' : 'missing'}`);
      }
      return [];
    }

    const decoded: Array<{ transactionHash: string; blockNumber: bigint; timestamp: number; args: Record<string, unknown> }> = [];
    for (const rawLog of (json.result ?? [])) {
      try {
        const { args } = decodeEventLog({
          abi: TreasuryManagerABI,
          eventName,
          data: rawLog.data,
          topics: rawLog.topics,
        });
        decoded.push({
          transactionHash: rawLog.transactionHash,
          blockNumber: BigInt(rawLog.blockNumber),
          timestamp: parseInt(rawLog.timeStamp, 16), // Polygonscan returns hex timestamp
          args: args as Record<string, unknown>,
        });
      } catch { /* skip malformed log */ }
    }
    return decoded;
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!TREASURY_MANAGER) return;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[TreasuryDist] Fetching via Polygonscan API (archive, no block limits)');

      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
      // Space requests 400ms apart to stay under the 3/sec free-tier rate limit
      const distLogs = await fetchLogs('RevenueDistributed');
      await delay(700);
      const recvLogs = await fetchLogs('RevenueReceived');
      await delay(700);
      const trigLogs = await fetchLogs('DistributionTriggered');

      console.log(`[TreasuryDist] Found: ${distLogs.length} distributed, ${recvLogs.length} received, ${trigLogs.length} cycles`);

      // ── RevenueDistributed ─────────────────────────────────────────────────
      {
        const parsed: DistributionEvent[] = distLogs
          .map(log => ({
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: log.timestamp,
            treasuryType: Number(log.args?.treasuryType ?? 0),
            treasuryAddress: (log.args?.treasuryAddress ?? '') as string,
            amount: BigInt(String(log.args?.amount ?? '0')),
          }))
          .reverse();

        setDistributions(parsed);

        const summaryMap = new Map<number, TreasuryDistributionSummary>();
        for (let i = 0; i < 5; i++) {
          summaryMap.set(i, {
            index: i,
            name: TREASURY_LABELS[i],
            color: TREASURY_COLORS[i],
            address: '',
            totalReceived: 0n,
            eventCount: 0,
            pct: 0,
          });
        }
        let grandTotal = 0n;
        for (const evt of parsed) {
          const s = summaryMap.get(evt.treasuryType);
          if (s) {
            s.totalReceived += evt.amount;
            s.eventCount++;
            grandTotal += evt.amount;
            if (!s.address && evt.treasuryAddress) s.address = evt.treasuryAddress;
          }
        }
        setSummaries(Array.from(summaryMap.values()).map(s => ({
          ...s,
          pct: grandTotal > 0n
            ? Math.round(Number((s.totalReceived * 10000n) / grandTotal) / 100)
            : 0,
        })));
      }

      // ── RevenueReceived ────────────────────────────────────────────────────
      {
        const parsed: RevenueEvent[] = recvLogs
          .map(log => ({
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: log.timestamp,
            source:      (log.args?.source ?? '') as string,
            amount:      BigInt(String(log.args?.amount ?? '0')),
            revenueType: (log.args?.revenueType ?? '') as string,
          }))
          .reverse();
        setRevenues(parsed);
      }

      // ── DistributionTriggered ──────────────────────────────────────────────
      {
        const parsed: DistributionCycle[] = trigLogs
          .map(log => ({
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: log.timestamp,
            totalAmount:   BigInt(String(log.args?.amount ?? '0')),
            nextCycleTime: BigInt(String(log.args?.nextDistributionTime ?? '0')),
          }))
          .reverse();
        setCycles(parsed);
      }

      setLastFetch(Date.now());
    } catch (err) {
      console.error('[useTreasuryDistributions]', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch distribution logs');
    } finally {
      setIsLoading(false);
    }
  }, [fetchLogs]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    distributions,
    revenues,
    cycles,
    summaries,
    isLoading,
    error,
    lastFetch,
    getExplorerUrl,
    refetch: fetchEvents,
    contractAddress: TREASURY_MANAGER,
  };
}

// ── Helpers exported for the component ───────────────────────────────────────

export function fmtPOL(wei: bigint, dp = 3): string {
  return parseFloat(formatEther(wei)).toLocaleString(undefined, {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

export function fmtTimeAgo(unixSecs: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSecs;
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
