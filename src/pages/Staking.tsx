import { useAccount, useReadContract } from 'wagmi'
import { memo, useMemo, lazy, Suspense } from 'react'
import SmartStakingABI from '../abi/SmartStaking.json'
import GlobalBackground from '../ui/gradientBackground'
import LoadingSpinner from '../ui/LoadingSpinner'
import ConnectWallet from '../ui/ConnectWallet'
import { useIsMobile } from '../hooks/mobile'

// Lazy load components for better performance
const StakingForm = lazy(() => import('../components/staking/StakingForm'))
const UserInfo = lazy(() => import('../components/staking/UserInfo'))
const PoolInfo = lazy(() => import('../components/staking/PoolInfo'))
const StakingBonds = lazy(() => import('../components/staking/StakingBonds'))
const StakingStats = lazy(() => import('../components/staking/StakingStats'))
const ContractInfo = lazy(() => import('../components/staking/ContractInfo'))
const StakingInfoCarousel = lazy(() => import('../components/staking/StakingInfoCarousel'))

// Interfaces
interface DepositData {
  amount: bigint
  timestamp: bigint
  lastClaimTime: bigint
  lockupDuration: bigint
}

interface UserInfoData {
  totalDeposited: bigint
  pendingRewards: bigint
  lastWithdraw: bigint
}

// Contract address from environment variables
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS_V2 

const Staking = memo(() => {
  const { address, isConnected } = useAccount()
  const isMobile = useIsMobile()

  // Memoize contract configuration for better performance
  const contractConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
  }), [STAKING_CONTRACT_ADDRESS])

  // Read contract data with optimized queries
  const { data: userInfo } = useReadContract({
    ...contractConfig,
    functionName: 'getUserInfo',
    args: [address],
    query: { 
      enabled: !!address,
      staleTime: 30000, // 30 seconds
      refetchInterval: isMobile ? 60000 : 30000 // Longer intervals on mobile
    }
  })

  const { data: userDeposits } = useReadContract({
    ...contractConfig,
    functionName: 'getUserDeposits',
    args: [address],
    query: { 
      enabled: !!address,
      staleTime: 30000,
      refetchInterval: isMobile ? 60000 : 30000
    }
  })

  const { data: totalPoolBalance } = useReadContract({
    ...contractConfig,
    functionName: 'totalPoolBalance',
    query: {
      staleTime: 60000, // 1 minute
      refetchInterval: isMobile ? 120000 : 60000
    }
  })

  const { data: uniqueUsersCount } = useReadContract({
    ...contractConfig,
    functionName: 'uniqueUsersCount',
    query: {
      staleTime: 60000,
      refetchInterval: isMobile ? 120000 : 60000
    }
  })

  const { data: pendingRewards } = useReadContract({
    ...contractConfig,
    functionName: 'calculateRewards',
    args: [address],
    query: { 
      enabled: !!address,
      staleTime: 15000, // 15 seconds for rewards
      refetchInterval: isMobile ? 30000 : 15000
    }
  })

  const { data: totalDeposit } = useReadContract({
    ...contractConfig,
    functionName: 'getTotalDeposit',
    args: [address],
    query: { 
      enabled: !!address,
      staleTime: 30000,
      refetchInterval: isMobile ? 60000 : 30000
    }
  })

  const { data: contractVersion } = useReadContract({
    ...contractConfig,
    functionName: 'getContractVersion',
    query: {
      staleTime: 300000, // 5 minutes - rarely changes
      refetchInterval: false
    }
  })

  const { data: contractBalance } = useReadContract({
    ...contractConfig,
    functionName: 'getContractBalance',
    query: {
      staleTime: 60000,
      refetchInterval: isMobile ? 120000 : 60000
    }
  })

  const { data: isPaused } = useReadContract({
    ...contractConfig,
    functionName: 'paused',
    query: {
      staleTime: 60000,
      refetchInterval: isMobile ? 120000 : 60000
    }
  })

  // Memoize processed data to prevent unnecessary re-renders
  const processedData = useMemo(() => ({
    userInfo,
    userDeposits,
    totalPoolBalance: (totalPoolBalance as bigint) || 0n,
    uniqueUsersCount: (uniqueUsersCount as bigint) || 0n,
    pendingRewards: (pendingRewards as bigint) || 0n,
    totalDeposit: (totalDeposit as bigint) || 0n,
    contractVersion: (contractVersion as bigint) || 0n,
    contractBalance: (contractBalance as bigint) || 0n,
    isPaused: (isPaused as boolean) || false
  }), [userInfo, userDeposits, totalPoolBalance, uniqueUsersCount, pendingRewards, totalDeposit, contractVersion, contractBalance, isPaused])



  if (!isConnected) {
    return <ConnectWallet pageName="Staking" />;
  }

  return (
    <GlobalBackground>
      <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Staking <span className="text-gradient">Dashboard</span>
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

        {/* Contract Paused Alert */}
        {processedData.isPaused && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-400 font-medium">⚠️ The staking contract is temporarily paused. Deposits cannot be made at this time.</span>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className={`grid gap-8 ${
          isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {/* Left Column - Staking Form and Bonds */}
          <div className="space-y-8">
            <Suspense fallback={<LoadingSpinner />}>
              <StakingForm 
                stakingContractAddress={STAKING_CONTRACT_ADDRESS}
                pendingRewards={processedData.pendingRewards}
                isPaused={processedData.isPaused}
                totalDeposit={processedData.totalDeposit}
              />
            </Suspense>
            {/* Staking Bonds Section - Load after form on mobile */}
            <Suspense fallback={<LoadingSpinner />}>
              <StakingBonds />
            </Suspense>
          </div>

          {/* Right Column - User Info and Pool Info */}
          <div className="space-y-6">
            {isMobile ? (
              <Suspense fallback={<LoadingSpinner />}>
                <StakingInfoCarousel 
                  userInfo={processedData.userInfo as UserInfoData | undefined}
                  pendingRewards={processedData.pendingRewards}
                  userDeposits={processedData.userDeposits as DepositData[] | undefined}
                  totalDeposit={processedData.totalDeposit}
                  totalPoolBalance={processedData.totalPoolBalance}
                  uniqueUsersCount={processedData.uniqueUsersCount}
                  contractAddress={STAKING_CONTRACT_ADDRESS}
                  isPaused={processedData.isPaused}
                />
              </Suspense>
            ) : (
              <>
                <Suspense fallback={<LoadingSpinner />}>
                  <UserInfo 
                    userInfo={processedData.userInfo as UserInfoData | undefined}
                    pendingRewards={processedData.pendingRewards}
                    userDeposits={processedData.userDeposits as DepositData[] | undefined}
                    totalDeposit={processedData.totalDeposit}
                  />
                </Suspense>
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
              </>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        {/* Assuming isConfirmed is a boolean state or prop, defaulting to false if not defined */}
        {(false) && (
          <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 font-medium">Transaction completed successfully</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </GlobalBackground>
  )
})

Staking.displayName = 'Staking'

export default Staking