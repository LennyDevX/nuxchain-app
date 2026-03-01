/**
 * usePortfolioAnalysis - Hook to orchestrate portfolio analysis from user deposits
 * Combines deposit data with APY calculations to generate comprehensive portfolio insights
 */

import { useMemo } from 'react';
import { useUserDeposits } from '../staking/useUserDeposits';
import { useUserStaking } from '../staking/useUserStaking';
import { useContractConstants } from './useContractConstants';
import { 
  analyzePortfolio, 
  type StakingPosition, 
  type PortfolioAnalysis,
  DEFAULT_APY_BY_LOCKUP,
} from '../../utils/ai/portfolioAnalyzer';

export interface UsePortfolioAnalysisReturn {
  portfolioAnalysis: PortfolioAnalysis | null;
  positions: StakingPosition[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Get APY rate for a given lockup duration in days from contract rates (basis points -> %)
 */
function getAPYForLockup(lockupDays: number, apyLookup: Record<number, number>): number {
  if (lockupDays === 0) return apyLookup[0];
  if (lockupDays <= 30) return apyLookup[30];
  if (lockupDays <= 90) return apyLookup[90];
  if (lockupDays <= 180) return apyLookup[180];
  return apyLookup[365];
}

/**
 * Calculate estimated rewards for a position
 */
function calculateEstimatedRewards(
  amount: bigint,
  lockupDays: number,
  depositTime: bigint,
  apyLookup: Record<number, number>
): bigint {
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const timePassed = Number(currentTime - depositTime);
  const daysStaked = timePassed / 86400;
  
  const apy = getAPYForLockup(lockupDays, apyLookup);
  const dailyRate = apy / 365 / 100;
  const estimatedRewards = Number(amount) * dailyRate * daysStaked;
  
  return BigInt(Math.floor(estimatedRewards));
}

/**
 * Hook to analyze user's staking portfolio
 * Transforms deposit data into portfolio analysis with risk metrics and recommendations
 */
export function usePortfolioAnalysis(): UsePortfolioAnalysisReturn {
  const { deposits, isLoading: loadingDeposits, error: depositsError } = useUserDeposits();
  const { isLoading: loadingStaking, error: stakingError } = useUserStaking();
  const { apyRates } = useContractConstants();

  // Build APY lookup from contract rates (basis points / 100 = %)
  const apyLookup = useMemo((): Record<number, number> => {
    if (!apyRates || apyRates.flexible === 0) return DEFAULT_APY_BY_LOCKUP;
    return {
      0:   apyRates.flexible  / 100,
      30:  apyRates.locked30  / 100,
      90:  apyRates.locked90  / 100,
      180: apyRates.locked180 / 100,
      365: apyRates.locked365 / 100,
    };
  }, [apyRates]);

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
          deposit.depositTime,
          apyLookup
        );
        const currentROI = getAPYForLockup(lockupDays, apyLookup);

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
  }, [deposits, apyLookup]);

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
