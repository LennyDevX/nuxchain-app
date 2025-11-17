import { useAccount, useReadContract } from 'wagmi'
import { memo, useMemo, lazy, Suspense, useEffect } from 'react'
import EnhancedSmartStakingABI from '../abi/SmartStaking/EnhancedSmartStaking.json'
import GlobalBackground from '../ui/gradientBackground'
import LoadingSpinner from '../ui/LoadingSpinner'
import ConnectWallet from '../ui/ConnectWalletAlert'
import { useIsMobile } from '../hooks/mobile'
import { stakingLogger } from '../utils/log/stakingLogger'

// ✅ Add BigInt serialization support for React DevTools
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// ✅ Add BigInt serialization support for React DevTools
if (typeof BigInt.prototype.toJSON === 'undefined') {
  BigInt.prototype.toJSON = function() {
    return this.toString();
  };
}

// Lazy load components for better performance
const StakingForm = lazy(() => import('../components/staking/StakingForm'))
const PoolInfo = lazy(() => import('../components/staking/PoolInfo'))
const StakingStats = lazy(() => import('../components/staking/StakingStats'))
const ContractInfo = lazy(() => import('../components/staking/ContractInfo'))
const StakingInfoCarousel = lazy(() => import('../components/staking/StakingInfoCarousel'))
const SkillsProfile = lazy(() => import('../components/staking/SkillsProfile'))
const StakingRewardsCalculator = lazy(() => import('../components/staking/StakingRewardsCalculator'))

// Interfaces
interface DepositData {
  amount: bigint
  timestamp: bigint
  lastClaimTime: bigint
  lockupDuration: bigint
}

// Contract address from environment variables
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS 

// ✅ Validación de configuración del contrato en tiempo de carga
if (!STAKING_CONTRACT_ADDRESS) {
  console.error('❌ CRITICAL ERROR: VITE_ENHANCED_SMARTSTAKING_ADDRESS no está configurado');
  console.error('Este valor es requerido en variables de entorno para el funcionamiento del Staking');
}

const Staking = memo(() => {
  const { address, isConnected } = useAccount()
  const isMobile = useIsMobile()

  // Memoize contract configuration for better performance
  const contractConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingABI.abi,
  }), [])

  // ✅ Verificar si hay configuración válida del contrato
  const hasValidContractConfig = useMemo(() => {
    const isValid = STAKING_CONTRACT_ADDRESS && 
                    STAKING_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
                    STAKING_CONTRACT_ADDRESS.startsWith('0x');
    if (!isValid) {
      console.warn('⚠️ Staking contract address is not properly configured:', STAKING_CONTRACT_ADDRESS);
    }
    return isValid;
  }, [])

  // Read contract data with optimized queries
  const { data: userDeposits } = useReadContract({
    ...contractConfig,
    functionName: 'getUserDeposits',
    args: [address],
    query: { 
      enabled: !!address,
      staleTime: 60000,
      gcTime: 5 * 60 * 1000,
      refetchInterval: false, // ✅ Disabled
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  })

  const { data: totalPoolBalance } = useReadContract({
    ...contractConfig,
    functionName: 'totalPoolBalance',
    query: {
      staleTime: 120000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes cache
      refetchInterval: false, // ✅ Disabled
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  })

  const { data: uniqueUsersCount } = useReadContract({
    ...contractConfig,
    functionName: 'uniqueUsersCount',
    query: {
      staleTime: 120000,
      gcTime: 10 * 60 * 1000,
      refetchInterval: false, // ✅ Disabled
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  })

  const { data: pendingRewards } = useReadContract({
    ...contractConfig,
    functionName: 'calculateRewards',
    args: [address],
    query: { 
      enabled: !!address,
      staleTime: 30000, // 30 seconds for rewards (faster updates)
      gcTime: 3 * 60 * 1000, // 3 minutes cache
      refetchInterval: false, // ✅ Disabled
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  })

  const { data: totalDeposit } = useReadContract({
    ...contractConfig,
    functionName: 'getTotalDeposit',
    args: [address],
    query: { 
      enabled: !!address,
      staleTime: 60000,
      gcTime: 5 * 60 * 1000,
      refetchInterval: false, // ✅ Disabled
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  })

  const { data: contractVersion } = useReadContract({
    ...contractConfig,
    functionName: 'getContractVersion',
    query: {
      staleTime: 300000, // 5 minutes - rarely changes
      gcTime: 30 * 60 * 1000, // 30 minutes cache
      refetchInterval: false
    }
  })

  const { data: contractBalance } = useReadContract({
    ...contractConfig,
    functionName: 'getContractBalance',
    query: {
      staleTime: 120000,
      gcTime: 10 * 60 * 1000,
      refetchInterval: false, // ✅ Disabled
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  })

  const { data: isPaused } = useReadContract({
    ...contractConfig,
    functionName: 'paused',
    query: {
      staleTime: 120000,
      gcTime: 10 * 60 * 1000,
      refetchInterval: false, // ✅ Disabled
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  })

  // Helper function to safely handle BigInt serialization for logging
  // This prevents "Do not know how to serialize a BigInt" error in React DevTools
  const serializableBigInt = (value: bigint | number | string | undefined): string | number | undefined => {
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  }

  // Memoize processed data to prevent unnecessary re-renders
  const processedData = useMemo(() => {
    // Keep original bigints for component usage
    const data = {
      userDeposits,
      totalPoolBalance: (totalPoolBalance as bigint) || 0n,
      uniqueUsersCount: (uniqueUsersCount as bigint) || 0n,
      pendingRewards: (pendingRewards as bigint) || 0n,
      totalDeposit: (totalDeposit as bigint) || 0n,
      contractVersion: (contractVersion as bigint) || 0n,
      contractBalance: (contractBalance as bigint) || 0n,
      isPaused: (isPaused as boolean) || false
    }
    
    // Prevent React DevTools from trying to serialize BigInt values
    Object.defineProperty(data, 'toJSON', {
      value: function() {
        return {
          totalPoolBalance: serializableBigInt(this.totalPoolBalance),
          uniqueUsersCount: serializableBigInt(this.uniqueUsersCount),
          pendingRewards: serializableBigInt(this.pendingRewards),
          totalDeposit: serializableBigInt(this.totalDeposit),
          contractVersion: serializableBigInt(this.contractVersion),
          contractBalance: serializableBigInt(this.contractBalance),
          isPaused: this.isPaused
        }
      }
    })
    
    return data
  }, [userDeposits, totalPoolBalance, uniqueUsersCount, pendingRewards, totalDeposit, contractVersion, contractBalance, isPaused])

  // Log staking data when it changes
  useEffect(() => {
    if (address && isConnected && processedData.totalDeposit > 0n) {
      stakingLogger.logStaking({
        totalStaked: (processedData.totalDeposit / BigInt(1e18)).toString(),
        pendingRewards: (processedData.pendingRewards / BigInt(1e18)).toString(),
        activePositions: (processedData.userDeposits as DepositData[] | undefined)?.length || 0,
        hasAutoCompound: false // TODO: Get from contract
      });
    }
  }, [address, isConnected, processedData.totalDeposit, processedData.pendingRewards, processedData.userDeposits]);

  // Log pool info
  useEffect(() => {
    if (processedData.totalPoolBalance > 0n) {
      stakingLogger.logPool({
        totalPoolBalance: (processedData.totalPoolBalance / BigInt(1e18)).toString(),
        uniqueUsers: Number(processedData.uniqueUsersCount),
        totalDeposits: (processedData.totalPoolBalance / BigInt(1e18)).toString(),
        isPaused: processedData.isPaused
      });
    }
  }, [processedData.totalPoolBalance, processedData.uniqueUsersCount, processedData.isPaused]);



  if (!isConnected) {
    return <ConnectWallet pageName="Staking" />;
  }

  return (
    <GlobalBackground>
      <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 text-gradient">
            Staking Dashboard
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Earn automatic rewards by staking your POL tokens
          </p>
        </div>


        <Suspense fallback={<LoadingSpinner />}>
          <StakingStats
            totalPoolBalance={processedData.totalPoolBalance}
            uniqueUsersCount={processedData.uniqueUsersCount}
            totalDeposit={processedData.totalDeposit}
            pendingRewards={processedData.pendingRewards}
            contractVersion={processedData.contractVersion}
            contractBalance={processedData.contractBalance}
          />
        </Suspense>

        {/* Contract Configuration Error Alert */}
        {!hasValidContractConfig && (
          <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-yellow-400 font-medium">⚠️ Staking contract is not properly configured. Please contact support.</span>
            </div>
          </div>
        )}

        {/* Contract Paused Alert */}
        {hasValidContractConfig && processedData.isPaused && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-400 font-medium">⚠️ The staking contract is temporarily paused. Deposits cannot be made at this time.</span>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid - Optimized for desktop */}
        <div className={`${
          isMobile ? 'space-y-8' : 'grid grid-cols-1 lg:grid-cols-3 gap-8'
        }`}>
          {/* Left Column - Staking Form (2 cols on desktop) */}
          <div className={`${isMobile ? '' : 'lg:col-span-2'} space-y-8`}>
            <Suspense fallback={<LoadingSpinner />}>
              <StakingForm 
                stakingContractAddress={STAKING_CONTRACT_ADDRESS}
                pendingRewards={processedData.pendingRewards}
                isPaused={processedData.isPaused}
                totalDeposit={processedData.totalDeposit}
              />
            </Suspense>
            
            {/* Staking Rewards Calculator */}
            <Suspense fallback={<LoadingSpinner />}>
              <StakingRewardsCalculator defaultAmount={100} />
            </Suspense>
          </div>

          {/* Right Column - User Info and Pool Info (1 col on desktop) */}
          <div className="space-y-6">
            {isMobile && isConnected && (
              <Suspense fallback={<LoadingSpinner />}>
                <SkillsProfile />
              </Suspense>
            )}
            
            {isMobile ? (
              <Suspense fallback={<LoadingSpinner />}>
                <StakingInfoCarousel 
                  totalPoolBalance={processedData.totalPoolBalance}
                  uniqueUsersCount={processedData.uniqueUsersCount}
                  contractAddress={STAKING_CONTRACT_ADDRESS}
                  isPaused={processedData.isPaused}
                />
              </Suspense>
            ) : (
              <>
                <Suspense fallback={<LoadingSpinner />}>
                  <PoolInfo 
                    totalPoolBalance={processedData.totalPoolBalance}
                    uniqueUsersCount={processedData.uniqueUsersCount}
                  />
                </Suspense>
                <Suspense fallback={<LoadingSpinner />}>
                  <ContractInfo 
                    contractAddress={STAKING_CONTRACT_ADDRESS}
                    isPaused={processedData.isPaused}
                  />
                </Suspense>
                
                {/* NFT Skills Profile - Compact version for desktop */}
                {isConnected && (
                  <Suspense fallback={<LoadingSpinner />}>
                    <SkillsProfile />
                  </Suspense>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recent Transactions - Disabled for future implementation */}
        {/* TODO: Implement transaction history component */}
      </div>
      </div>
    </GlobalBackground>
  )
})

Staking.displayName = 'Staking'

export default Staking