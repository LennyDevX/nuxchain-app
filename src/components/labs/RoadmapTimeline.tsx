import React from 'react';
import { CheckIcon, CalendarIcon, CodeIcon, ZapIcon, GlobeIcon, DatabaseIcon, BarChart3Icon, CpuIcon } from './CustomIcons';

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
  const roadmapItems: TimelineItemProps[] = [
    {
      title: "NuxAI Strategist Launch",
      description: "Our AI investment strategy assistant is available to all premium users.",
      icon: <CpuIcon className="w-6 h-6" />,
      completed: true
    },
    {
      title: "SmartStaking Optimization",
      description: "Improvements to the APY calculation algorithm and lockup periods to maximize user earnings.",
      icon: <DatabaseIcon className="w-6 h-6" />,
      completed: true
    },
    {
      title: "NFT Analytics Dashboard",
      description: "Complete platform for analyzing NFT collections, predicting trends, and optimizing investments.",
      icon: <BarChart3Icon className="w-6 h-6" />,
      completed: false
    },
    {
      title: "Cross-Chain Bridge",
      description: "Implementation of a secure bridge for transferring assets between different blockchain networks.",
      icon: <GlobeIcon className="w-6 h-6" />,
      completed: false
    },
    {
      title: "Governance AI",
      description: "Automated voting and proposal system to improve decentralized governance.",
      icon: <CodeIcon className="w-6 h-6" />,
      completed: false
    },
    {
      title: "AI-Powered Trading Bot",
      description: "Intelligent trading bot that learns from your behavior and executes orders automatically.",
      icon: <ZapIcon className="w-6 h-6" />,
      completed: false
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 
          className="text-3xl font-bold mb-4"
        >
          Our Development Plan
        </h2>
        <p 
          className="text-slate-400"
        >
          We show you our updated roadmap with the projects and improvements we have planned for the future. We are committed to innovation and continuous improvement of our platform.
        </p>
      </div>

      <div className="pl-4">
        {roadmapItems.map((item, index) => (
          <TimelineItem key={index} {...item} />
        ))}
      </div>

      <div className="mt-12 card-unified p-6">
        <h3 className="text-xl font-bold mb-4">Our Long-Term Vision</h3>
        <p className="text-slate-400 mb-6">
          In the future, we plan to expand our platform with more AI tools, integrate with more blockchains, and create a complete ecosystem that allows users to manage all their digital investments intelligently and securely.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="card-content p-4">
            <h4 className="font-medium mb-2">Multichain Integration</h4>
            <p className="text-sm text-slate-400">Support for more than 10 different blockchains.</p>
          </div>
          <div className="card-content p-4">
            <h4 className="font-medium mb-2">AI Marketplace</h4>
            <p className="text-sm text-slate-400">AI models and tools developed by the community.</p>
          </div>
          <div className="card-content p-4">
            <h4 className="font-medium mb-2">Financial Education</h4>
            <p className="text-sm text-slate-400">Learning platform with personalized AI.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;