import React, { useRef } from 'react';
import AIFeaturesSection from '../components/labs/AIFeaturesSection';
import InnovationShowcase from '../components/labs/InnovationShowcase';
import GlobalBackground from '../ui/gradientBackground';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import { useNavigate } from 'react-router-dom';

const LabsPage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const innovationRef = useRef<HTMLElement>(null);

  const handleScrollToInnovation = () => {
    innovationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChatRedirect = () => {
    navigate('/chat');
  };

  return (
    <GlobalBackground>
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

          {/* Innovation Showcase */}
          <section ref={innovationRef}>
            <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
              <h2 className={`font-bold mb-4 jersey-15-regular text-gradient ${
                isMobile ? 'text-4xl' : 'text-5xl'
              }`}>Innovative Projects</h2>
              <p className={`text-slate-400 max-w-3xl mx-auto jersey-20-regular ${
                isMobile ? 'text-xl px-4' : 'text-3xl'
              }`}>
                {isMobile 
                  ? 'Projects revolutionizing blockchain ecosystem'
                  : 'Discover the projects we\'re developing to revolutionize the blockchain ecosystem.'
                }
              </p>
            </div>
            <InnovationShowcase />
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
                    +30%
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
                    <p className="jersey-15-regular text-lg text-slate-400 mt-2">Expected improvement for early adopters</p>
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
                    <p className="jersey-15-regular text-lg text-slate-400 mt-2">Target accuracy rate by Q2 2026</p>
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
                    <p className="jersey-15-regular text-lg text-slate-400 mt-2">Major launches planned in 2026</p>
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
                  href="https://discord.gg/szZP2JcSq4" 
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
    </GlobalBackground>
  );
};

export default LabsPage;