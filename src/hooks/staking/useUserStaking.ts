import { useState, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import SmartStakingABI from '../../abi/SmartStaking.json';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS_V2;

interface DepositData {
  amount: bigint;
  timestamp: bigint;
  lastClaimTime: bigint;
  lockupDuration: bigint;
}

interface UserStakingData {
  totalStaked: string;
  totalStakedBigInt: bigint;
  pendingRewards: string;
  pendingRewardsBigInt: bigint;
  apy: string;
  activePositions: number;
  isLoading: boolean;
  error: string | null;
}

export function useUserStaking(): UserStakingData {
  const { address, isConnected } = useAccount();
  const [error] = useState<string | null>(null);

  const contractConfig = {
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
  };

  // Get total deposit
  const { data: totalDeposit, isLoading: loadingDeposit } = useReadContract({
    ...contractConfig,
    functionName: 'getTotalDeposit',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 30000,
      refetchInterval: 30000
    }
  });

  // Get pending rewards
  const { data: pendingRewards, isLoading: loadingRewards } = useReadContract({
    ...contractConfig,
    functionName: 'calculateRewards',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 15000,
      refetchInterval: 15000
    }
  });

  // Get user deposits to count active positions
  const { data: userDeposits, isLoading: loadingDeposits } = useReadContract({
    ...contractConfig,
    functionName: 'getUserDeposits',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 30000,
      refetchInterval: 30000
    }
  });

  const totalStakedBigInt = (totalDeposit as bigint) || 0n;
  const pendingRewardsBigInt = (pendingRewards as bigint) || 0n;
  const deposits = (userDeposits as DepositData[]) || [];

  // Count active positions (deposits with amount > 0)
  const activePositions = deposits.filter((deposit: DepositData) => 
    deposit && deposit.amount && BigInt(deposit.amount) > 0n
  ).length;

  // Calculate APY (this is a simplified calculation, adjust based on your contract logic)
  const calculateAPY = useCallback(() => {
    if (totalStakedBigInt === 0n || pendingRewardsBigInt === 0n) return '0.00';
    
    // Simple APY calculation: (rewards / staked) * 100
    // You may need to adjust this based on your contract's reward mechanism
    const apy = (Number(formatEther(pendingRewardsBigInt)) / Number(formatEther(totalStakedBigInt))) * 100;
    return apy.toFixed(2);
  }, [totalStakedBigInt, pendingRewardsBigInt]);

  return {
    totalStaked: formatEther(totalStakedBigInt),
    totalStakedBigInt,
    pendingRewards: formatEther(pendingRewardsBigInt),
    pendingRewardsBigInt,
    apy: calculateAPY(),
    activePositions,
    isLoading: loadingDeposit || loadingRewards || loadingDeposits,
    error
  };
}
