import { useAccount } from 'wagmi'
import { memo, lazy, Suspense, useEffect, useState } from 'react'
import { isMaintenanceMode } from '../config/maintenance'
import StakingMaintenance from './StakingMaintenance'
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
const PoolCarousel = lazy(() => import('../components/staking/PoolCarousel'))
const TabNavigation = lazy(() => import('../components/staking/TabNavigation'))
const RewardsHub = lazy(() => import('../components/staking/RewardsHub'))
const DynamicAPYIndicator = lazy(() => import('../components/staking/DynamicAPYIndicator'))
const DepositsManager = lazy(() => import('../components/staking/DepositsManager'))
const SkillsManager = lazy(() => import('../components/staking/SkillsManager'))
const QuestTracker = lazy(() => import('../components/staking/QuestTracker'))
const BadgeGallery = lazy(() => import('../components/staking/BadgeGallery'))
// v6.2.0 components
const CircuitBreakerBanner = lazy(() => import('../components/staking/CircuitBreakerBanner'))
const ExpiringDepositsAlert = lazy(() => import('../components/staking/ExpiringDepositsAlert'))
const ReferralPanel = lazy(() => import('../components/staking/ReferralPanel'))
// const ProjectionDebug = lazy(() => import('../components/debug/ProjectionDebug'))

// Contract address from environment variables
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS

// ─── Mobile Accordion Footer ────────────────────────────────────────────────
function FooterAccordion({
  poolBalance,
  badgeCount,
  isPaused,
}: {
  poolBalance: bigint;
  badgeCount: number;
  isPaused: boolean;
}) {
  const [open, setOpen] = useState<string | null>('apy');

  const panels = [
    {
      id: 'apy',
      label: '📈 APY Indicator',
      content: (
        <Suspense fallback={<LoadingSpinner />}>
          <DynamicAPYIndicator currentTVL={poolBalance} />
        </Suspense>
      ),
    },
    {
      id: 'badges',
      label: '🏆 Badge Gallery',
      content: (
        <Suspense fallback={<LoadingSpinner />}>
          <BadgeGallery badges={[]} badgeCount={badgeCount} />
        </Suspense>
      ),
    },
    {
      id: 'contract',
      label: '📄 Contract Info',
      content: (
        <Suspense fallback={<LoadingSpinner />}>
          <ContractInfo
            contractAddress={STAKING_CONTRACT_ADDRESS as string}
            isPaused={isPaused}
          />
        </Suspense>
      ),
    },
  ];

  return (
    <div className="lg:hidden mt-6 space-y-2">
      {panels.map((panel) => (
        <div
          key={panel.id}
          className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === panel.id ? null : panel.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="jersey-15-regular text-white/80 text-base">{panel.label}</span>
            <span
              className={`text-white/40 transition-transform duration-200 ${
                open === panel.id ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>
          {open === panel.id && (
            <div className="px-4 pb-4">{panel.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

const Staking = memo(() => {
  const { isConnected } = useAccount()

  // Check maintenance mode
  if (isMaintenanceMode('staking')) {
    return <StakingMaintenance />;
  }

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
    <>
      <div className="min-h-screen py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ═══════════════════════════════════════════════════════════════
              HEADER - Compact & Clean
          ═══════════════════════════════════════════════════════════════ */}
          <header className="mb-4 lg:mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="jersey-15-regular text-3xl lg:text-5xl font-bold text-gradient">
                Smart Staking
              </h1>
             
            </div>
            <p className="jersey-20-regular text-white/60 text-base lg:text-lg">
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
              CIRCUIT BREAKER BANNER - v6.2.0
          ═══════════════════════════════════════════════════════════════ */}
          <Suspense fallback={null}>
            <CircuitBreakerBanner />
          </Suspense>

          {/* ═══════════════════════════════════════════════════════════════
              TAB NAVIGATION SYSTEM - Overview / My Deposit / Skills / Active Quest / Referrals
          ═══════════════════════════════════════════════════════════════ */}
          <Suspense fallback={<div className="h-64 bg-white/5 animate-pulse rounded-2xl" />}>
            <TabNavigation
              tabs={[
                {
                  id: 'overview',
                  label: 'Overview',
                  icon: '🏠',
                  content: (
                    <div className="space-y-4 py-3 lg:py-6">
                      {/* ═══════ EXPIRING DEPOSITS ALERT v6.2.0 ═══════ */}
                      <Suspense fallback={null}>
                        <ExpiringDepositsAlert />
                      </Suspense>

                      {/* ═══════ STAKING FORM - AHORA ARRIBA ═══════ */}
                      <Suspense fallback={<LoadingSpinner />}>
                        <StakingForm
                          stakingContractAddress={STAKING_CONTRACT_ADDRESS}
                          pendingRewards={user.pendingRewards}
                          isPaused={pool.isPaused}
                          userStaked={user.totalDeposit}
                        />
                      </Suspense>

                      {/* ═══════ CHARTS SECTION - Mobile: Carousel, Desktop: 3 columns grid ═══════ */}
                      
                      {/* Mobile Carousel - Only visible on mobile */}
                      <div className="lg:hidden">
                        <Suspense fallback={<LoadingSpinner />}>
                          <PoolCarousel />
                        </Suspense>
                      </div>
                      
                      {/* Desktop Grid - Only visible on desktop (lg+) */}
                      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
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
                  id: 'referrals',
                  label: 'Referrals',
                  icon: '🔗',
                  content: (
                    <div className="py-6">
                      <Suspense fallback={<LoadingSpinner />}>
                        <ReferralPanel />
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
              Mobile: collapsible accordion | Desktop: 3-col grid
          ═══════════════════════════════════════════════════════════════ */}
          {/* Desktop grid */}
          <section className="hidden lg:grid lg:grid-cols-3 gap-6 mt-8">
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

          {/* Mobile accordion */}
          <FooterAccordion
            poolBalance={pool.totalPoolBalance}
            badgeCount={gamification.badgeCount}
            isPaused={pool.isPaused}
          />

        </div>
      </div>
    </>
  )
})

Staking.displayName = 'Staking'
StakingDashboard.displayName = 'StakingDashboard'

export default Staking