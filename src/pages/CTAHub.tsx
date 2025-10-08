import { useEffect } from 'react';
import GlobalBackground from '../ui/gradientBackground';
import Footer from '../components/layout/footer';
import HeroSection from '../components/ctaHub/HeroSection';
import ToolsGrid from '../components/ctaHub/ToolsGrid';
import BenefitsSection from '../components/ctaHub/BenefitsSection';
import NuxchainKitSection from '../components/ctaHub/NuxchainKitSection';
import CTASection from '../components/ctaHub/CTASection';
import UseCasesSection from '../components/ctaHub/UseCasesSection';

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
