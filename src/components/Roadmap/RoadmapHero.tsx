import React from 'react';

interface RoadmapHeroProps {
  isMobile: boolean;
}

const RoadmapHero: React.FC<RoadmapHeroProps> = ({ isMobile }) => {
  return (
    <section className={`relative overflow-hidden ${
      isMobile ? 'py-12 px-4' : 'py-20 px-4 sm:px-6 lg:px-8'
    }`}>
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div>
          <span className={`inline-block px-3 py-1 font-semibold tracking-wider text-purple-400 bg-purple-900/20 rounded-full border border-purple-500/30 ${
            isMobile ? 'text-xs mb-4' : 'text-xs mb-6'
          }`}>
            Product Roadmap
          </span>
        </div>
        
        <h1 className={`font-bold text-gradient ${
          isMobile ? 'text-3xl mb-4' : 'text-4xl sm:text-5xl md:text-6xl mb-6'
        }`}>
          {isMobile ? 'Our Vision' : 'Building the Future of Blockchain'}
        </h1>
        
        <p className={`text-slate-300 max-w-3xl mx-auto ${
          isMobile ? 'text-base mb-6' : 'text-xl mb-10'
        }`}>
          {isMobile 
            ? 'Explore our complete roadmap with all phases, milestones, and strategic vision for the Nuxchain ecosystem.'
            : 'Explore our comprehensive development roadmap. From completed milestones to ambitious future goals, discover how we\'re revolutionizing the blockchain ecosystem with AI-powered solutions.'
          }
        </p>
        
        {/* Stats Row */}
        <div className={`grid gap-4 max-w-4xl mx-auto ${
          isMobile ? 'grid-cols-2' : 'grid-cols-4'
        }`}>
          <div className="card-content p-4">
            <div className={`font-bold text-green-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>3</div>
            <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Phases</div>
          </div>
          <div className="card-content p-4">
            <div className={`font-bold text-blue-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>14</div>
            <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Milestones</div>
          </div>
          <div className="card-content p-4">
            <div className={`font-bold text-purple-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>5</div>
            <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Achieved</div>
          </div>
          <div className="card-content p-4">
            <div className={`font-bold text-amber-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>36%</div>
            <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Progress</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapHero;
