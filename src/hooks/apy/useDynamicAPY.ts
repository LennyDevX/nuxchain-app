import { useMemo } from 'react';
import { useAccount, useReadContracts, useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import type { Abi } from 'viem';
import DynamicAPYCalculatorABI from '../../abi/DynamicAPYCalculator.sol/DynamicAPYCalculator.json';
import { useTreasuryHealthMonitor } from '../treasury/useTreasuryHealthMonitor';

const DYNAMIC_APY_ADDRESS = import.meta.env.VITE_DYNAMIC_APY_CALCULATOR_ADDRESS as `0x${string}`;

// Log contract address on module load (only in dev)
if (import.meta.env.DEV) {
  console.log('[useDynamicAPY] DynamicAPY contract address:', DYNAMIC_APY_ADDRESS);
  if (!DYNAMIC_APY_ADDRESS || (DYNAMIC_APY_ADDRESS as unknown as string) === 'undefined') {
    console.error('[useDynamicAPY] VITE_DYNAMIC_APY_CALCULATOR_ADDRESS not set in .env!');
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DynamicAPYData {
  /** Whether the dynamic APY system is active on-chain */
  isEnabled: boolean;
  /** Current TVL-based multiplier (basis points, e.g. 12000 = 1.2x) */
  multiplierRaw: bigint;
  /** Formatted multiplier (e.g. "1.20x") */
  multiplier: string;
  /** Target TVL set in the contract */
  targetTVL: string;
  targetTVLRaw: bigint;
  /** Min/Max multiplier bounds */
  minMultiplier: string;
  maxMultiplier: string;
  /** Dynamic APY for each lockup period (using current TVL) */
  dynamicRates: DynamicRate[];
  /** APY preview at different TVL levels */
  apyPreview: APYPreviewPoint[] | null;
  /** Treasury health multiplier (0.5x-1.0x conservative adjustment) */
  treasuryHealthMultiplier: number;
  /** Treasury health status */
  treasuryHealthStatus: 'Critical' | 'Warning' | 'Moderate' | 'Healthy';
  /** Treasury health message */
  treasuryHealthMessage: string;
  /** Payout ratio (distributed/received) */
  payoutRatio: number;
  /** Loading state */
  isLoading: boolean;
  /** Whether any data was successfully fetched from the contract */
  hasData: boolean;
}

export interface DynamicRate {
  periodName: string;
  days: number;
  baseAPY: number;
  dynamicAPY: number;
  boost: number; // difference between dynamic and base
}

export interface APYPreviewPoint {
  tvl: string;
  tvlRaw: bigint;
  apy: number;
}

// Base APY rates from contract v6.2 (in basis points, e.g. 960 = 9.6%)
// Updated Mar 2026: Flex=9.6%, 30d=17.2%, 90d=22.7%, 180d=30.3%, 365d=31.9%
const BASE_APY_RATES = [960n, 1720n, 2270n, 3030n, 3190n];
const PERIOD_NAMES = ['Flexible', '30 Days', '90 Days', '180 Days', '365 Days'];
const PERIOD_DAYS = [0, 30, 90, 180, 365];

// TVL levels for preview chart (in wei)
// Contract default target is 1M POL. After this, users get base APY rates.
const PREVIEW_TVL_LEVELS = [
  parseEther('1000'),     // 1K POL
  parseEther('5000'),     // 5K POL
  parseEther('10000'),    // 10K POL
  parseEther('50000'),    // 50K POL
  parseEther('100000'),   // 100K POL
  parseEther('500000'),   // 500K POL
  parseEther('1000000'),  // 1M POL - CONTRACT DEFAULT TARGET
];

// ============================================
// MAIN HOOK
// ============================================

export function useDynamicAPY(currentTVL?: bigint): DynamicAPYData {
  const { chain } = useAccount();
  
  // Treasury Health Monitor - Conservative APY adjustment based on treasury metrics
  const treasuryHealth = useTreasuryHealthMonitor();

  const contractConfig = useMemo(() => ({
    address: DYNAMIC_APY_ADDRESS,
    abi: DynamicAPYCalculatorABI.abi as Abi,
    chainId: chain?.id,
  }), [chain?.id]);

  // Multicall: Fetch all config and state in one RPC call
  const { data: configData, isLoading: loadingConfig, error: configError } = useReadContracts({
    contracts: [
      { ...contractConfig, functionName: 'dynamicAPYEnabled' },
      { ...contractConfig, functionName: 'targetTVL' },
      { ...contractConfig, functionName: 'minAPYMultiplier' },
      { ...contractConfig, functionName: 'maxAPYMultiplier' },
      { ...contractConfig, functionName: 'getCurrentMultiplier', args: [currentTVL || 0n] },
    ],
    query: {
      enabled: !!DYNAMIC_APY_ADDRESS,
      staleTime: 60000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  // Debug: Log DynamicAPY contract responses
  if (configData && !loadingConfig) {
    const fnNames = ['dynamicAPYEnabled', 'targetTVL', 'minAPYMultiplier', 'maxAPYMultiplier', 'getCurrentMultiplier'];
    configData.forEach((result, i) => {
      if (result.status === 'failure') {
        console.error(
          `[useDynamicAPY] ${fnNames[i]} failed:`,
          result.error?.message || result.error || 'unknown error'
        );
      }
    });
  }
  if (configError) {
    console.error('[useDynamicAPY] Config multicall error:', configError.message);
  }

  // Batch calculate dynamic APY for all lockup periods
  const { data: dynamicAPYBatch, isLoading: loadingBatch } = useReadContract({
    ...contractConfig,
    functionName: 'calculateDynamicAPYBatch',
    args: [BASE_APY_RATES, currentTVL || 0n],
    query: {
      enabled: !!DYNAMIC_APY_ADDRESS && !!currentTVL && currentTVL > 0n,
      staleTime: 60000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  // Preview APY at different TVL levels (for the 30-day base APY as reference)
  const { data: previewData, isLoading: loadingPreview } = useReadContract({
    ...contractConfig,
    functionName: 'previewAPYAtTVLs',
    args: [BASE_APY_RATES[1], PREVIEW_TVL_LEVELS], // 30d APY as reference
    query: {
      enabled: !!DYNAMIC_APY_ADDRESS,
      staleTime: 120000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  // Format all data
  const result = useMemo((): DynamicAPYData => {
    const isEnabled = (configData?.[0]?.result as boolean) ?? false;
    const targetTVLRaw = (configData?.[1]?.result as bigint) ?? 0n;
    const minMul = (configData?.[2]?.result as bigint) ?? 0n;
    const maxMul = (configData?.[3]?.result as bigint) ?? 0n;
    const multiplierRaw = (configData?.[4]?.result as bigint) ?? 10000n;

    // Format multiplier (basis points: 10000 = 1.0x)
    const multiplierFormatted = (Number(multiplierRaw) / 10000).toFixed(2) + 'x';
    const minMultiplierFormatted = (Number(minMul) / 10000).toFixed(2) + 'x';
    const maxMultiplierFormatted = (Number(maxMul) / 10000).toFixed(2) + 'x';

    // Dynamic rates per period - Apply treasury health multiplier
    const batchResults = dynamicAPYBatch as bigint[] | undefined;
    const dynamicRates: DynamicRate[] = PERIOD_NAMES.map((name, i) => {
      const baseAPY = Number(BASE_APY_RATES[i]) / 100;
      const dynAPY = batchResults?.[i] ? Number(batchResults[i]) / 100 : baseAPY;
      
      // Apply treasury health adjustment (conservative: 0.5x-1.0x)
      const treasuryAdjustedAPY = dynAPY * treasuryHealth.healthMultiplier;
      
      return {
        periodName: name,
        days: PERIOD_DAYS[i],
        baseAPY,
        dynamicAPY: treasuryAdjustedAPY,
        boost: parseFloat((treasuryAdjustedAPY - baseAPY).toFixed(2)),
      };
    });

    // APY preview chart data
    const previewResults = previewData as bigint[] | undefined;
    const apyPreview: APYPreviewPoint[] | null = previewResults
      ? PREVIEW_TVL_LEVELS.map((tvl, i) => ({
          tvl: formatPOLCompact(tvl),
          tvlRaw: tvl,
          apy: Number(previewResults[i]) / 100,
        }))
      : null;

    // Check if we actually got data from the contract
    const hasConfigData = configData?.some(r => r.status === 'success') ?? false;

    return {
      isEnabled,
      multiplierRaw,
      multiplier: multiplierFormatted,
      targetTVL: formatPOLCompact(targetTVLRaw),
      targetTVLRaw,
      minMultiplier: minMultiplierFormatted,
      maxMultiplier: maxMultiplierFormatted,
      dynamicRates,
      apyPreview,
      treasuryHealthMultiplier: treasuryHealth.healthMultiplier,
      treasuryHealthStatus: treasuryHealth.healthStatus,
      treasuryHealthMessage: treasuryHealth.statusMessage,
      payoutRatio: treasuryHealth.payoutRatio,
      isLoading: loadingConfig || loadingBatch || loadingPreview || treasuryHealth.isLoading,
      hasData: hasConfigData,
    };
  }, [configData, dynamicAPYBatch, previewData, loadingConfig, loadingBatch, loadingPreview, treasuryHealth]);

  // Check if contract address is not configured
  if (!DYNAMIC_APY_ADDRESS || DYNAMIC_APY_ADDRESS === undefined || (DYNAMIC_APY_ADDRESS as unknown as string) === 'undefined') {
    console.warn('[useDynamicAPY] Contract not deployed - returning base rates');
    return {
      isEnabled: false,
      multiplierRaw: 10000n,
      multiplier: '1.00x',
      targetTVL: '0',
      targetTVLRaw: 0n,
      minMultiplier: '1.00x',
      maxMultiplier: '1.00x',
      dynamicRates: [],
      apyPreview: null,
      treasuryHealthMultiplier: 1.0,
      treasuryHealthStatus: 'Warning' as const,
      treasuryHealthMessage: 'Contract not deployed',
      payoutRatio: 0,
      isLoading: false,
      hasData: false,
    };
  }

  return result;
}

// ============================================
// HELPERS
// ============================================

function formatPOLCompact(value: bigint): string {
  if (!value || value === 0n) return '0';
  const num = parseFloat(formatEther(value));
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toFixed(0);
}

export default useDynamicAPY;
