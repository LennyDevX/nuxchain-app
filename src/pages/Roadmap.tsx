import React from 'react';
import GlobalBackground from '../ui/gradientBackground';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import RoadmapHero from '../components/Roadmap/RoadmapHero';
import MilestonesGrid from '../components/Roadmap/MilestonesGrid';

const RoadmapPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <GlobalBackground>
      {/* Hero Section */}
      <RoadmapHero isMobile={isMobile} />

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto ${
        isMobile ? 'px-4 py-8' : 'px-4 sm:px-6 lg:px-8 py-16'
      }`}>
        <div className={isMobile ? 'space-y-12' : 'space-y-20'}>
          
          {/* Milestones Grid */}
          <section>
            <MilestonesGrid isMobile={isMobile} />
          </section>

          {/* CTA Section */}
          <section>
            <div className={` text-center relative overflow-hidden ${
              isMobile ? 'p-6' : 'p-12'
            }`}>
              <div className="relative z-10">
                <h2 className={`font-bold mb-4 ${
                  isMobile ? 'text-xl' : 'text-3xl'
                }`}>
                  Join Us on This Journey
                </h2>
                <p className={`text-slate-400 max-w-2xl mx-auto ${
                  isMobile ? 'text-sm mb-6' : 'text-lg mb-8'
                }`}>
                  Be part of the revolution in blockchain technology. Follow our progress and contribute to the future of decentralized finance.
                </p>
                <div className={`flex gap-4 justify-center ${
                  isMobile ? 'flex-col' : 'flex-row'
                }`}>
                  <a 
                    href="https://discord.gg/szZP2JcSq4" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary px-8 py-3 inline-block text-center"
                  >
                    Join Community
                  </a>
                  <a 
                    href="https://github.com/users/LennyDevX/projects/4" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary px-8 py-3 inline-block text-center"
                  >
                    View Documentation
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </GlobalBackground>
  );
};

export default RoadmapPage;
