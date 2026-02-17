import { useAccount } from 'wagmi'
import { memo, lazy, Suspense, useEffect } from 'react'
import GlobalBackground from '../ui/gradientBackground'
import LoadingSpinner from '../ui/LoadingSpinner'
import ConnectWallet from '../ui/ConnectWalletAlert'
import { stakingLogger } from '../utils/log/stakingLogger'
import { StakingProvider } from '../context/StakingContext'
import { useStakingContext } from '../context/useStakingContext'

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

// Lazy load components
const StakingForm = lazy(() => import('../components/staking/StakingForm'))
const StakingStats = lazy(() => import('../components/staking/StakingStats'))
const ContractInfo = lazy(() => import('../components/staking/ContractInfo'))
const PoolInfo = lazy(() => import('../components/staking/PoolInfo'))
const StakingPoolChart = lazy(() => import('../components/staking/StakingPoolChart'))
const TreasuryPoolChart = lazy(() => import('../components/staking/TreasuryPoolChart'))
const TabNavigation = lazy(() => import('../components/staking/TabNavigation'))
const RewardsHub = lazy(() => import('../components/staking/RewardsHub'))
const DynamicAPYIndicator = lazy(() => import('../components/staking/DynamicAPYIndicator'))
const DepositsManager = lazy(() => import('../components/staking/DepositsManager'))
const SkillsManager = lazy(() => import('../components/staking/SkillsManager'))
const QuestTracker = lazy(() => import('../components/staking/QuestTracker'))
const BadgeGallery = lazy(() => import('../components/staking/BadgeGallery'))
// const ProjectionDebug = lazy(() => import('../components/debug/ProjectionDebug'))

// Contract address from environment variables
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS

const Staking = memo(() => {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return <ConnectWallet pageName="Staking" />;
  }

  return (
    <StakingProvider>
      <StakingDashboard />
    </StakingProvider>
  );
});

/**
 * Inner dashboard component - has access to StakingContext
 */
const StakingDashboard = memo(() => {
  const {
    address,
    isConnected,
    gamification,
    pool,
    user
  } = useStakingContext();

  // Log staking data when it changes
  useEffect(() => {
    if (address && isConnected && (user.totalDeposit > 0n || user.depositCount > 0)) {
      stakingLogger.logStaking({
        totalStaked: (user.totalDeposit / BigInt(1e18)).toString(),
        pendingRewards: (user.pendingRewards / BigInt(1e18)).toString(),
        activePositions: user.depositCount,
        hasAutoCompound: gamification.hasAutoCompound,
      });
    }
  }, [address, isConnected, user.totalDeposit, user.pendingRewards, user.depositCount, gamification.hasAutoCompound]);

  // Log pool info
  useEffect(() => {
    if (pool.totalPoolBalance > 0n) {
      stakingLogger.logPool({
        totalPoolBalance: (pool.totalPoolBalance / BigInt(1e18)).toString(),
        uniqueUsers: Number(pool.uniqueUsersCount),
        totalDeposits: (pool.totalPoolBalance / BigInt(1e18)).toString(),
        isPaused: pool.isPaused
      });
    }
  }, [pool.totalPoolBalance, pool.uniqueUsersCount, pool.isPaused]);

  return (
    <GlobalBackground>
      <div className="min-h-screen py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ═══════════════════════════════════════════════════════════════
              HEADER - Compact & Clean
          ═══════════════════════════════════════════════════════════════ */}
          <header className="mb-8 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gradient mb-2">
              Smart Staking
            </h1>
            <p className="text-white/60 text-sm lg:text-base">
              Earn automatic rewards by staking your POL tokens
            </p>
          </header>

          {/* ═══════════════════════════════════════════════════════════════
              TOP STATS ROW - High-level metrics (4 cards)
          ═══════════════════════════════════════════════════════════════ */}
          <section className="mb-6">
            <Suspense fallback={<div className="h-32 bg-white/5 animate-pulse rounded-2xl" />}>
              <StakingStats
                userStaked={user.totalDeposit}
                pendingRewards={user.pendingRewards}
                uniqueUsersCount={pool.uniqueUsersCount}
                totalPoolBalance={pool.totalPoolBalance}
              />
            </Suspense>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              TAB NAVIGATION SYSTEM - Overview / My Deposit / Skills / Active Quest
          ═══════════════════════════════════════════════════════════════ */}
          <Suspense fallback={<div className="h-64 bg-white/5 animate-pulse rounded-2xl" />}>
            <TabNavigation
              tabs={[
                {
                  id: 'overview',
                  label: 'Overview',
                  icon: '🏠',
                  content: (
                    <div className="space-y-6 py-6">
                      {/* ═══════ CHARTS SECTION - 3 columns grid ═══════ */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Staking Pool Chart */}
                        <Suspense fallback={<LoadingSpinner />}>
                          <StakingPoolChart />
                        </Suspense>

                        {/* Pool Info - Center */}
                        <Suspense fallback={<LoadingSpinner />}>
                          <PoolInfo
                            totalPoolBalance={pool.totalPoolBalance}
                            uniqueUsersCount={pool.uniqueUsersCount}
                            poolContractBalance={pool.totalPoolBalance}
                          />
                        </Suspense>

                        {/* Treasury Pool Chart */}
                        <Suspense fallback={<LoadingSpinner />}>
                          <TreasuryPoolChart />
                        </Suspense>
                      </div>

                      {/* ═══════ STAKING FORM ═══════ */}
                      <Suspense fallback={<LoadingSpinner />}>
                        <StakingForm
                          stakingContractAddress={STAKING_CONTRACT_ADDRESS}
                          pendingRewards={user.pendingRewards}
                          isPaused={pool.isPaused}
                          userStaked={user.totalDeposit}
                        />
                      </Suspense>

                      {/* ═══════ REWARDS HUB ═══════ */}
                      <Suspense fallback={<LoadingSpinner />}>
                        <RewardsHub currentTVL={pool.totalPoolBalance} />
                      </Suspense>

                      {/* ═══════ DEBUG PANEL (COMMENTED OUT) ═══════
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProjectionDebug />
                      </Suspense>
                      */}
                    </div>
                  )
                },
                {
                  id: 'mydeposit',
                  label: 'My Deposit',
                  icon: '💰',
                  content: (
                    <div className="py-6">
                      <Suspense fallback={<LoadingSpinner />}>
                        <DepositsManager />
                      </Suspense>
                    </div>
                  )
                },
                {
                  id: 'skills',
                  label: 'Skills',
                  icon: '⚡',
                  content: (
                    <div className="py-6">
                      <Suspense fallback={<LoadingSpinner />}>
                        <SkillsManager />
                      </Suspense>
                    </div>
                  )
                },
                {
                  id: 'activequest',
                  label: 'Active Quest',
                  icon: '🎯',
                  content: (
                    <div className="py-6">
                      <Suspense fallback={<LoadingSpinner />}>
                        <QuestTracker />
                      </Suspense>
                    </div>
                  )
                }
              ]}
              defaultTab="overview"
            />
          </Suspense>

          {/* ═══════════════════════════════════════════════════════════════
              FOOTER SECTION - Contract Info / Badge Gallery / Dynamic APY
          ═══════════════════════════════════════════════════════════════ */}
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Suspense fallback={<LoadingSpinner />}>
              <ContractInfo
                contractAddress={STAKING_CONTRACT_ADDRESS as string}
                isPaused={pool.isPaused}
              />
            </Suspense>

            <Suspense fallback={<LoadingSpinner />}>
              <BadgeGallery 
                badges={[]} 
                badgeCount={gamification.badgeCount} 
              />
            </Suspense>

            <Suspense fallback={<LoadingSpinner />}>
              <DynamicAPYIndicator currentTVL={pool.totalPoolBalance} />
            </Suspense>
          </section>

        </div>
      </div>
    </GlobalBackground>
  )
})

Staking.displayName = 'Staking'
StakingDashboard.displayName = 'StakingDashboard'

export default Staking