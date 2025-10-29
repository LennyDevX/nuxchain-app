import React from 'react';
import AIFeaturesSection from '../components/labs/AIFeaturesSection';
import InnovationShowcase from '../components/labs/InnovationShowcase';
import RoadmapTimeline from '../components/labs/RoadmapTimeline';
import GlobalBackground from '../ui/gradientBackground';
import { useIsMobile } from '../hooks/mobile/useIsMobile';

const LabsPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <GlobalBackground>
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${
        isMobile ? 'py-12 px-4' : 'py-20 px-4 sm:px-6 lg:px-8'
      }`}>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div>
            <span className={`inline-block px-3 py-1 font-semibold tracking-wider text-purple-400 bg-purple-900/20 rounded-full border border-purple-500/30 ${
              isMobile ? 'text-xs mb-4' : 'text-xs mb-6'
            }`}>
              Nuxchain Innovation Hub
            </span>
          </div>
          
          <h1 className={`font-bold text-gradient ${
            isMobile ? 'text-3xl mb-4' : 'text-4xl sm:text-5xl md:text-6xl mb-6'
          }`}>
            {isMobile ? 'AI Innovation' : 'AI Innovation and Technology'}
          </h1>
          
          <p className={`text-slate-300 max-w-3xl mx-auto ${
            isMobile ? 'text-base mb-6' : 'text-xl mb-10'
          }`}>
            {isMobile 
              ? 'Exploring blockchain limits with AI. Optimize your staking and NFTs.'
              : 'Exploring the limits of blockchain with artificial intelligence. Discover how our technology helps optimize staking strategies, NFTs, and maximize your earnings.'
            }
          </p>
          
          <div className={`flex gap-4 justify-center ${
            isMobile ? 'flex-col px-8' : 'flex-col sm:flex-row'
          }`}>
            <button className={`btn-primary ${isMobile ? 'py-2.5 text-sm' : ''}`}>
              {isMobile ? 'Explore' : 'Explore Projects'}
            </button>
            <button className={`btn-secondary ${isMobile ? 'py-2.5 text-sm' : ''}`}>
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
          <section>
            <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
              <h2 className={`font-bold mb-4 ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>Innovative Projects</h2>
              <p className={`text-slate-400 max-w-3xl mx-auto ${
                isMobile ? 'text-sm px-4' : ''
              }`}>
                {isMobile 
                  ? 'Projects revolutionizing blockchain ecosystem'
                  : 'Discover the projects we\'re developing to revolutionize the blockchain ecosystem.'
                }
              </p>
            </div>
            <InnovationShowcase />
          </section>

          {/* Roadmap Timeline */}
          {!isMobile && (
            <section>
              <RoadmapTimeline />
            </section>
          )}

          {/* Stats Cards */}
          <section>
            <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
              <h2 className={`font-bold mb-4 ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>
                {isMobile ? 'Our Impact' : 'Impact of Our Technology'}
              </h2>
              <p className={`text-slate-400 max-w-3xl mx-auto ${
                isMobile ? 'text-sm px-4' : ''
              }`}>
                {isMobile 
                  ? 'Real impact on investors\' performance'
                  : 'We measure the real impact of our solutions on investors\' performance.'
                }
              </p>
            </div>
            
            {/* Stats Grid 2x2 en mobile */}
            <div className={`grid gap-4 ${
              isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}>
              <div className={`card-stats border-green-500/20 ${isMobile ? 'p-3' : ''}`}>
                <div>
                  <h3 className={`font-bold text-green-400 ${
                    isMobile ? 'text-xl' : 'text-3xl'
                  }`}>+42%</h3>
                  <p className={`text-slate-400 ${
                    isMobile ? 'text-xs' : ''
                  }`}>
                    {isMobile ? 'Profit' : 'Profitability Optimization'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Users report higher earnings with AI</p>
                  </div>
                )}
              </div>
              
              <div className={`card-stats border-blue-500/20 ${isMobile ? 'p-3' : ''}`}>
                <div>
                  <h3 className={`font-bold text-blue-400 ${
                    isMobile ? 'text-xl' : 'text-3xl'
                  }`}>500k+</h3>
                  <p className={`text-slate-400 ${
                    isMobile ? 'text-xs' : ''
                  }`}>
                    {isMobile ? 'Simulations' : 'Investment Simulations'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: '68%' }}></div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Scenarios analyzed monthly</p>
                  </div>
                )}
              </div>
              
              <div className={`card-stats border-purple-500/20 ${isMobile ? 'p-3' : ''}`}>
                <div>
                  <h3 className={`font-bold text-purple-400 ${
                    isMobile ? 'text-xl' : 'text-3xl'
                  }`}>98%</h3>
                  <p className={`text-slate-400 ${
                    isMobile ? 'text-xs' : ''
                  }`}>
                    {isMobile ? 'Accuracy' : 'Recommendation Accuracy'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: '98%' }}></div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">User satisfaction rate</p>
                  </div>
                )}
              </div>
              
              <div className={`card-stats border-amber-500/20 ${isMobile ? 'p-3' : ''}`}>
                <div>
                  <h3 className={`font-bold text-amber-400 ${
                    isMobile ? 'text-xl' : 'text-3xl'
                  }`}>12</h3>
                  <p className={`text-slate-400 ${
                    isMobile ? 'text-xs' : ''
                  }`}>
                    {isMobile ? 'Models' : 'Predictive Models'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Advanced analysis tools</p>
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
                <h2 className={`font-bold ${isMobile ? 'mb-2 text-base' : 'mb-4 text-3xl'}`}>
                  {isMobile ? 'Try our AI tools?' : 'Want to try our AI tools?'}
                </h2>
                <p className={`text-slate-400 max-w-2xl mx-auto ${
                  isMobile ? 'text-xs mb-4 leading-tight' : 'text-base mb-8'
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
                  className={`inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isMobile ? 'w-full px-4 py-2 text-sm font-semibold' : 'px-8 py-6 text-lg'
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