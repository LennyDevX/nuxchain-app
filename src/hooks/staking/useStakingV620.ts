/**
 * useStakingV620 - Central hook for all NuxChain SmartStaking v6.2.0 features
 *
 * Covers:
 * - APY Simulator (simulateAPY)
 * - Circuit Breaker state (circuitBreakerEnabled, circuitBreakerReserveRatio)
 * - Reinvestment & compound fee preview (reinvestmentPercentage, setReinvestmentPercentage)
 * - Referral system (getReferralInfo, registerReferrer)
 * - Expiring deposits alerts (getExpiringDeposits)
 * - Split deposit (depositBatch)
 * - User skill summary for APY personalization (getUserSkillSummary)
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import type { Abi } from 'viem';
import EnhancedSmartStakingCoreABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';
import EnhancedSmartStakingRewardsABI from '../../abi/SmartStaking/EnhancedSmartStakingRewards.json';
import EnhancedSmartStakingViewABI from '../../abi/SmartStaking/EnhancedSmartStakingView.json';
import EnhancedSmartStakingViewStatsABI from '../../abi/SmartStaking/EnhancedSmartStakingViewStats.json';

// ── Constants ──
const CORE_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;
const REWARDS_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_REWARDS_ADDRESS as `0x${string}`;
const VIEW_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`;
const VIEW_STATS_ADDRESS = import.meta.env.VITE_STAKING_VIEW_STATS_ADDRESS as `0x${string}`;

/** Early exit fee = 0.5% = 50 bps */
export const EARLY_EXIT_FEE_BPS = 50n;
/** Autocompound fee = 0.25% = 25 bps */
export const COMPOUND_FEE_BPS = 25n;
/** 7 days in seconds */
export const EARLY_EXIT_WINDOW_SECS = 604800n;

export interface SimulatedAPY {
  effectiveAPY: bigint;   // bps
  annualRewards: bigint;  // wei
  effectiveAPYPct: string;
  annualRewardsFmt: string;
}

export interface ExpiringDeposit {
  index: bigint;
  unlockTime: bigint;
  amount: bigint;
}

export interface UserSkillSummary {
  boostedAPYs: readonly bigint[];     // [5] bps per period
  effectiveFeeDiscount: bigint;        // bps
  reducedLockTimes: readonly bigint[]; // [5] seconds
}

export interface SplitDepositPreview {
  totalAmount: bigint;
  splits: Array<{ periodLabel: string; amount: bigint; apyBps: bigint; annualRewards: bigint }>;
  weightedAvgAPY: number;
}

// Helper: format bps → "X.XX%"
export function formatBPS(bps: bigint): string {
  return `${(Number(bps) / 100).toFixed(2)}%`;
}

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────
export function useStakingV620() {
  const { address, isConnected } = useAccount();
  const enabled = !!address && isConnected;

  const coreConfig = useMemo(() => ({
    address: CORE_ADDRESS,
    abi: EnhancedSmartStakingCoreABI.abi as Abi,
  }), []);

  const viewConfig = useMemo(() => ({
    address: VIEW_ADDRESS,
    abi: EnhancedSmartStakingViewABI.abi as Abi,
  }), []);

  const viewStatsConfig = useMemo(() => ({
    address: VIEW_STATS_ADDRESS,
    abi: EnhancedSmartStakingViewStatsABI.abi as Abi,
  }), []);

  // ── Staking rates (global, no user needed) ──
  const { data: ratesData } = useReadContracts({
    contracts: [
      { ...viewStatsConfig, functionName: 'getStakingRatesInfo' },
      { ...viewStatsConfig, functionName: 'getPoolHealth' },
    ],
    query: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000, refetchOnWindowFocus: false },
  });

  // ── User-specific data ──
  const { data: userData, refetch: refetchUserData } = useReadContracts({
    contracts: [
      { ...coreConfig, functionName: 'circuitBreakerEnabled' },
      { ...coreConfig, functionName: 'circuitBreakerReserveRatio' },
      { ...coreConfig, functionName: 'reinvestmentPercentage', args: [address] },
      { ...coreConfig, functionName: 'referralBoostBps' },
      { ...viewStatsConfig, functionName: 'getReferralInfo', args: [address] },
      { ...viewStatsConfig, functionName: 'getExpiringDeposits', args: [address, BigInt(259200)] },
      { ...viewConfig, functionName: 'getUserSkillSummary', args: [address] },
    ],
    query: {
      enabled,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  // ── Write contracts ──
  const { writeContract, data: txHash, isPending: isTxPending, error: txError, reset: resetTx } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // ── Parsed: Staking Rates ──
  const stakingRates = useMemo(() => {
    const raw = ratesData?.[0]?.result as Record<string, unknown> | undefined;
    if (!raw?.lockupPeriods) return null;
    return {
      lockupPeriods: raw.lockupPeriods as readonly bigint[],
      hourlyROI: raw.hourlyROI as readonly bigint[],
      annualAPY: raw.annualAPY as readonly bigint[],
      periodNames: raw.periodNames as readonly string[],
    };
  }, [ratesData]);

  // ── Parsed: Pool Health ──
  const poolHealth = useMemo(() => {
    const raw = ratesData?.[1]?.result as Record<string, unknown> | undefined;
    return {
      healthStatus: Number(raw?.healthStatus ?? 3),
      statusMessage: String(raw?.statusMessage ?? 'Healthy'),
      reserveRatio: BigInt((raw?.reserveRatio as bigint) ?? 0n),
      description: String(raw?.description ?? ''),
    };
  }, [ratesData]);

  // ── Parsed: Circuit Breaker ──
  const circuitBreaker = useMemo(() => {
    const enabled = Boolean(userData?.[0]?.result);
    const reserveRatio = BigInt((userData?.[1]?.result as bigint) ?? 0n);
    return { enabled, reserveRatio, isBlocked: enabled };
  }, [userData]);

  // ── Parsed: Reinvestment ──
  const reinvestmentPct = useMemo(() =>
    BigInt((userData?.[2]?.result as bigint) ?? 0n), [userData]);

  // ── Parsed: Referral Boost BPS ──
  const referralBoostBps = useMemo(() =>
    BigInt((userData?.[3]?.result as bigint) ?? 150n), [userData]);

  // ── Parsed: Referral Info ──
  const referralInfo = useMemo(() => {
    const raw = userData?.[4]?.result as unknown[];
    if (!Array.isArray(raw)) return null;
    const referrerAddr = raw[0] as string;
    return {
      referrer: referrerAddr && referrerAddr !== '0x0000000000000000000000000000000000000000'
        ? referrerAddr as `0x${string}` : null,
      totalReferralsMade: BigInt((raw[1] as bigint) ?? 0n),
      boostEndTime: BigInt((raw[2] as bigint) ?? 0n),
      boostActive: Boolean(raw[3]),
      currentBoostBps: BigInt((raw[4] as bigint) ?? 0n),
    };
  }, [userData]);

  // ── Parsed: Expiring Deposits ──
  const expiringDeposits = useMemo((): ExpiringDeposit[] => {
    const raw = userData?.[5]?.result as [bigint[], bigint[], bigint[]] | undefined;
    if (!raw || !Array.isArray(raw[0])) return [];
    return (raw[0] as bigint[]).map((idx, i) => ({
      index: idx,
      unlockTime: (raw[1] as bigint[])[i] ?? 0n,
      amount: (raw[2] as bigint[])[i] ?? 0n,
    }));
  }, [userData]);

  // ── Parsed: Skill Summary ──
  const skillSummary = useMemo((): UserSkillSummary | null => {
    const raw = userData?.[6]?.result as unknown[] | undefined;
    if (!raw) return null;
    return {
      boostedAPYs: (Array.isArray(raw[0]) ? raw[0] : []) as readonly bigint[],
      effectiveFeeDiscount: BigInt((raw[1] as bigint) ?? 0n),
      reducedLockTimes: (Array.isArray(raw[2]) ? raw[2] : []) as readonly bigint[],
    };
  }, [userData]);

  // ── Compound fee preview ──
  const compoundFeePreview = useCallback((rewardsWei: bigint) => {
    const fee = (rewardsWei * COMPOUND_FEE_BPS) / 10000n;
    const net = rewardsWei - fee;
    return { fee, net, feeFmt: formatEther(fee), netFmt: formatEther(net) };
  }, []);

  // ── Reinvestment split preview ──
  const reinvestmentSplitPreview = useCallback((rewardsWei: bigint) => {
    const compound = (rewardsWei * reinvestmentPct) / 10000n;
    const payout = rewardsWei - compound;
    return {
      compound,
      payout,
      compoundFmt: formatEther(compound),
      payoutFmt: formatEther(payout),
      pct: Number(reinvestmentPct) / 100,
    };
  }, [reinvestmentPct]);

  // ── Early exit fee preview (for deposits < 7 days old) ──
  const earlyExitFeePreview = useCallback((principalWei: bigint, depositTimestamp: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const isEarlyExit = (now - depositTimestamp) < EARLY_EXIT_WINDOW_SECS;
    if (!isEarlyExit) return { fee: 0n, net: principalWei, isEarlyExit: false, feeFmt: '0', netFmt: formatEther(principalWei) };
    const fee = (principalWei * EARLY_EXIT_FEE_BPS) / 10000n;
    const net = principalWei - fee;
    return { fee, net, isEarlyExit: true, feeFmt: formatEther(fee), netFmt: formatEther(net) };
  }, []);

  // ── Simulate APY (single) — via simulateAPY on Rewards contract ──
  const [simulating, setSimulating] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<SimulatedAPY | null>(null);

  // debounced simulate: returns a function to cancel
  let _simTimer: ReturnType<typeof setTimeout> | null = null;

  const simulateAPY = useCallback(async (amountEth: string, lockupIndex: number) => {
    if (_simTimer) clearTimeout(_simTimer);
    const amtWei = (() => { try { return parseEther(amountEth || '0'); } catch { return 0n; } })();
    if (amtWei === 0n) { setSimulatedResult(null); return; }

    _simTimer = setTimeout(async () => {
      setSimulating(true);
      try {
        // We'll use a direct wagmi readContract style — trigger a re-render by storing params
        setSimulateParams({ amountWei: amtWei, lockupIndex, userAddr: address ?? '0x0000000000000000000000000000000000000000' as `0x${string}` });
      } finally {
        setSimulating(false);
      }
    }, 500);
  }, [address]);

  // ── Simulate APY params state (triggers useReadContracts) ──
  const [simulateParams, setSimulateParams] = useState<{ amountWei: bigint; lockupIndex: number; userAddr: `0x${string}` } | null>(null);

  const { data: simData } = useReadContracts({
    contracts: simulateParams ? [{
      address: REWARDS_ADDRESS,
      abi: EnhancedSmartStakingRewardsABI.abi as Abi,
      functionName: 'simulateAPY',
      args: [simulateParams.amountWei, BigInt(simulateParams.lockupIndex), simulateParams.userAddr],
    }] : [],
    query: { enabled: !!simulateParams, staleTime: 10000 },
  });

  useEffect(() => {
    if (!simData?.[0]?.result) { setSimulatedResult(null); return; }
    const raw = simData[0].result as [bigint, bigint];
    const effectiveAPY = raw[0];
    const annualRewards = raw[1];
    setSimulatedResult({
      effectiveAPY,
      annualRewards,
      effectiveAPYPct: formatBPS(effectiveAPY),
      annualRewardsFmt: formatEther(annualRewards),
    });
  }, [simData]);

  // ── Personal APY from skills (overrides base) ──
  const getPersonalAPY = useCallback((lockupIndex: number): bigint | null => {
    if (!skillSummary?.boostedAPYs?.length) return null;
    return skillSummary.boostedAPYs[lockupIndex] ?? null;
  }, [skillSummary]);

  // ── Write: Set reinvestment percentage ──
  const setReinvestmentPercentage = useCallback((pct: number) => {
    writeContract({
      address: CORE_ADDRESS,
      abi: EnhancedSmartStakingCoreABI.abi as Abi,
      functionName: 'setReinvestmentPercentage',
      args: [BigInt(pct)],
    });
  }, [writeContract]);

  // ── Write: Register referrer ──
  const registerReferrer = useCallback((referrerAddress: `0x${string}`) => {
    writeContract({
      address: CORE_ADDRESS,
      abi: EnhancedSmartStakingCoreABI.abi as Abi,
      functionName: 'registerReferrer',
      args: [referrerAddress],
    });
  }, [writeContract]);

  // ── Write: Deposit batch (split deposit) ──
  const depositBatch = useCallback((lockupDurations: bigint[], amounts: bigint[]) => {
    const total = amounts.reduce((sum, a) => sum + a, 0n);
    writeContract({
      address: CORE_ADDRESS,
      abi: EnhancedSmartStakingCoreABI.abi as Abi,
      functionName: 'depositBatch',
      args: [lockupDurations, amounts],
      value: total,
    });
  }, [writeContract]);

  return {
    // ── Data ──
    stakingRates,
    poolHealth,
    circuitBreaker,
    reinvestmentPct,
    referralBoostBps,
    referralInfo,
    expiringDeposits,
    skillSummary,
    // ── Simulation ──
    simulateAPY,
    simulating,
    simulatedResult,
    getPersonalAPY,
    // ── Previews ──
    compoundFeePreview,
    reinvestmentSplitPreview,
    earlyExitFeePreview,
    // ── Write Actions ──
    setReinvestmentPercentage,
    registerReferrer,
    depositBatch,
    // ── TX State ──
    isTxPending,
    isConfirming,
    isConfirmed,
    txHash,
    txError,
    resetTx,
    refetchUserData,
  };
}
