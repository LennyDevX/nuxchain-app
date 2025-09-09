import HeroSection from '../components/home/HeroSection'
import StakingSection from '../components/home/StakingSection'
import NFTSection from '../components/home/NFTSection'
import AISection from '../components/home/AISection'
import TokenizationSection from '../components/home/TokenizationSection'
import StakingInfo from '../components/home/AirdropsInfo'
import BenefitsSection from '../components/home/BenefitsSection'
import Footer from '../components/layout/footer'

function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StakingSection />
      <NFTSection />
      <AISection />
      <TokenizationSection />
      <StakingInfo />
      <BenefitsSection />
      <Footer />
    </div>
  )
}

export default Home