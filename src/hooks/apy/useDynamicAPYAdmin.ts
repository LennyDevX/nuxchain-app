/**
 * useDynamicAPYAdmin - Hook for DynamicAPYCalculator contract admin functions
 * Provides write access to administrative functions for the contract owner
 */

import { useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import type { Abi } from 'viem';
import { DynamicAPYCalculatorABI } from '../../lib/export/abis/legacy';

const DYNAMIC_APY_ADDRESS = import.meta.env.VITE_DYNAMIC_APY_CALCULATOR_ADDRESS as `0x${string}`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DynamicAPYAdminReturn {
  // Admin functions
  setTargetTVL: (newTargetTVL: string) => void;
  setAPYMultiplierBounds: (minMultiplier: number, maxMultiplier: number) => void;
  setDynamicAPYEnabled: (enabled: boolean) => void;
  setTreasuryManager: (treasuryManagerAddress: string) => void;
  pauseContract: () => void;
  unpauseContract: () => void;
  
  // Read functions
  currentTargetTVL: string;
  currentMinMultiplier: number;
  currentMaxMultiplier: number;
  isDynamicAPYEnabled: boolean;
  treasuryManagerAddress: string;
  contractPaused: boolean;
  
  // Transaction state
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  txHash: `0x${string}` | undefined;
  error: Error | null;
  
  // Loading states
  isLoading: boolean;
  refetchAll: () => Promise<void>;
}

// ============================================
// MAIN HOOK
// ============================================

export function useDynamicAPYAdmin(): DynamicAPYAdminReturn {
  const { chain } = useAccount();

  // Read contract data
  const { data: targetTVLData, refetch: refetchTargetTVL } = useReadContract({
    address: DYNAMIC_APY_ADDRESS,
    abi: DynamicAPYCalculatorABI.abi as Abi,
    functionName: 'targetTVL',
    chainId: chain?.id,
    query: { enabled: !!DYNAMIC_APY_ADDRESS }
  });

  const { data: minMultiplierData, refetch: refetchMinMultiplier } = useReadContract({
    address: DYNAMIC_APY_ADDRESS,
    abi: DynamicAPYCalculatorABI.abi as Abi,
    functionName: 'minAPYMultiplier',
    chainId: chain?.id,
    query: { enabled: !!DYNAMIC_APY_ADDRESS }
  });

  const { data: maxMultiplierData, refetch: refetchMaxMultiplier } = useReadContract({
    address: DYNAMIC_APY_ADDRESS,
    abi: DynamicAPYCalculatorABI.abi as Abi,
    functionName: 'maxAPYMultiplier',
    chainId: chain?.id,
    query: { enabled: !!DYNAMIC_APY_ADDRESS }
  });

  const { data: dynamicAPYEnabledData, refetch: refetchDynamicAPYEnabled } = useReadContract({
    address: DYNAMIC_APY_ADDRESS,
    abi: DynamicAPYCalculatorABI.abi as Abi,
    functionName: 'dynamicAPYEnabled',
    chainId: chain?.id,
    query: { enabled: !!DYNAMIC_APY_ADDRESS }
  });

  const { data: treasuryManagerData, refetch: refetchTreasuryManager } = useReadContract({
    address: DYNAMIC_APY_ADDRESS,
    abi: DynamicAPYCalculatorABI.abi as Abi,
    functionName: 'treasuryManager',
    chainId: chain?.id,
    query: { enabled: !!DYNAMIC_APY_ADDRESS }
  });

  const { data: pausedData, refetch: refetchPaused } = useReadContract({
    address: DYNAMIC_APY_ADDRESS,
    abi: DynamicAPYCalculatorABI.abi as Abi,
    functionName: 'paused',
    chainId: chain?.id,
    query: { enabled: !!DYNAMIC_APY_ADDRESS }
  });

  // Write contract setup
  const { 
    writeContract, 
    data: txHash, 
    isPending, 
    error 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ hash: txHash });

  // ============================================
  // ADMIN FUNCTIONS
  // ============================================

  const setTargetTVL = useCallback((newTargetTVL: string) => {
    const targetInWei = parseEther(newTargetTVL);
    writeContract({
      address: DYNAMIC_APY_ADDRESS,
      abi: DynamicAPYCalculatorABI.abi as Abi,
      functionName: 'setTargetTVL',
      args: [targetInWei],
    });
  }, [writeContract]);

  const setAPYMultiplierBounds = useCallback((minMultiplier: number, maxMultiplier: number) => {
    // Convert percentage to basis points (e.g., 30% = 3000)
    const minBps = Math.round(minMultiplier * 100);
    const maxBps = Math.round(maxMultiplier * 100);
    
    writeContract({
      address: DYNAMIC_APY_ADDRESS,
      abi: DynamicAPYCalculatorABI.abi as Abi,
      functionName: 'setAPYMultiplierBounds',
      args: [BigInt(minBps), BigInt(maxBps)],
    });
  }, [writeContract]);

  const setDynamicAPYEnabled = useCallback((enabled: boolean) => {
    writeContract({
      address: DYNAMIC_APY_ADDRESS,
      abi: DynamicAPYCalculatorABI.abi as Abi,
      functionName: 'setDynamicAPYEnabled',
      args: [enabled],
    });
  }, [writeContract]);

  const setTreasuryManager = useCallback((treasuryManagerAddress: string) => {
    writeContract({
      address: DYNAMIC_APY_ADDRESS,
      abi: DynamicAPYCalculatorABI.abi as Abi,
      functionName: 'setTreasuryManager',
      args: [treasuryManagerAddress as `0x${string}`],
    });
  }, [writeContract]);

  const pauseContract = useCallback(() => {
    writeContract({
      address: DYNAMIC_APY_ADDRESS,
      abi: DynamicAPYCalculatorABI.abi as Abi,
      functionName: 'pause',
      args: [],
    });
  }, [writeContract]);

  const unpauseContract = useCallback(() => {
    writeContract({
      address: DYNAMIC_APY_ADDRESS,
      abi: DynamicAPYCalculatorABI.abi as Abi,
      functionName: 'unpause',
      args: [],
    });
  }, [writeContract]);

  // Refetch all data
  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchTargetTVL(),
      refetchMinMultiplier(),
      refetchMaxMultiplier(),
      refetchDynamicAPYEnabled(),
      refetchTreasuryManager(),
      refetchPaused(),
    ]);
  }, [refetchTargetTVL, refetchMinMultiplier, refetchMaxMultiplier, refetchDynamicAPYEnabled, refetchTreasuryManager, refetchPaused]);

  // ============================================
  // FORMATTED DATA
  // ============================================

  const currentTargetTVL = targetTVLData ? formatEther(targetTVLData as bigint) : '0';
  const currentMinMultiplier = minMultiplierData ? Number(minMultiplierData as bigint) / 100 : 30;
  const currentMaxMultiplier = maxMultiplierData ? Number(maxMultiplierData as bigint) / 100 : 100;
  const isDynamicAPYEnabled = dynamicAPYEnabledData as boolean ?? true;
  const treasuryManagerAddress = (treasuryManagerData as string) || '';
  const contractPaused = pausedData as boolean ?? false;

  return {
    // Admin functions
    setTargetTVL,
    setAPYMultiplierBounds,
    setDynamicAPYEnabled,
    setTreasuryManager,
    pauseContract,
    unpauseContract,
    
    // Read data
    currentTargetTVL,
    currentMinMultiplier,
    currentMaxMultiplier,
    isDynamicAPYEnabled,
    treasuryManagerAddress,
    contractPaused,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    txHash,
    error,
    
    // Loading
    isLoading: isConfirming || isPending,
    refetchAll,
  };
}

export default useDynamicAPYAdmin;
