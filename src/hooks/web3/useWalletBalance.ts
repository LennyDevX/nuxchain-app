/**
 * useWalletBalance - Hook to get wallet balance for AI analysis
 * Returns native token balance (POL) for portfolio recommendations
 */

import { useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

export interface WalletBalanceData {
  // Raw balance in wei
  balanceWei: bigint;
  // Formatted balance as number
  balanceFormatted: number;
  // Balance as string with symbol
  balanceDisplay: string;
  // Token symbol
  symbol: string;
  // Is loading
  isLoading: boolean;
  // Has sufficient balance for minimum stake (5 POL)
  canStake: boolean;
  // Available for staking after gas reserve (keep 0.5 POL for gas)
  availableForStaking: number;
  // Suggested stake amounts based on balance
  suggestedAmounts: {
    conservative: number;  // 25% of available
    moderate: number;      // 50% of available
    aggressive: number;    // 75% of available
  };
}

const MIN_STAKE_AMOUNT = 5; // Minimum 5 POL
const GAS_RESERVE = 0.5;    // Keep 0.5 POL for gas fees
const MAX_STAKE_AMOUNT = 10000; // Maximum per deposit

/**
 * Hook to get wallet balance and staking recommendations
 */
export function useWalletBalance(): WalletBalanceData {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected,
      staleTime: 120000, // 2 minutes
      gcTime: 300000,    // 5 minutes
    }
  });

  return useMemo(() => {
    const balanceWei = balance?.value ?? 0n;
    // In wagmi 3.x, format the balance manually using formatUnits
    const balanceFormatted = balance ? parseFloat(formatUnits(balance.value, balance.decimals)) : 0;
    const symbol = balance?.symbol ?? 'POL';

    // Calculate available for staking (minus gas reserve)
    const availableForStaking = Math.max(0, balanceFormatted - GAS_RESERVE);

    // Check if can stake minimum amount
    const canStake = availableForStaking >= MIN_STAKE_AMOUNT;

    // Calculate suggested stake amounts
    const suggestedAmounts = {
      conservative: Math.min(availableForStaking * 0.25, MAX_STAKE_AMOUNT),
      moderate: Math.min(availableForStaking * 0.50, MAX_STAKE_AMOUNT),
      aggressive: Math.min(availableForStaking * 0.75, MAX_STAKE_AMOUNT),
    };

    return {
      balanceWei,
      balanceFormatted,
      balanceDisplay: `${balanceFormatted.toFixed(4)} ${symbol}`,
      symbol,
      isLoading,
      canStake,
      availableForStaking,
      suggestedAmounts,
    };
  }, [balance, isLoading]);
}

/**
 * Analyze how wallet balance can improve portfolio
 */
export function analyzeBalanceOpportunity(
  availableBalance: number,
  currentPortfolioValue: number,
  diversificationScore: number,
  liquidityRatio: number
): {
  opportunity: 'high' | 'medium' | 'low' | 'none';
  message: string;
  suggestedAction: string;
  potentialImpact: string;
} {
  if (availableBalance < MIN_STAKE_AMOUNT) {
    return {
      opportunity: 'none',
      message: `Insufficient balance. Need at least ${MIN_STAKE_AMOUNT} POL to stake.`,
      suggestedAction: 'Add more POL to your wallet',
      potentialImpact: 'Cannot stake without minimum balance',
    };
  }

  const balanceToPortfolioRatio = currentPortfolioValue > 0
    ? (availableBalance / currentPortfolioValue) * 100
    : 100;

  // High opportunity: Large balance relative to portfolio OR low diversification
  if (balanceToPortfolioRatio > 50 || (diversificationScore < 40 && availableBalance >= 50)) {
    return {
      opportunity: 'high',
      message: `You have ${availableBalance.toFixed(2)} POL available to significantly improve your portfolio.`,
      suggestedAction: diversificationScore < 40
        ? 'Create new positions across different lockup periods'
        : 'Consider adding to underweighted lockup tiers',
      potentialImpact: `Could increase diversification by ${Math.min(30, Math.floor(availableBalance / 10))}+ points`,
    };
  }

  // Medium opportunity: Decent balance that can improve portfolio
  if (balanceToPortfolioRatio > 20 || availableBalance >= 25) {
    return {
      opportunity: 'medium',
      message: `${availableBalance.toFixed(2)} POL available for portfolio optimization.`,
      suggestedAction: liquidityRatio < 20
        ? 'Add flexible positions to improve liquidity'
        : 'Consider longer lockups for better yields',
      potentialImpact: 'Moderate improvement to portfolio balance',
    };
  }

  // Low opportunity: Small balance
  if (availableBalance >= MIN_STAKE_AMOUNT) {
    return {
      opportunity: 'low',
      message: `${availableBalance.toFixed(2)} POL available for a small position.`,
      suggestedAction: 'Add to existing positions or create a new flexible stake',
      potentialImpact: 'Minor portfolio addition',
    };
  }

  return {
    opportunity: 'none',
    message: 'Balance below minimum staking threshold',
    suggestedAction: `Need ${(MIN_STAKE_AMOUNT - availableBalance).toFixed(2)} more POL`,
    potentialImpact: 'Cannot stake',
  };
}

export default useWalletBalance;
