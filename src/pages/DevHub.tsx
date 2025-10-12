import { useEffect } from 'react';
import GlobalBackground from '../ui/gradientBackground';
import Footer from '../components/layout/footer';
import HeroSection from '../components/devHub/HeroSection';
import ToolsGrid from '../components/devHub/ToolsGrid';
import BenefitsSection from '../components/devHub/BenefitsSection';
import NuxchainKitSection from '../components/devHub/NuxchainKitSection';
import CTASection from '../components/devHub/CTASection';
import UseCasesSection from '../components/devHub/UseCasesSection';

function CTAHub() {
  useEffect(() => {
    document.title = 'Nuxchain | CTA Hub - Web3 Infrastructure for Developers';
  }, []);

  return (
    <GlobalBackground>
      <div className="min-h-screen text-white">
        <HeroSection />
        <ToolsGrid />
        <BenefitsSection />
        <NuxchainKitSection />
        <CTASection />
        <UseCasesSection />
        <Footer />
      </div>
    </GlobalBackground>
  );
}

export default CTAHub;
