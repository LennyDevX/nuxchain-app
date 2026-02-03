/**
 * usePortfolioAnalysis - Hook to orchestrate portfolio analysis from user deposits
 * Combines deposit data with APY calculations to generate comprehensive portfolio insights
 */

import { useMemo } from 'react';
import { useUserDeposits } from '../staking/useUserDeposits';
import { useUserStaking } from '../staking/useUserStaking';
import { 
  analyzePortfolio, 
  type StakingPosition, 
  type PortfolioAnalysis 
} from '../../utils/ai/portfolioAnalyzer';

// APY rates by lockup duration (in basis points for precision)
const APY_RATES: Record<number, number> = {
  0: 43.80,      // Flexible
  30: 87.60,     // 30 days
  90: 122.64,    // 90 days
  180: 149.28,   // 180 days
  365: 219.00,   // 365 days
};

export interface UsePortfolioAnalysisReturn {
  portfolioAnalysis: PortfolioAnalysis | null;
  positions: StakingPosition[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Get APY rate for a given lockup duration in days
 */
function getAPYForLockup(lockupDays: number): number {
  // Find closest lockup tier
  if (lockupDays === 0) return APY_RATES[0];
  if (lockupDays <= 30) return APY_RATES[30];
  if (lockupDays <= 90) return APY_RATES[90];
  if (lockupDays <= 180) return APY_RATES[180];
  return APY_RATES[365];
}

/**
 * Calculate estimated rewards for a position
 */
function calculateEstimatedRewards(
  amount: bigint,
  lockupDays: number,
  depositTime: bigint
): bigint {
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const timePassed = Number(currentTime - depositTime);
  const daysStaked = timePassed / 86400;
  
  const apy = getAPYForLockup(lockupDays);
  const dailyRate = apy / 365 / 100;
  const estimatedRewards = Number(amount) * dailyRate * daysStaked;
  
  return BigInt(Math.floor(estimatedRewards));
}

/**
 * Calculate current ROI percentage for a position
 */
function calculateCurrentROI(
  lockupDays: number
): number {
  // Use the APY rate for this lockup period
  return getAPYForLockup(lockupDays);
}

/**
 * Hook to analyze user's staking portfolio
 * Transforms deposit data into portfolio analysis with risk metrics and recommendations
 */
export function usePortfolioAnalysis(): UsePortfolioAnalysisReturn {
  const { deposits, isLoading: loadingDeposits, error: depositsError } = useUserDeposits();
  const { isLoading: loadingStaking, error: stakingError } = useUserStaking();

  // Transform deposits into StakingPosition format
  const positions = useMemo((): StakingPosition[] => {
    if (!deposits || deposits.length === 0) return [];

    const transformedPositions = deposits
      .filter(deposit => deposit.isActive)
      .map(deposit => {
        const lockupDays = Number(deposit.lockupDuration) / 86400; // Convert seconds to days
        const estimatedRewards = calculateEstimatedRewards(
          deposit.amount,
          lockupDays,
          deposit.depositTime
        );
        const currentROI = calculateCurrentROI(lockupDays);

        const position = {
          depositId: BigInt(deposit.index),
          amount: deposit.amount,
          lockupDuration: Math.round(lockupDays),
          depositTime: deposit.depositTime,
          unlockTime: deposit.unlockTime,
          isLocked: deposit.isLocked,
          estimatedRewards,
          currentROI,
        } as StakingPosition;
        
        console.log(`[usePortfolioAnalysis] Position ${deposit.index}:`, {
          lockupDurationSeconds: deposit.lockupDuration.toString(),
          lockupDays,
          lockupDaysRounded: Math.round(lockupDays),
          isLocked: deposit.isLocked,
          currentROI: currentROI.toFixed(2) + '%',
          amount: deposit.amount.toString()
        });
        
        return position;
      });
    
    console.log(`[usePortfolioAnalysis] Total positions:`, transformedPositions.length);
    return transformedPositions;
  }, [deposits]);

  // Generate portfolio analysis
  const portfolioAnalysis = useMemo((): PortfolioAnalysis | null => {
    if (positions.length === 0) return null;

    try {
      return analyzePortfolio(positions);
    } catch (err) {
      console.error('Error analyzing portfolio:', err);
      return null;
    }
  }, [positions]);

  const isLoading = loadingDeposits || loadingStaking;
  const error = depositsError || stakingError || null;

  return {
    portfolioAnalysis,
    positions,
    isLoading,
    error,
  };
}
