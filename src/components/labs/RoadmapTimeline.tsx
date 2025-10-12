import React from 'react';
import { useNavigate } from 'react-router-dom';
// Removed unused ZapIcon and GlobeIcon to satisfy linter
import { CheckIcon, CalendarIcon, CodeIcon, DatabaseIcon, BarChart3Icon, CpuIcon } from './CustomIcons';

interface TimelineItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ title, description, icon, completed }) => {
  return (
    <div
      className="flex gap-4 mb-8 relative"
    >
      {/* Timeline line */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-slate-700 to-slate-900 -z-10" />
      
      {/* Timeline dot */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
        {completed ? <CheckIcon className="w-6 h-6" /> : icon}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {completed && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-900/30 text-green-400">
              Completed
            </span>
          )}
        </div>
        <p className="text-slate-400 mb-2">{description}</p>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarIcon className="w-4 h-4" />
          <span>{completed ? 'Completed in January 2024' : 'Coming Soon'}</span>
        </div>
      </div>
    </div>
  );
};

const RoadmapTimeline: React.FC = () => {
  const navigate = useNavigate();
  
  // Fase 1: Completado
  const completedItems: TimelineItemProps[] = [
    {
      title: "Nuxchain Platform Beta",
      description: "Operational platform with SmartStaking contract and NFT Marketplace in beta. Users can stake, trade NFTs, and interact with the ecosystem.",
      icon: <CpuIcon className="w-6 h-6" />,
      completed: true
    },
    {
      title: "Profile Page & Dashboard",
      description: "Personal profile page with user stats, NFT and staking overview, and rewards tracking.",
      icon: <DatabaseIcon className="w-6 h-6" />,
      completed: true
    },
    {
      title: "AI Staking Analysis",
      description: "Integrated AI-powered analysis to optimize staking strategies and provide personalized recommendations.",
      icon: <BarChart3Icon className="w-6 h-6" />,
      completed: true
    }
  ];

  // Fase 2: Pendiente
  const pendingItems: TimelineItemProps[] = [
    {
      title: "NFT Analytics Dashboard",
      description: "Advanced dashboard for analyzing NFT collections, predicting trends, and optimizing investments.",
      icon: <BarChart3Icon className="w-6 h-6" />,
      completed: false
    },
    {
      title: "Governance DAO",
      description: "Implementation of decentralized governance for proposals and voting by the community.",
      icon: <CodeIcon className="w-6 h-6" />,
      completed: false
    },
    {
      title: "Nuxbee AI Platform 2.0",
      description: "Launch of dedicated Nuxbee AI platform with advanced features, deep integration throughout Nuxchain for contextual help and automation.",
      icon: <CpuIcon className="w-6 h-6" />,
      completed: false
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Our Development Plan
        </h2>
        <p className="text-slate-400">
          We show you our updated roadmap with the projects and improvements we have planned for the future. We are committed to innovation and continuous improvement of our platform.
        </p>
      </div>

      {/* Fase 1: Completado */}
      <div className="pl-4">
        <h3 className="text-xl font-bold mb-6 text-green-400">Phase 1: Completed</h3>
        {completedItems.map((item, index) => (
          <TimelineItem key={`completed-${index}`} {...item} />
        ))}
      </div>

      {/* Fase 2: Pendiente */}
      <div className="pl-4">
        <h3 className="text-xl font-bold mb-6 text-yellow-400">Phase 2: In Progress / Pending</h3>
        {pendingItems.map((item, index) => (
          <TimelineItem key={`pending-${index}`} {...item} />
        ))}
      </div>

      {/* CTA para ver roadmap completo */}
      <div className="mt-12 text-center">
        <div className="card-unified p-8">
          <h3 className="text-2xl font-bold mb-4">Want to see our complete vision?</h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Explore our detailed roadmap with all phases, including our long-term vision, upcoming features, and strategic milestones.
          </p>
          <button 
            onClick={() => navigate('/roadmap')}
            className="btn-primary px-8 py-3 text-lg"
          >
            View Complete Roadmap
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;