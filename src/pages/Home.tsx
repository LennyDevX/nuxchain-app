import { lazy, Suspense } from 'react'
import HeroSection from '../components/home/HeroSection'
import Footer from '../components/layout/footer'
import { useLazyRender } from '../hooks/performance/useLazyRender'
import { HeroSkeletonLoader } from '../components/ui/SkeletonLoader'

// Lazy load heavy components with animations
const StakingSection = lazy(() => import('../components/home/StakingSection'))
const NFTSection = lazy(() => import('../components/home/NFTSection'))
const AISection = lazy(() => import('../components/home/AISection'))
const TokenizationSection = lazy(() => import('../components/home/TokenizationSection'))
const AirdropsInfo = lazy(() => import('../components/home/AirdropsInfo'))
const BenefitsSection = lazy(() => import('../components/home/BenefitsSection'))
const PriceTracker = lazy(() => import('../components/market/PriceTracker'))

// Loading skeleton fallback - Optimizado con HeroSkeletonLoader
const SectionLoader = () => (
  <div className="w-full py-20 px-4">
    <div className="max-w-7xl mx-auto">
      <HeroSkeletonLoader />
    </div>
  </div>
)

// Intersection observer for lazy rendering
const LazySection = ({ children }: { children: React.ReactNode }) => {
  const { ref, isVisible } = useLazyRender({ rootMargin: '100px 0px' })

  return <div ref={ref}>{isVisible ? children : <SectionLoader />}</div>
}

function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <StakingSection />
        </Suspense>
      </LazySection>
      
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <NFTSection />
        </Suspense>
      </LazySection>
      
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <AISection />
        </Suspense>
      </LazySection>
      
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <TokenizationSection />
        </Suspense>
      </LazySection>
      
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <AirdropsInfo />
        </Suspense>
      </LazySection>
      
      <LazySection>
        <Suspense fallback={<SectionLoader />}>
          <div className="w-full py-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-7xl mx-auto">
              <PriceTracker compact />
            </div>
          </div>
        </Suspense>
      </LazySection>
      
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