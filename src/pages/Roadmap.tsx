import React from 'react';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import MilestonesGrid from '../components/roadmap/MilestonesGrid';

const RoadmapPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Hero Section */}

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
                <h2 className={`jersey-15-regular mb-4 ${
                  isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'
                }`}>
                  Be Part of the Revolution
                </h2>
                <p className={`jersey-20-regular text-slate-400 max-w-2xl mx-auto ${
                  isMobile ? 'text-lg mb-6' : 'text-xl md:text-2xl mb-8'
                }`}>
                  Join the community building the first cross-chain AI platform in Web3. Follow our progress, contribute ideas, and shape the future of Nuxchain.
                </p>
                <div className={`flex gap-4 justify-center ${
                  isMobile ? 'flex-col' : 'flex-row'
                }`}>
                  <a 
                    href="https://discord.gg/szZP2JcSq4" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="jersey-20-regular btn-primary px-8 py-3 inline-block text-center text-lg md:text-xl"
                  >
                    Join Community
                  </a>
                  
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default RoadmapPage;
