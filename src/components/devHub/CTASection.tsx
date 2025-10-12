import { Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

function CTASection() {
  const isMobile = useIsMobile();

  return (
    <section className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className="card-form text-center">
        <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-4`}>
          Ready to Build Your <span className="text-gradient">Web3 Project?</span>
        </h2>
        <p className="text-white/70 mb-8 max-w-2xl mx-auto">
          Join forward-thinking startups and DAOs building the decentralized future. Get started in minutes with our comprehensive toolkit.
        </p>
        
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-6'} justify-center`}>
          <Link to="/labs" className="btn-primary px-10 py-4 text-lg">
            🚀 Start Building
          </Link>
          <Link to="/chat" className="btn-secondary px-10 py-4 text-lg">
            💬 Get Support
          </Link>
        </div>

        <div className="mt-8 text-sm text-white/50">
          No credit card required • Full control • Deploy in minutes
        </div>
      </div>
    </section>
  );
}

export default CTASection;
