import React from 'react';
import { CheckIcon, CodeIcon, DatabaseIcon, BarChart3Icon, CpuIcon, ZapIcon, GlobeIcon, LockIcon } from '../labs/CustomIcons';

interface PhaseCardsProps {
  isMobile: boolean;
}

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'in-progress' | 'planned';
}

const PhaseCards: React.FC<PhaseCardsProps> = ({ isMobile }) => {
  const phase1Features: Feature[] = [
    {
      title: 'Nuxchain Platform Beta',
      description: 'Fully operational platform with SmartStaking contract and NFT Marketplace. Users can stake tokens, trade NFTs, and interact seamlessly with the ecosystem.',
      icon: <CpuIcon className="w-6 h-6" />,
      status: 'completed'
    },
    {
      title: 'Profile Page & Dashboard',
      description: 'Personalized user profiles with comprehensive stats, NFT collections, staking overview, and real-time rewards tracking.',
      icon: <DatabaseIcon className="w-6 h-6" />,
      status: 'completed'
    },
    {
      title: 'AI Staking Analysis',
      description: 'Advanced AI-powered analysis engine that optimizes staking strategies and provides personalized recommendations based on market conditions.',
      icon: <BarChart3Icon className="w-6 h-6" />,
      status: 'completed'
    },
    {
      title: 'Nuxbee AI 1.0',
      description: 'Initial release of Nuxbee AI assistant with advanced features and capabilities, with plans for a dedicated platform.',
      icon: <ZapIcon className="w-6 h-6" />,
      status: 'completed'
    },
    {
      title: 'Roadmap Visualization',
      description: 'Interactive roadmap interface with comprehensive components showing development phases, milestones, and timeline visualization.',
      icon: <BarChart3Icon className="w-6 h-6" />,
      status: 'completed'
    }
  ];

  const phase2Features: Feature[] = [
    {
      title: 'NFT Analytics Dashboard',
      description: 'Comprehensive analytics platform for NFT collections with trend prediction, market analysis, and investment optimization tools powered by AI.',
      icon: <BarChart3Icon className="w-6 h-6" />,
      status: 'in-progress'
    },
    {
      title: 'Governance DAO',
      description: 'Decentralized autonomous organization enabling community-driven governance. Vote on proposals, submit ideas, and shape the future of Nuxchain.',
      icon: <CodeIcon className="w-6 h-6" />,
      status: 'in-progress'
    },
    {
      title: 'Nuxbee AI Platform 2.0',
      description: 'Launch of dedicated Nuxbee AI platform with advanced features, deep integration throughout Nuxchain, providing contextual help, automation, and sophisticated tools.',
      icon: <CpuIcon className="w-6 h-6" />,
      status: 'in-progress'
    },

    {
      title: 'Update Smart Contracts',
      description: 'Update and optimize smart contracts for better performance and security.',
      icon: <ZapIcon className="w-6 h-6" />,
      status: 'in-progress'
    }
  ];

  const phase3Features: Feature[] = [
    {
      title: 'Physical NFT Clothing Brand',
      description: 'Revolutionary clothing line where each physical item comes with a unique NFT, unlocking exclusive benefits, utilities, and experiences on the platform.',
      icon: <GlobeIcon className="w-6 h-6" />,
      status: 'planned'
    },
    {
      title: 'New Smart Contracts',
      description: 'Development of innovative smart contract solutions to expand blockchain capabilities, create new DeFi products, and enhance platform functionality.',
      icon: <CodeIcon className="w-6 h-6" />,
      status: 'planned'
    },
    {
      title: 'Mini Game & Gamification',
      description: 'Interactive gaming experience that gamifies user engagement, connecting NFTs, staking, and daily tasks for rewards and enhanced platform interaction.',
      icon: <ZapIcon className="w-6 h-6" />,
      status: 'planned'
    },
    {
      title: 'Advanced Security Features',
      description: 'Enhanced security protocols, multi-signature wallets, and advanced encryption to protect user assets and ensure platform integrity.',
      icon: <LockIcon className="w-6 h-6" />,
      status: 'planned'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-400 bg-green-900/30',
      'in-progress': 'text-yellow-400 bg-yellow-900/30',
      planned: 'text-purple-400 bg-purple-900/30',
    };
    return colors[status as keyof typeof colors];
  };

  const renderPhaseSection = (
    phaseNumber: number,
    title: string,
    description: string,
    features: Feature[],
    accentColor: string
  ) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-3 mb-4`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${accentColor}-500/20 border-2 border-${accentColor}-500/50`}>
            <span className={`font-bold text-xl text-${accentColor}-400`}>{phaseNumber}</span>
          </div>
          <h3 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Phase {phaseNumber}: {title}
          </h3>
        </div>
        <p className={`text-slate-400 max-w-2xl mx-auto ${isMobile ? 'text-sm' : 'text-base'}`}>
          {description}
        </p>
      </div>

      <div className={`grid gap-6 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {features.map((feature, index) => (
          <div key={index} className="card-unified p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                feature.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                feature.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {feature.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
                    {feature.title}
                  </h4>
                  {feature.status === 'completed' && (
                    <CheckIcon className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <p className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'} mb-3`}>
                  {feature.description}
                </p>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(feature.status)}`}>
                  {feature.status === 'completed' ? 'Completed' :
                   feature.status === 'in-progress' ? 'In Progress' :
                   'Planned'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className={`font-bold mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          Detailed Phase Breakdown
        </h2>
        <p className={`text-slate-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
          Explore each phase in detail with comprehensive feature descriptions and current status.
        </p>
      </div>

      {/* Phase 1 */}
      {renderPhaseSection(
        1,
        'Foundation & Core Features',
        'Establishing the fundamental infrastructure and core functionalities of the Nuxchain ecosystem.',
        phase1Features,
        'green'
      )}

      {/* Phase 2 */}
      {renderPhaseSection(
        2,
        'Advanced Features & Governance',
        'Expanding capabilities with advanced analytics, community governance, and enhanced AI integration.',
        phase2Features,
        'yellow'
      )}

      {/* Phase 3 */}
      {renderPhaseSection(
        3,
        'Innovation & Expansion',
        'Pioneering new frontiers with physical-digital integration, gamification, and revolutionary blockchain solutions.',
        phase3Features,
        'purple'
      )}
    </div>
  );
};

export default PhaseCards;
