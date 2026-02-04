import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '../hooks/mobile/useIsMobile'
import Footer from '../components/layout/footer'
import { useLazyRender } from '../hooks/performance/useLazyRender'
import { HeroSkeletonLoader } from '../components/ui/SkeletonLoader'
import GlobalBackground from '../ui/gradientBackground'

// Lazy load section components
const StakingSection = lazy(() => import('../components/tutorial/StakingSection'))
const RewardsLevelsSection = lazy(() => import('../components/tutorial/RewardsLevelsSection'))
const NFTMintingSection = lazy(() => import('../components/tutorial/NFTMintingSection'))
const ComparisonSection = lazy(() => import('../components/tutorial/ComparisonSection'))
const AirdropSection = lazy(() => import('../components/tutorial/AirdropSection'))
const CollaboratorsSection = lazy(() => import('../components/tutorial/CollaboratorsSection'))

// Loading skeleton fallback
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

function Tutorial() {
  const isMobile = useIsMobile()

  return (
    <GlobalBackground>
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-white relative overflow-hidden py-16 lg:py-20 flex items-center">
        {/* Background - Same as GlobalBackground */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 50%, #000000 100%)'
            }}
          ></div>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(circle at 20% 30%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 0, 139, 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(25, 25, 112, 0.25) 0%, transparent 50%)',
              backgroundSize: '100% 100%',
              animation: 'nebula-drift 20s ease-in-out infinite alternate'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <span className="text-2xl">📚</span>
              <span className="text-sm font-semibold text-purple-200">Complete Guide</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className={`${isMobile ? 'text-4xl' : 'text-5xl lg:text-6xl'} font-black mb-6 leading-tight`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="text-white">Welcome to </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-transparent bg-clip-text">
                Nuxchain
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className={`${
                isMobile ? 'text-lg' : 'text-xl'
              } text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Your complete Web3 platform to create, trade and earn with NFTs. Discover how our 
              rewards ecosystem, staking, airdrops and much more works.
            </motion.p>

            {/* Quick Nav Pills */}
            <motion.div
              className={`flex ${
                isMobile ? 'flex-col gap-3' : 'flex-wrap justify-center gap-4'
              } max-w-4xl mx-auto`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { label: 'Staking', icon: '🔐', href: '#staking' },
                { label: 'Levels', icon: '🏆', href: '#levels' },
                { label: 'NFTs', icon: '🎨', href: '#nfts' },
                { label: 'Comparison', icon: '⚖️', href: '#comparison' },
                { label: 'Airdrops', icon: '🎁', href: '#airdrops' },
                { label: 'Collaborators', icon: '🤝', href: '#collaborators' }
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="px-4 py-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/40 rounded-full text-white text-sm font-semibold hover:border-purple-400/60 hover:from-purple-900/50 hover:to-pink-900/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <div id="staking">
        <LazySection>
          <Suspense fallback={<SectionLoader />}>
            <StakingSection />
          </Suspense>
        </LazySection>
      </div>

      <div id="levels">
        <LazySection>
          <Suspense fallback={<SectionLoader />}>
            <RewardsLevelsSection />
          </Suspense>
        </LazySection>
      </div>

      <div id="nfts">
        <LazySection>
          <Suspense fallback={<SectionLoader />}>
            <NFTMintingSection />
          </Suspense>
        </LazySection>
      </div>

      <div id="comparison">
        <LazySection>
          <Suspense fallback={<SectionLoader />}>
            <ComparisonSection />
          </Suspense>
        </LazySection>
      </div>

      <div id="airdrops">
        <LazySection>
          <Suspense fallback={<SectionLoader />}>
            <AirdropSection />
          </Suspense>
        </LazySection>
      </div>

      <div id="collaborators">
        <LazySection>
          <Suspense fallback={<SectionLoader />}>
            <CollaboratorsSection />
          </Suspense>
        </LazySection>
      </div>

      {/* Final CTA */}
      <section className="w-full py-20 px-4 relative">
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`${isMobile ? 'text-3xl' : 'text-4xl lg:text-5xl'} font-black mb-6 text-white`}>
              Ready to Get Started?
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Join thousands of creators already earning on Nuxchain
            </p>
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-center'} gap-4`}>
              <a
                href="/marketplace"
                className="px-8 py-3 btn-primary rounded-full font-bold text-white shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                Explore Marketplace
              </a>
              <a
                href="/create-my-nfts"
                className="px-8 py-3 bg-transparent border-2 border-purple-500 rounded-full font-bold text-white hover:bg-purple-500/10 transition-all duration-300"
              >
                Create my NFT
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </GlobalBackground>
  )
}

export default Tutorial
