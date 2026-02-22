import { lazy, Suspense } from 'react'
import HeroSection from '../components/home/HeroSection'
import Footer from '../components/layout/footer'
import AnnouncementModal from '../components/home/AnnouncementModal'
import { useLazyRender } from '../hooks/performance/useLazyRender'
import { useIsMobile } from '../hooks/mobile/useIsMobile'
import { HeroSkeletonLoader } from '../components/ui/SkeletonLoader'

// Lazy load all sections
const NFTSection = lazy(() => import('../components/home/NFTSection'))
const RewardsHubSection = lazy(() => import('../components/home/RewardsHubSection'))
const CrossChainSection = lazy(() => import('../components/home/CrossChainSection'))
const NuxTokenSection = lazy(() => import('../components/home/NuxTokenSection'))
const StakingSection = lazy(() => import('../components/home/StakingSection'))
const AISection = lazy(() => import('../components/home/AISection'))
const TokenizationSection = lazy(() => import('../components/home/TokenizationSection'))
const AirdropsInfo = lazy(() => import('../components/home/AirdropsInfo'))
const BenefitsSection = lazy(() => import('../components/home/BenefitsSection'))

const SectionLoader = () => (
  <div className="w-full py-20 px-4">
    <div className="max-w-7xl mx-auto">
      <HeroSkeletonLoader />
    </div>
  </div>
)

const LazySection = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile()
  const { ref, isVisible } = useLazyRender({ rootMargin: isMobile ? '50px 0px' : '100px 0px', isMobile })
  return <div ref={ref}>{isVisible ? children : <SectionLoader />}</div>
}

function Home() {
  return (
    <div className="min-h-screen">
      <AnnouncementModal />
      <HeroSection />

      {/* 1. NFT Collection — infinite avatar scroll */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <NFTSection />
        </Suspense>
      </LazySection>

      {/* 2. NUX Rewards Hub */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <RewardsHubSection />
        </Suspense>
      </LazySection>

      {/* 3. Cross-Chain Architecture */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <CrossChainSection />
        </Suspense>
      </LazySection>

      {/* 4. NUX Token */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <NuxTokenSection />
        </Suspense>
      </LazySection>

      {/* 5. Staking */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <StakingSection />
        </Suspense>
      </LazySection>

      {/* 6. AI */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <AISection />
        </Suspense>
      </LazySection>

      {/* 7. Tokenization / Create NFT */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <TokenizationSection />
        </Suspense>
      </LazySection>

      {/* 8. Airdrops */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <AirdropsInfo />
        </Suspense>
      </LazySection>

      {/* 9. Ecosystem overview */}
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <BenefitsSection />
        </Suspense>
      </LazySection>

      <Footer />
    </div>
  )
}

export default Home