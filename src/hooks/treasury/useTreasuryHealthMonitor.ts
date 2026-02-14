import { useMemo } from 'react';
import { useTreasuryStats } from './useTreasuryStats';
import { formatEther } from 'viem';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TreasuryHealthData {
  /** Health-adjusted APY multiplier (0.5x to 1.0x conservative range) */
  healthMultiplier: number;
  /** Formatted multiplier string (e.g., "0.85x") */
  multiplierFormatted: string;
  /** Overall health status */
  healthStatus: 'Critical' | 'Warning' | 'Moderate' | 'Healthy';
  /** Payout ratio (totalDistributed / totalReceived) */
  payoutRatio: number;
  /** Whether payout ratio exceeds safe threshold (80%) */
  payoutRatioExceeded: boolean;
  /** Treasury balance in POL (numeric) */
  treasuryBalance: number;
  /** Whether treasury balance is below critical threshold (10K POL) */
  balanceCritical: boolean;
  /** Human-readable status message */
  statusMessage: string;
  /** Recommended action for protocol sustainability */
  recommendation: string | null;
  /** Loading state */
  isLoading: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

/** Critical treasury balance threshold (10K POL) */
const CRITICAL_BALANCE_THRESHOLD = 10000;

/** Warning treasury balance threshold (50K POL) */
const WARNING_BALANCE_THRESHOLD = 50000;

/** Safe payout ratio maximum (80% of income should cover payouts) */
const SAFE_PAYOUT_RATIO = 0.80;

/** Critical payout ratio (90%+ means deficit approaching) */
const CRITICAL_PAYOUT_RATIO = 0.90;

// ============================================
// MAIN HOOK
// ============================================

/**
 * Treasury Health Monitor
 * 
 * Calculates conservative APY multiplier based on treasury health metrics.
 * Does NOT modify contracts - works entirely on client-side display adjustment.
 * 
 * Philosophy: Conservative approach prioritizes protocol sustainability.
 * Early users get better rates (via TVL-based dynamic APY), but treasury
 * health can reduce APY further if reserves are low or payout ratio is high.
 * 
 * Multiplier Logic:
 * - Healthy treasury (>50K POL, payout<80%): 1.0x (no reduction)
 * - Moderate treasury (10-50K POL, payout 80-90%): 0.85x (15% reduction)
 * - Warning treasury (<10K POL OR payout>90%): 0.70x (30% reduction)
 * - Critical treasury (<5K POL AND payout>95%): 0.50x (50% reduction)
 */
export function useTreasuryHealthMonitor(): TreasuryHealthData {
  const { stats, reserve } = useTreasuryStats();

  const result = useMemo((): TreasuryHealthData => {
    // Default healthy state while loading
    if (!stats || !reserve) {
      return {
        healthMultiplier: 1.0,
        multiplierFormatted: '1.00x',
        healthStatus: 'Healthy',
        payoutRatio: 0,
        payoutRatioExceeded: false,
        treasuryBalance: 0,
        balanceCritical: false,
        statusMessage: 'Loading treasury data...',
        recommendation: null,
        isLoading: true,
      };
    }

    // Calculate metrics
    const treasuryBalance = parseFloat(formatEther(stats.currentBalanceRaw));
    const totalReceived = parseFloat(formatEther(stats.totalReceivedRaw));
    const totalDistributed = parseFloat(formatEther(stats.totalDistributedRaw));
    
    // Payout ratio: what % of income has been paid out
    const payoutRatio = totalReceived > 0 ? totalDistributed / totalReceived : 0;
    
    // Health checks
    const balanceCritical = treasuryBalance < CRITICAL_BALANCE_THRESHOLD;
    const balanceWarning = treasuryBalance < WARNING_BALANCE_THRESHOLD;
    const payoutRatioExceeded = payoutRatio > SAFE_PAYOUT_RATIO;
    const payoutRatioCritical = payoutRatio > CRITICAL_PAYOUT_RATIO;

    // Reserve health contributes to overall assessment
    const reserveCritical = reserve.healthLevel === 'Critical' || reserve.healthLevel === 'Low';

    // Calculate health multiplier (conservative approach)
    let healthMultiplier = 1.0;
    let healthStatus: 'Critical' | 'Warning' | 'Moderate' | 'Healthy' = 'Healthy';
    let statusMessage = '';
    let recommendation: string | null = null;

    // CRITICAL: Severe treasury issues
    if ((treasuryBalance < 5000 && payoutRatioCritical) || (balanceCritical && reserveCritical)) {
      healthMultiplier = 0.50; // 50% reduction
      healthStatus = 'Critical';
      statusMessage = '⚠️ Treasury in critical state. APY reduced 50% to preserve protocol.';
      recommendation = 'Immediate action required: Reduce base APY or increase treasury funding.';
    }
    // WARNING: Treasury approaching critical levels
    else if (balanceCritical || payoutRatioCritical || (balanceWarning && payoutRatioExceeded)) {
      healthMultiplier = 0.70; // 30% reduction
      healthStatus = 'Warning';
      statusMessage = '⚠️ Treasury health warning. APY reduced 30% for sustainability.';
      recommendation = payoutRatioCritical 
        ? 'Payout ratio exceeds 90%. Consider reducing APY or boosting treasury income.'
        : 'Treasury balance below 10K POL. Monitor closely.';
    }
    // MODERATE: Treasury showing stress signals
    else if (balanceWarning || payoutRatioExceeded || reserveCritical) {
      healthMultiplier = 0.85; // 15% reduction
      healthStatus = 'Moderate';
      statusMessage = 'Treasury health moderate. APY slightly reduced (15%) as precaution.';
      recommendation = payoutRatioExceeded
        ? 'Payout ratio above 80%. Watch for increasing deficit trends.'
        : 'Treasury reserves moderate. Continue monitoring.';
    }
    // HEALTHY: All metrics within safe bounds
    else {
      healthMultiplier = 1.0; // No reduction
      healthStatus = 'Healthy';
      statusMessage = '✅ Treasury healthy. Full APY rates available.';
      recommendation = null;
    }

    return {
      healthMultiplier,
      multiplierFormatted: `${healthMultiplier.toFixed(2)}x`,
      healthStatus,
      payoutRatio,
      payoutRatioExceeded,
      treasuryBalance,
      balanceCritical,
      statusMessage,
      recommendation,
      isLoading: false,
    };
  }, [stats, reserve]);

  return result;
}

export default useTreasuryHealthMonitor;
