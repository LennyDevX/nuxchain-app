import { Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

function HeroSection() {
  const isMobile = useIsMobile();

  return (
    <section className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-16' : 'py-24'}`}>
      <div className="text-center animate-fade-in">
        <div className="inline-block mb-4 px-4 py-2 bg-purple-600/20 border border-purple-400/30 rounded-full text-sm font-semibold text-purple-300">
          🚀 Web3 Infrastructure Platform
        </div>
        
        <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl md:text-6xl'} font-bold mb-6 leading-tight`}>
          Build Your Web3 Ecosystem
          <br />
          <span className="text-gradient">Fast, Secure & Scalable</span>
        </h1>
        
        <p className={`${isMobile ? 'text-base mb-8' : 'text-xl mb-10'} text-white/80 max-w-3xl mx-auto leading-relaxed`}>
          Everything you need to launch, manage, and scale tokenized ecosystems. From staking infrastructure to NFT marketplaces—deploy in minutes with enterprise-grade security.
        </p>
        
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-4'} justify-center items-center`}>
          <Link to="/labs" className="btn-primary px-8 py-4 text-lg">
            Explore Labs
          </Link>
          <Link to="/chat" className="btn-secondary px-8 py-4 text-lg">
            Talk to Nuxbee AI
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'} mt-16`}>
        <div className="card-stats text-center">
          <div className="text-3xl font-bold text-purple-400">4+</div>
          <div className="text-sm text-white/60 mt-1">Core Tools</div>
        </div>
        <div className="card-stats text-center">
          <div className="text-3xl font-bold text-purple-400">100%</div>
          <div className="text-sm text-white/60 mt-1">Decentralized</div>
        </div>
        <div className="card-stats text-center">
          <div className="text-3xl font-bold text-purple-400">24/7</div>
          <div className="text-sm text-white/60 mt-1">AI Support</div>
        </div>
        <div className="card-stats text-center">
          <div className="text-3xl font-bold text-purple-400">∞</div>
          <div className="text-sm text-white/60 mt-1">Scalability</div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
