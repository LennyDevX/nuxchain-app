import React, { useState } from 'react';
import { ExternalLinkIcon, GlobeIcon, CodeIcon, DatabaseIcon, CpuIcon } from '../ui/CustomIcons';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface ProjectProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  category: string;
  highlight?: boolean;
}

const ProjectCard: React.FC<ProjectProps> = ({ title, description, icon, progress, category, highlight = false }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`h-full ${!isMobile && highlight ? 'md:col-span-2 md:row-span-2' : ''}`}>
      <div className={`card-unified h-full ${highlight ? 'border-purple-500/30' : ''} ${
        isMobile ? 'p-4' : ''
      }`}>
        <div className="relative z-10 mb-6">
          <div className={`flex items-center gap-3 ${isMobile ? 'mb-2' : 'mb-4'}`}>
            <div className={`rounded-full flex items-center justify-center ${
              highlight ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
            } ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
              {icon}
            </div>
            <span className={`font-medium px-2 py-1 rounded-full ${
              highlight ? 'bg-purple-900/30 text-purple-300' : 'bg-blue-900/30 text-blue-300'
            } ${isMobile ? 'text-xs' : 'text-xs'}`}>
              {category}
            </span>
          </div>
          <h3 className={`font-bold mb-2 ${
            isMobile ? 'text-sm' : 'text-xl'
          }`}>{title}</h3>
          {!isMobile && (
            <p className="text-slate-400 text-sm">{description}</p>
          )}
        </div>
        
        <div className="relative z-10">
          <div className="space-y-4">
            <div className={isMobile ? 'space-y-1' : 'space-y-2'}>
              <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <span className="text-slate-400">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${
                isMobile ? 'h-1.5' : 'h-2'
              }`}>
                <div className={`h-full rounded-full ${highlight ? 'bg-purple-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {!isMobile && (
          <div className="relative z-10 pt-4 border-t border-slate-700">
            <button className={`w-full ${highlight ? 'bg-purple-600 hover:bg-purple-700' : 'btn-secondary'} text-white transition-all duration-300 px-4 py-2 rounded-lg flex items-center justify-center`}>
              {highlight ? 'Explore Demo' : 'More Information'}
              <ExternalLinkIcon className="ml-2 w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const InnovationShowcase: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleProjects, setVisibleProjects] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const isMobile = useIsMobile();

  const projects: ProjectProps[] = [
    {
      title: "NuxAI Strategist",
      description: "Intelligent assistant that analyzes the market and recommends personalized investment strategies to maximize your capital return.",
      icon: <CpuIcon className="w-5 h-5" />,
      progress: 90,
      category: "AI",
      highlight: false
    },
    {
      title: "SmartStaking Optimizer",
      description: "Tool that calculates the best staking and lockup periods according to your risk profile and investment horizon.",
      icon: <DatabaseIcon className="w-5 h-5" />,
      progress: 85,
      category: "Staking"
    },
    {
      title: "NFT Analytics Dashboard",
      description: "Platform that analyzes NFT collections, predicts market trends, and helps you identify investment opportunities.",
      icon: <GlobeIcon className="w-5 h-5" />,
      progress: 70,
      category: "NFTs"
    },
    {
      title: "Blockchain Governance AI",
      description: "Automated voting and proposal system to improve the decentralized governance of blockchain protocols.",
      icon: <CodeIcon className="w-5 h-5" />,
      progress: 60,
      category: "Governance"
    },
    {      title: "Nuxchain Game",      description: "Blockchain-based game in development that combines play-to-earn mechanics with strategic gameplay.",      icon: <GlobeIcon className="w-5 h-5" />,      progress: 30,      category: "Gaming"    },    {      title: "CryptoInfluence Marketing Hub",      description: "Platform that connects influencers with crypto projects, enabling monetization through collaborations and enhancing audience engagement.",      icon: <GlobeIcon className="w-5 h-5" />,      progress: 45,      category: "Marketing"    }
  ];

  const categories = ['all', 'AI', 'Staking', 'NFTs', 'Governance', 'Gaming', 'Marketing'];

  const filterProjects = (category: string) => {
    setActiveFilter(category);
    // Simulate filtering with a slight delay for animation effect
    setTimeout(() => {
      const filteredProjects = projects
        .map((project, index) => ({ ...project, index }))
        .filter(project => category === 'all' || project.category === category)
        .slice(0, 4)
        .map(project => project.index);
      setVisibleProjects(filteredProjects);
    }, 300);
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className={`flex flex-wrap gap-2 justify-center ${isMobile ? 'px-4' : ''}`}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => filterProjects(category)}
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              isMobile ? 'text-xs px-3 py-1.5' : 'text-sm'
            } ${activeFilter === category 
              ? 'bg-purple-600 text-white font-medium' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {category === 'all' ? 'All' : category}
          </button>
        ))}
      </div>

      {/* Projects Grid - 2x2 en mobile */}
      <div className={`grid gap-6 ${
        isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {visibleProjects.map((index) => (
          <ProjectCard key={index} {...projects[index]} />
        ))}
      </div>
    </div>
  );
};

export default InnovationShowcase;