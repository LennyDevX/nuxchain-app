import React, { useRef } from 'react';
import { isMaintenanceMode } from '../config/maintenance';
import LabsMaintenance from './LabsMaintenance';
import AIFeaturesSection from '../components/labs/AIFeaturesSection';
import PlatformMission from '../components/labs/PlatformMission';
import UniswapPriceFeed from '../components/labs/UniswapPriceFeed';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import { useNavigate } from 'react-router-dom';

const LabsPage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const innovationRef = useRef<HTMLElement>(null);

  if (isMaintenanceMode('labs')) return <LabsMaintenance />;

  const handleScrollToInnovation = () => {
    innovationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChatRedirect = () => {
    navigate('/chat');
  };

  return (
    <>
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${
        isMobile ? 'py-12 px-4' : 'py-20 px-4 sm:px-6 lg:px-8'
      }`}>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          
          
          <h1 className={`font-bold text-gradient jersey-15-regular ${
            isMobile ? 'text-5xl mb-4' : 'text-4xl sm:text-5xl md:text-6xl mb-6'
          }`}>
            {isMobile ? 'AI Innovation' : 'AI Innovation and Technology'}
          </h1>

          <div>
            <span className={`inline-block px-3 py-1 font-semibold tracking-wider text-purple-400 bg-purple-900/20 rounded-full border border-purple-500/30 ${
              isMobile ? 'text-xs mb-4' : 'text-xs mb-6'
            }`}>
              Nuxchain Innovation Hub
            </span>
          </div>
          
          <p className={`text-slate-300 max-w-3xl mx-auto jersey-20-regular ${
            isMobile ? 'text-xl mb-6' : 'text-xl mb-10'
          }`}>
            {isMobile 
              ? 'Exploring blockchain limits with AI. Optimize your staking and NFTs.'
              : 'Exploring the limits of blockchain with artificial intelligence. Discover how our technology helps optimize staking strategies, NFTs, and maximize your earnings.'
            }
          </p>
          
          <div className={`flex gap-4 justify-center ${
            isMobile ? 'flex-col px-8' : 'flex-col sm:flex-row'
          }`}>
            <button 
              onClick={handleScrollToInnovation}
              className={`btn-primary jersey-20-regular ${isMobile ? 'py-3 text-xl' : 'py-3 px-8 text-2xl'}`}>
              {isMobile ? 'Explore' : 'Explore Projects'}
            </button>
            <button 
              onClick={handleChatRedirect}
              className={`btn-secondary jersey-20-regular ${isMobile ? 'py-3 text-xl' : 'py-3 px-8 text-2xl'}`}>
              {isMobile ? 'Meet AI' : 'Meet Our AI'}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto ${
        isMobile ? 'px-4 py-8 pb-32' : 'px-4 sm:px-6 lg:px-8 py-16'
      }`}>
        <div className={isMobile ? 'space-y-12' : 'space-y-20'}>
          {/* AI Features Section */}
          <section>
            <AIFeaturesSection />
          </section>

          {/* Platform Mission — AI + NFTs + Tokens */}
          <section ref={innovationRef}>
            <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
              <h2 className={`font-bold mb-4 jersey-15-regular text-gradient ${
                isMobile ? 'text-4xl' : 'text-5xl'
              }`}>What We Build</h2>
              <p className={`text-slate-400 max-w-3xl mx-auto jersey-20-regular ${
                isMobile ? 'text-xl px-4' : 'text-2xl'
              }`}>
                {isMobile
                  ? 'AI · NFTs · Tokens — tools for everyone'
                  : 'Tools that are useful inside and outside the NuxChain ecosystem.'
                }
              </p>
            </div>
            <PlatformMission />
          </section>

          {/* Uniswap Live Price Feed — teaser card */}
          <section>
            <div className={`card-unified relative overflow-hidden ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-4 text-center' : ''}`}>
                  <div className={`flex items-center gap-4 ${isMobile ? 'flex-col' : ''}`}>
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-white jersey-15-regular ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Live Price Feed</h3>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                      </div>
                      <p className={`text-slate-400 jersey-20-regular ${isMobile ? 'text-lg' : 'text-sm'}`}>
                        Real-time token prices · Powered by Uniswap API · Updates every 30s
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/labs/price-feed"
                    className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-300 font-semibold transition-all duration-200 hover:scale-105 jersey-20-regular ${isMobile ? 'w-full justify-center text-xl' : 'text-3xl'}`}
                  >
                    Open Price Feed →
                  </Link>
                </div>
                {!isMobile && (
                  <div className="mt-5 pt-5 border-t border-white/5">
                    <UniswapPriceFeed />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Future Projections */}
          <section>
            <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
              <h2 className={`font-bold mb-4 jersey-15-regular text-gradient ${
                isMobile ? 'text-4xl' : 'text-5xl'
              }`}>
                {isMobile ? 'Future Roadmap' : 'Future Roadmap'}
              </h2>
              <p className={`text-slate-400 max-w-3xl mx-auto jersey-20-regular ${
                isMobile ? 'text-xl px-4' : 'text-3xl'
              }`}>
                {isMobile 
                  ? 'Our goals for the next 12 months'
                  : 'Our projected milestones and goals for the platform within the next 12 months of development.'
                }
              </p>
            </div>
            
            {/* Stats Grid 2x2 en mobile */}
            <div className={`grid gap-4 ${
              isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}>
              <div 
                className={`card-stats border-green-500/20 ${isMobile ? 'p-3' : ''}`}
                role="region"
                aria-label="Projected average profitability improvement of 25 percent for users"
              >
                <div>
                  <h3 
                    className={`font-bold text-green-400 jersey-20-regular ${
                      isMobile ? 'text-2xl' : 'text-3xl'
                    }`}
                    aria-live="polite"
                  >
                    +27%
                  </h3>
                  <p className={`text-slate-400 jersey-20-regular ${
                    isMobile ? 'text-xl' : 'text-lg'
                  }`}>
                    {isMobile ? 'Avg Return' : 'Avg Return Potential'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: '25%' }}></div>
                    </div>
                    <p className="jersey-15-regular text-lg text-slate-400 mt-2">Integración de Swap, powered by Uniswap, con rutas eficiente y mejor precio</p>
                  </div>
                )}
              </div>
              
              <div 
                className={`card-stats border-blue-500/20 ${isMobile ? 'p-3' : ''}`}
                role="region"
                aria-label="Projected target of 10 thousand active users in next year"
              >
                <div>
                  <h3 
                    className={`font-bold text-blue-400 jersey-20-regular ${
                      isMobile ? 'text-3xl' : 'text-4xl'
                    }`}
                    aria-live="polite"
                  >
                    5k+
                  </h3>
                  <p className={`text-slate-400 jersey-20-regular ${
                    isMobile ? 'text-2xl' : 'text-xl'
                  }`}>
                    {isMobile ? 'Target Users' : 'Target Active Users'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: '40%' }}></div>
                    </div>
                    <p className="jersey-15-regular text-lg text-slate-400 mt-2">Goal for the end of 2026</p>
                  </div>
                )}
              </div>
              
              <div 
                className={`card-stats border-purple-500/20 ${isMobile ? 'p-3' : ''}`}
                role="region"
                aria-label="Projected recommendation accuracy target of 85 percent"
              >
                <div>
                  <h3 
                    className={`font-bold text-purple-400 jersey-20-regular ${
                      isMobile ? 'text-3xl' : 'text-4xl'
                    }`}
                    aria-live="polite"
                  >
                    85%
                  </h3>
                  <p className={`text-slate-400 jersey-20-regular ${
                    isMobile ? 'text-2xl' : 'text-lg'
                  }`}>
                    {isMobile ? 'AI Accuracy' : 'AI Recommendation Accuracy'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: '85%' }}></div>
                    </div>
                    <p className="jersey-15-regular text-lg text-slate-400 mt-2">Nuxbee AI 2.0 Q3 2026</p>
                  </div>
                )}
              </div>
              
              <div 
                className={`card-stats border-amber-500/20 ${isMobile ? 'p-3' : ''}`}
                role="region"
                aria-label="Projected 8 major features planned for rollout"
              >
                <div>
                  <h3 
                    className={`font-bold text-amber-400 jersey-20-regular ${
                      isMobile ? 'text-2xl' : 'text-3xl'
                    }`}
                    aria-live="polite"
                  >
                    5
                  </h3>
                  <p className={`text-slate-400 jersey-20-regular ${
                    isMobile ? 'text-xl' : 'text-lg'
                  }`}>
                    {isMobile ? 'New Features' : 'Planned Features'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: '60%' }}></div>
                    </div>
                    <p className="jersey-15-regular text-lg text-slate-400 mt-2">Integración de Swap Q2 2026</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className={isMobile ? 'sticky bottom-20 z-40' : ''}>
            <div className={`card-unified text-center relative overflow-hidden ${
              isMobile ? 'p-4 rounded-2xl' : 'p-8'
            }`}>
              <div className="relative z-10">
                <h2 className={`font-bold jersey-15-regular ${isMobile ? 'mb-2 text-xl' : 'mb-4 text-4xl'}`}>
                  {isMobile ? 'Try our AI tools?' : 'Want to try our AI tools?'}
                </h2>
                <p className={`text-slate-400 max-w-2xl mx-auto jersey-20-regular ${
                  isMobile ? 'text-xl mb-4 leading-tight' : 'text-sm mb-8'
                }`}>
                  {isMobile 
                    ? 'join us!'
                    : 'Join our community of innovators and discover how our technology can help you optimize your investment strategies.'
                  }
                </p>
                <a 
                  href="https://t.me/+ESghwuU2rCpiNmI5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 jersey-20-regular font-semibold ${
                    isMobile ? 'w-full px-4 py-3 text-xl' : 'px-8 py-4 text-lg'
                  }`}>
                  {isMobile ? 'Start Now' : 'Get Started Now'}
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default LabsPage;