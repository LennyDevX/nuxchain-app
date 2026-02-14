import { useAccount, useReadContracts } from 'wagmi'
import { memo, useMemo, lazy, Suspense, useEffect } from 'react'
import EnhancedSmartStakingABI from '../abi/SmartStaking/EnhancedSmartStaking.json'
import EnhancedSmartStakingViewABI from '../abi/SmartStaking/EnhancedSmartStakingView.json'
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

if (typeof BigInt.prototype.toJSON === 'undefined') {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

// Lazy load components - OPTIMIZED: Removed redundant components
const StakingForm = lazy(() => import('../components/staking/StakingForm'))
const PoolInfo = lazy(() => import('../components/staking/PoolInfo'))
const StakingStats = lazy(() => import('../components/staking/StakingStats'))
const ContractInfo = lazy(() => import('../components/staking/ContractInfo'))
const StakingInfoCarousel = lazy(() => import('../components/staking/StakingInfoCarousel'))

// Analytics components - Only essential ones
const StakingEfficiencyCard = lazy(() => import('../components/staking/StakingEfficiencyCard'))

// Consolidated Rewards Component
const RewardsHub = lazy(() => import('../components/staking/RewardsHub'))

// Phase 1-3: New integrated components
const DynamicAPYIndicator = lazy(() => import('../components/staking/DynamicAPYIndicator'))
const TreasuryHealthCard = lazy(() => import('../components/staking/TreasuryHealthCard'))
const AdvancedUserStats = lazy(() => import('../components/staking/AdvancedUserStats'))

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

  // ✅ Optimized: Use Multicall to fetch all data in a single RPC request
  const { data: stakingData } = useReadContracts({
    contracts: [
      {
        ...contractConfig,
        functionName: 'getUserDeposits',
        args: [address],
      },
      {
        ...contractConfig,
        functionName: 'totalPoolBalance',
      },
      {
        ...contractConfig,
        functionName: 'uniqueUsersCount',
      },
      {
        ...contractConfig,
        functionName: 'calculateRewards',
        args: [address],
      },
      {
        address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`,
        abi: EnhancedSmartStakingViewABI.abi,
        functionName: 'getTotalDeposit',
        args: [address],
      },
      {
        ...contractConfig,
        functionName: 'getContractVersion',
      },
      {
        ...contractConfig,
        functionName: 'paused',
      }
    ],
    query: {
      enabled: !!address,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  })

  // Extract data from multicall result
  const userDeposits = stakingData?.[0]?.result
  const totalPoolBalance = stakingData?.[1]?.result
  const uniqueUsersCount = stakingData?.[2]?.result
  const pendingRewards = stakingData?.[3]?.result
  const totalDeposit = stakingData?.[4]?.result
  const contractVersion = stakingData?.[5]?.result
  const isPaused = stakingData?.[6]?.result

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
      isPaused: (isPaused as boolean) || false
    }

    // Prevent React DevTools from trying to serialize BigInt values
    Object.defineProperty(data, 'toJSON', {
      value: function () {
        return {
          totalPoolBalance: serializableBigInt(this.totalPoolBalance),
          uniqueUsersCount: serializableBigInt(this.uniqueUsersCount),
          pendingRewards: serializableBigInt(this.pendingRewards),
          totalDeposit: serializableBigInt(this.totalDeposit),
          contractVersion: serializableBigInt(this.contractVersion),
          isPaused: this.isPaused
        }
      }
    })

    return data
  }, [userDeposits, totalPoolBalance, uniqueUsersCount, pendingRewards, totalDeposit, contractVersion, isPaused])

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
      <div className="min-h-screen py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ═══════════════════════════════════════════════════════════════
              HEADER - Compact & Clean
          ═══════════════════════════════════════════════════════════════ */}
          <header className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gradient mb-2">
              Smart Staking
            </h1>
            <p className="text-white/60 text-sm lg:text-base">
              Earn automatic rewards by staking your POL tokens
            </p>
          </header>

          {/* ═══════════════════════════════════════════════════════════════
              HERO STATS - Key metrics at a glance
          ═══════════════════════════════════════════════════════════════ */}
          <Suspense fallback={<LoadingSpinner />}>
            <StakingStats
              totalPoolBalance={processedData.totalPoolBalance}
              uniqueUsersCount={processedData.uniqueUsersCount}
              totalDeposit={processedData.totalDeposit}
              pendingRewards={processedData.pendingRewards}
            />
          </Suspense>

          {/* ═══════════════════════════════════════════════════════════════
              ALERTS - Contract status warnings (compact)
          ═══════════════════════════════════════════════════════════════ */}
          {!hasValidContractConfig && (
            <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <span>⚠️</span>
                Staking contract is not properly configured.
              </p>
            </div>
          )}

          {hasValidContractConfig && processedData.isPaused && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <span>⏸️</span>
                Contract is temporarily paused. Deposits are disabled.
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              MAIN LAYOUT - 12-column grid for better control
          ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            {/* ─────────────────────────────────────────────────────────────
                LEFT COLUMN - Main staking interface (8 cols)
            ───────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-8 space-y-6">

              {/* Staking Form - Primary Action Component */}
              <Suspense fallback={<LoadingSpinner />}>
                <StakingForm
                  stakingContractAddress={STAKING_CONTRACT_ADDRESS}
                  pendingRewards={processedData.pendingRewards}
                  isPaused={processedData.isPaused}
                  totalDeposit={processedData.totalDeposit}
                />
              </Suspense>

              {/* Rewards Hub + Staking Efficiency - Side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rewards Hub - Consolidated Projection + Calculator */}
                <Suspense fallback={<LoadingSpinner />}>
                  <RewardsHub currentTVL={processedData.totalPoolBalance} />
                </Suspense>

                {/* Staking Efficiency Card */}
                <Suspense fallback={<LoadingSpinner />}>
                  <StakingEfficiencyCard />
                </Suspense>
              </div>

              {/* Phase 3: Advanced Analytics */}
              <Suspense fallback={<LoadingSpinner />}>
                <AdvancedUserStats />
              </Suspense>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                RIGHT COLUMN - Sidebar info (4 cols)
            ───────────────────────────────────────────────────────────── */}
            <aside className="lg:col-span-4 space-y-6">

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
                  {/* Phase 1: Dynamic APY Indicator - Most important info first */}
                  <Suspense fallback={<LoadingSpinner />}>
                    <DynamicAPYIndicator currentTVL={processedData.totalPoolBalance} />
                  </Suspense>

                  {/* Phase 2: Treasury Health - Transparency elevated */}
                  <Suspense fallback={<LoadingSpinner />}>
                    <TreasuryHealthCard />
                  </Suspense>

                  {/* Pool Info - Contract health & distribution */}
                  <Suspense fallback={<LoadingSpinner />}>
                    <PoolInfo
                      totalPoolBalance={processedData.totalPoolBalance}
                      uniqueUsersCount={processedData.uniqueUsersCount}
                    />
                  </Suspense>

                  {/* Rewards Calculator - Moved to RewardsHub consolidated component */}

                  {/* Contract Info - Compact metadata */}
                  <Suspense fallback={<LoadingSpinner />}>
                    <ContractInfo
                      contractAddress={STAKING_CONTRACT_ADDRESS}
                      isPaused={processedData.isPaused}
                    />
                  </Suspense>
                </>
              )}

            </aside>
          </div>

        </div>
      </div>
    </GlobalBackground>
  )
})

Staking.displayName = 'Staking'

export default Staking