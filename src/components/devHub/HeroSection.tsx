import { Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

function HeroSection() {
  const isMobile = useIsMobile();

  return (
    <section className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-16' : 'py-24'}`}>
      <div className="text-center animate-fade-in">
        <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold tracking-widest text-purple-400 uppercase bg-purple-500/10 rounded-full border border-purple-500/20 jersey-20-regular">
          🚀 Web3 Infrastructure Platform
        </span>
        
        <h1 className={`font-bold jersey-15-regular text-gradient ${isMobile ? 'text-4xl mb-4' : 'text-6xl mb-6'} leading-tight`}>
          Build Your Web3 Ecosystem
          <br />
          Fast, Secure & Scalable
        </h1>
        
        <p className={`jersey-20-regular text-slate-300 max-w-3xl mx-auto leading-relaxed ${isMobile ? 'text-xl mb-8' : 'text-2xl mb-10'}`}>
          Everything you need to launch, manage, and scale tokenized ecosystems. From staking infrastructure to NFT marketplaces—deploy in minutes with enterprise-grade security.
        </p>
        
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-4'} justify-center items-center`}>
          <Link to="/labs" className={`btn-primary jersey-20-regular ${isMobile ? 'w-full py-3 text-xl' : 'px-8 py-4 text-2xl'}`}>
            Explore Labs
          </Link>
          <Link to="/chat" className={`btn-secondary jersey-20-regular ${isMobile ? 'w-full py-3 text-xl' : 'px-8 py-4 text-2xl'}`}>
            Talk to Nuxbee AI
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'} mt-16`}>
        <div className="card-stats text-center">
          <div className="text-3xl font-bold text-purple-400 jersey-20-regular">4+</div>
          <div className="text-sm text-slate-400 mt-1 jersey-20-regular">Core Tools</div>
        </div>
        <div className="card-stats text-center">
          <div className="text-3xl font-bold text-purple-400 jersey-20-regular">100%</div>
          <div className="text-sm text-slate-400 mt-1 jersey-20-regular">Decentralized</div>
        </div>
        <div className="card-stats text-center">
          <div className="text-3xl font-bold text-purple-400 jersey-20-regular">24/7</div>
          <div className="text-sm text-slate-400 mt-1 jersey-20-regular">AI Support</div>
        </div>
        <div className="card-stats text-center">
          <div className="text-3xl font-bold text-purple-400 jersey-20-regular">∞</div>
          <div className="text-sm text-slate-400 mt-1 jersey-20-regular">Scalability</div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
