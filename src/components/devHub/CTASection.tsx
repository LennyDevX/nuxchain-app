import { Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

function CTASection() {
  const isMobile = useIsMobile();

  return (
    <section className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className="card-form text-center">
        <h2 className={`font-bold jersey-15-regular text-gradient ${isMobile ? 'text-3xl mb-3' : 'text-5xl mb-4'}`}>
          Ready to Build Your Web3 Project?
        </h2>
        <p className={`jersey-20-regular text-slate-400 mb-8 max-w-2xl mx-auto ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Join forward-thinking startups and DAOs building the decentralized future. Get started in minutes with our comprehensive toolkit.
        </p>
        
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-6'} justify-center`}>
          <Link to="/labs" className={`btn-primary jersey-20-regular ${isMobile ? 'w-full py-3 text-xl' : 'px-10 py-4 text-2xl'}`}>
            🚀 Start Building
          </Link>
          <Link to="/chat" className={`btn-secondary jersey-20-regular ${isMobile ? 'w-full py-3 text-xl' : 'px-10 py-4 text-2xl'}`}>
            💬 Get Support
          </Link>
        </div>

        <div className="mt-8 text-sm text-slate-500 jersey-20-regular">
          No credit card required • Full control • Deploy in minutes
        </div>
      </div>
    </section>
  );
}

export default CTASection;
