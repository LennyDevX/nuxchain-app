import React from 'react';
import { CheckIcon, CalendarIcon, CodeIcon, DatabaseIcon, BarChart3Icon, CpuIcon, ZapIcon, GlobeIcon } from '../labs/CustomIcons';

interface TimelineVisualizationProps {
  isMobile: boolean;
}

interface TimelinePhase {
  phase: number;
  title: string;
  status: 'completed' | 'in-progress' | 'planned';
  color: string;
  items: {
    title: string;
    icon: React.ReactNode;
    completed: boolean;
  }[];
}

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({ isMobile }) => {
  const phases: TimelinePhase[] = [
    {
      phase: 1,
      title: 'Foundation & Core Features',
      status: 'completed',
      color: 'green',
      items: [
        { title: 'Nuxchain Platform Beta', icon: <CpuIcon className="w-5 h-5" />, completed: true },
        { title: 'Profile Page & Dashboard', icon: <DatabaseIcon className="w-5 h-5" />, completed: true },
        { title: 'AI Staking Analysis', icon: <BarChart3Icon className="w-5 h-5" />, completed: true },
        { title: 'Nuxbee AI 1.0', icon: <ZapIcon className="w-5 h-5" />, completed: true },
        { title: 'Roadmap Visualization', icon: <BarChart3Icon className="w-5 h-5" />, completed: true },
      ]
    },
    {
      phase: 2,
      title: 'Advanced Features & Governance',
      status: 'in-progress',
      color: 'yellow',
      items: [
        { title: 'NFT Analytics Dashboard', icon: <BarChart3Icon className="w-5 h-5" />, completed: false },
        { title: 'Governance DAO', icon: <CodeIcon className="w-5 h-5" />, completed: false },
        { title: 'Nuxbee AI Platform 2.0', icon: <CpuIcon className="w-5 h-5" />, completed: false },
        { title: 'Update Smart Contracts', icon: <CodeIcon className="w-5 h-5" />, completed: false },
      ]
    },
    {
      phase: 3,
      title: 'Innovation & Expansion',
      status: 'planned',
      color: 'purple',
      items: [
        { title: 'Physical NFT Clothing Brand', icon: <GlobeIcon className="w-5 h-5" />, completed: false },
        { title: 'New Smart Contracts', icon: <CodeIcon className="w-5 h-5" />, completed: false },
        { title: 'Mini Game & Gamification', icon: <ZapIcon className="w-5 h-5" />, completed: false },
        { title: 'Advanced Security Features', icon: <GlobeIcon className="w-5 h-5" />, completed: false },
      ]
    }
  ];

  const getStatusColor = (color: string) => {
    const colors = {
      green: 'bg-green-500/20 border-green-500/50 text-green-400',
      yellow: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
      purple: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
    };
    return colors[color as keyof typeof colors];
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { text: 'Completed', color: 'bg-green-900/30 text-green-400' },
      'in-progress': { text: 'In Progress', color: 'bg-yellow-900/30 text-yellow-400' },
      planned: { text: 'Planned', color: 'bg-purple-900/30 text-purple-400' },
    };
    return badges[status as keyof typeof badges];
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className={`font-bold mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          Development Timeline
        </h2>
        <p className={`text-slate-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
          Our journey from inception to innovation, visualized across three strategic phases.
        </p>
      </div>

      {/* Timeline */}
      <div className={`relative ${isMobile ? 'space-y-8' : 'space-y-12'}`}>
        {/* Vertical Line */}
        {!isMobile && (
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-yellow-500 to-purple-500 opacity-30 -translate-x-1/2" />
        )}

        {phases.map((phase, index) => {
          const badge = getStatusBadge(phase.status);
          const isLeft = index % 2 === 0;

          return (
            <div key={phase.phase} className={`relative ${
              isMobile ? '' : isLeft ? 'pr-1/2' : 'pl-1/2'
            }`}>
              {/* Phase Card */}
              <div className={`card-unified p-6 ${
                isMobile ? '' : isLeft ? 'mr-8' : 'ml-8'
              }`}>
                {/* Phase Number Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-3`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getStatusColor(phase.color)}`}>
                      <span className="font-bold text-lg">P{phase.phase}</span>
                    </div>
                    <div>
                      <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>
                        Phase {phase.phase}
                      </h3>
                      <p className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {phase.title}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                    {badge.text}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3 mt-4">
                  {phase.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {item.completed ? <CheckIcon className="w-4 h-4" /> : item.icon}
                      </div>
                      <span className={`flex-1 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        {item.title}
                      </span>
                      {item.completed && (
                        <CheckIcon className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Timeline Date */}
                <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {phase.status === 'completed' ? 'Completed Q3 2025' : 
                     phase.status === 'in-progress' ? 'Q4 2025 - Q1 2026' : 
                     'Q2 2026 - Q4 2027'}
                  </span>
                </div>
              </div>

              {/* Center Dot for Desktop */}
              {!isMobile && (
                <div className={`absolute top-8 ${isLeft ? 'right-0' : 'left-0'} w-4 h-4 rounded-full border-4 ${
                  phase.status === 'completed' ? 'bg-green-500 border-green-500/30' :
                  phase.status === 'in-progress' ? 'bg-yellow-500 border-yellow-500/30' :
                  'bg-purple-500 border-purple-500/30'
                } transform ${isLeft ? 'translate-x-1/2' : '-translate-x-1/2'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineVisualization;
