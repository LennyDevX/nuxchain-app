import React from 'react';
import { CheckIcon, CalendarIcon, ZapIcon, BarChart3Icon, GlobeIcon, CpuIcon } from '../labs/CustomIcons';

interface MilestonesGridProps {
  isMobile: boolean;
}

interface Milestone {
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  status: 'achieved' | 'upcoming';
  category: string;
}

const MilestonesGrid: React.FC<MilestonesGridProps> = ({ isMobile }) => {
  const milestones: Milestone[] = [
    // Achieved Milestones
    {
      title: 'Project Inception',
      description: 'Started development of Nuxchain platform with initial architecture and core features.',
      date: 'Q4 2024',
      icon: <ZapIcon className="w-6 h-6" />,
      status: 'achieved',
      category: 'Launch'
    },
    
    {
      title: 'Smart Contracts v1.0',
      description: 'Development of innovative smart contract solutions to expand blockchain capabilities, create new DeFi products, and enhance platform functionality.',
      date: 'Q1 2025',
      icon: <BarChart3Icon className="w-6 h-6" />,
      status: 'achieved',
      category: 'Technology'
    },

    {
      title: 'AI Integration',
      description: 'Successfully integrated AI-powered staking analysis and recommendations.',
      date: 'Q2 2025',
      icon: <CpuIcon className="w-6 h-6" />,
      status: 'achieved',
      category: 'Technology'
    },

    {
      title: 'Beta Platform Launch',
      description: 'Internal beta launch of Nuxchain platform with core staking and marketplace features.',
      date: 'Q3 2025',
      icon: <ZapIcon className="w-6 h-6" />,
      status: 'achieved',
      category: 'Launch'
    },
    
    // Upcoming Milestones
    {
      title: 'NFT Analytics',
      description: 'Release of comprehensive NFT analytics and prediction dashboard.',
      date: 'Q4 2025',
      icon: <BarChart3Icon className="w-6 h-6" />,
      status: 'upcoming',
      category: 'Features'
    },
    {
      title: 'Nuvim Chat',
      description: 'Advanced AI-powered chat platform with generative AI capabilities. A comprehensive toolset hub for users powered by artificial intelligence.',
      date: 'Q1 2026',
      icon: <CpuIcon className="w-6 h-6" />,
      status: 'upcoming',
      category: 'Technology'
    },
    {
      title: 'Physical Branding NFTs',
      description: 'Launch of physical NFT clothing brand with digital integration.',
      date: 'Q2 2026',
      icon: <GlobeIcon className="w-6 h-6" />,
      status: 'upcoming',
      category: 'Innovation'
    },
    {
      title: 'Staking Pools v2.0',
      description: 'Advanced staking pools with dynamic rewards and flexible lock periods.',
      date: 'Q3 2026',
      icon: <BarChart3Icon className="w-6 h-6" />,
      status: 'upcoming',
      category: 'DeFi'
    },
    {
      title: 'DAO Governance',
      description: 'Launch of decentralized autonomous organization. Transition to a fully decentralized platform with community governance.',
      date: 'Q4 2026',
      icon: <GlobeIcon className="w-6 h-6" />,
      status: 'upcoming',
      category: 'Governance'
    },
    {
      title: 'Global Expansion & Web Launch',
      description: 'Official public launch of the web platform. Expansion to new markets and partnerships with major blockchain projects.',
      date: 'Q1 2027',
      icon: <GlobeIcon className="w-6 h-6" />,
      status: 'upcoming',
      category: 'Launch'
    },
    {
      title: 'Gaming Platform',
      description: 'Release of gamification features and mini-game ecosystem.',
      date: 'Q2-Q3 2027',
      icon: <ZapIcon className="w-6 h-6" />,
      status: 'upcoming',
      category: 'Gaming'
    },
    {
      title: 'Mobile App Launch',
      description: 'Release of native mobile applications for iOS and Android platforms.',
      date: 'Q4 2027',
      icon: <ZapIcon className="w-6 h-6" />,
      status: 'upcoming',
      category: 'Features'
    },
    {
      title: 'Enterprise Solutions',
      description: 'Launch of enterprise-grade blockchain solutions for institutional clients.',
      date: 'Q4 2027',
      icon: <GlobeIcon className="w-6 h-6" />,
      status: 'upcoming',
      category: 'Business'
    }
  ];

  const achievedMilestones = milestones.filter(m => m.status === 'achieved');
  const upcomingMilestones = milestones.filter(m => m.status === 'upcoming');

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Launch: 'bg-green-500/20 text-green-400 border-green-500/30',
      Technology: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Growth: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Governance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Features: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      Innovation: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      Gaming: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      DeFi: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      Business: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const renderMilestone = (milestone: Milestone, index: number) => (
    <div 
      key={index} 
      className="card-unified p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
    >
      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        {milestone.status === 'achieved' ? (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckIcon className="w-5 h-5 text-green-400" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
          </div>
        )}
      </div>

      {/* Icon */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
        milestone.status === 'achieved' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
      }`}>
        {milestone.icon}
      </div>

      {/* Content */}
      <h4 className={`font-bold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
        {milestone.title}
      </h4>
      <p className={`text-slate-400 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        {milestone.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarIcon className="w-4 h-4" />
          <span className={isMobile ? 'text-xs' : 'text-sm'}>{milestone.date}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(milestone.category)}`}>
          {milestone.category}
        </span>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className={`font-bold mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          Key Milestones
        </h2>
        <p className={`text-slate-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
          Track our progress through major achievements and upcoming goals that define our journey.
        </p>
      </div>

      {/* Achieved Milestones */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckIcon className="w-6 h-6 text-green-400" />
          </div>
          <h3 className={`font-bold text-green-400 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Achieved Milestones
          </h3>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-900/30 text-green-400 animate-pulse">
            {achievedMilestones.length}
          </span>
        </div>
        <div className={`grid gap-6 ${
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {achievedMilestones.map((milestone, index) => renderMilestone(milestone, index))}
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className={`font-bold text-purple-400 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Upcoming Milestones
          </h3>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-900/30 text-purple-400">
            {upcomingMilestones.length}
          </span>
        </div>
        <div className={`grid gap-6 ${
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {upcomingMilestones.map((milestone, index) => renderMilestone(milestone, index))}
        </div>
      </div>

      {/* Progress Stats */}
      <div className=" bg-transparent p-8">
        <h3 className={`font-bold mb-6 text-center ${isMobile ? 'text-lg' : 'text-xl'}`}>
          Overall Progress
        </h3>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400">Roadmap Completion</span>
            <span className="font-bold text-green-400">
              {Math.round((achievedMilestones.length / milestones.length) * 100)}%
            </span>
          </div>
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-purple-500 rounded-full transition-all duration-1000 ease-out animate-progress"
              style={{ width: `${(achievedMilestones.length / milestones.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className={`grid gap-4 mt-6 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-4'
          }`}>
            <div className="text-center">
              <div className={`font-bold text-green-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {achievedMilestones.length}
              </div>
              <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Achieved</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-purple-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {upcomingMilestones.length}
              </div>
              <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Upcoming</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-blue-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                2
              </div>
              <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Phases</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-amber-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                2024-2027
              </div>
              <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Timeline</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestonesGrid;
