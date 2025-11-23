/**
 * useUserDeposits - Hook to fetch individual user deposits from EnhancedSmartStaking
 * Returns array of deposit details including amount, timestamps, and lockup duration
 */

import { useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import type { Abi } from 'viem';
import EnhancedSmartStakingCoreABI from '../../abi/SmartStaking/EnhancedSmartStaking.json';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS;

export interface UserDeposit {
  index: number;
  amount: bigint;
  depositTime: bigint;
  lockupDuration: bigint;
  lastClaimTime: bigint;
  isActive: boolean;
  unlockTime: bigint;
  isLocked: boolean;
}

export interface UseUserDepositsReturn {
  deposits: UserDeposit[];
  totalDeposits: number;
  activeDeposits: number;
  lockedDeposits: number;
  flexibleDeposits: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get all individual deposits for a user
 * Uses getUserInfo to get deposit count, then fetches each deposit individually
 */
export function useUserDeposits(): UseUserDepositsReturn {
  const { address, isConnected } = useAccount();

  // Memoize contract config
  const contractConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingCoreABI.abi as Abi,
  }), []);

  // Get user info to know how many deposits exist
  const { data: userInfo, isLoading: loadingUserInfo, error: userInfoError } = useReadContract({
    ...contractConfig,
    functionName: 'getUserInfo',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 60000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false,
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  });

  // Extract deposit count from userInfo tuple: [totalDeposited, totalRewards, depositCount, lastDepositTime]
  const depositCount = useMemo(() => {
    if (!userInfo || !Array.isArray(userInfo)) return 0;
    return Number(userInfo[2] || 0n);
  }, [userInfo]);

  // Generate array of deposit indices to fetch
  const depositIndices = useMemo(() => {
    if (depositCount === 0) return [];
    return Array.from({ length: depositCount }, (_, i) => i);
  }, [depositCount]);

  // Fetch all deposits in parallel using useReadContracts
  const depositContracts = useMemo(() => {
    if (depositIndices.length === 0 || !address) return [];
    
    return depositIndices.map(index => ({
      ...contractConfig,
      functionName: 'getUserDeposit' as const,
      args: [address, BigInt(index)],
    }));
  }, [depositIndices, address, contractConfig]);

  const { data: depositsData, isLoading: loadingDeposits, error: depositsError } = useReadContracts({
    contracts: depositContracts,
    query: {
      enabled: depositContracts.length > 0 && !!address && isConnected,
      staleTime: 60000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false,
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  });

  // Parse deposits data
  const deposits = useMemo((): UserDeposit[] => {
    if (!depositsData || depositsData.length === 0) return [];
    
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    
    const parsedDeposits = depositsData
      .map((result, index) => {
        if (result.status !== 'success' || !result.result) return null;
        
        // Order from Solidity struct Deposit:
        // uint128 amount, uint64 timestamp, uint64 lastClaimTime, uint64 lockupDuration
        const data = result.result as [bigint, bigint, bigint, bigint];
        const amount = data[0];              // uint128 amount
        const depositTime = data[1];         // uint64 timestamp (depositTime)
        const lastClaimTime = data[2];       // uint64 lastClaimTime
        const lockupDuration = data[3];      // uint64 lockupDuration (in seconds)
        
        // Calculate unlock time
        const unlockTime = depositTime + lockupDuration;
        const isLocked = currentTime < unlockTime;
        const isActive = amount > 0n;
        
        console.log(`[useUserDeposits] Deposit ${index}:`, {
          amount: amount.toString(),
          depositTime: depositTime.toString(),
          lastClaimTime: lastClaimTime.toString(),
          lockupDuration: lockupDuration.toString(),
          lockupDays: Number(lockupDuration) / 86400,
          unlockTime: unlockTime.toString(),
          isLocked,
          isActive
        });
        
        return {
          index,
          amount,
          depositTime,
          lockupDuration,
          lastClaimTime,
          isActive,
          unlockTime,
          isLocked,
        } as UserDeposit;
      })
      .filter((deposit): deposit is UserDeposit => deposit !== null);
    
    console.log(`[useUserDeposits] Total active deposits:`, parsedDeposits.filter(d => d.isActive).length);
    console.log(`[useUserDeposits] Total locked deposits:`, parsedDeposits.filter(d => d.isActive && d.isLocked).length);
    console.log(`[useUserDeposits] Total flexible deposits:`, parsedDeposits.filter(d => d.isActive && !d.isLocked).length);
    
    return parsedDeposits;
  }, [depositsData]);

  // Calculate statistics
  const activeDeposits = useMemo(() => {
    return deposits.filter(d => d.isActive).length;
  }, [deposits]);

  const lockedDeposits = useMemo(() => {
    return deposits.filter(d => d.isActive && d.isLocked).length;
  }, [deposits]);

  const flexibleDeposits = useMemo(() => {
    return deposits.filter(d => d.isActive && !d.isLocked).length;
  }, [deposits]);

  const isLoading = loadingUserInfo || loadingDeposits;
  const error = userInfoError?.message || depositsError?.message || null;

  return {
    deposits,
    totalDeposits: depositCount,
    activeDeposits,
    lockedDeposits,
    flexibleDeposits,
    isLoading,
    error,
  };
}
