import React from 'react';
import { BrainIcon, BarChart3Icon, ZapIcon, CpuIcon } from './CustomIcons';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const AIFeaturesSection: React.FC = () => {
  const isMobile = useIsMobile();

  const features = [
    {
      icon: <BrainIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />,
      title: isMobile ? 'AI Strategist' : 'NuxAI Strategist',
      description: isMobile 
        ? 'Smart recommendations to optimize your investments'
        : 'Get smart recommendations and personalized strategies to optimize your investments in real-time',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <BarChart3Icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />,
      title: isMobile ? 'Analytics' : 'Market Analytics',
      description: isMobile 
        ? 'Track trends and predict market movements'
        : 'Advanced tools to track trends, analyze patterns, and predict market movements',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <ZapIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />,
      title: isMobile ? 'Auto Trading' : 'Automated Trading',
      description: isMobile 
        ? 'Execute strategies automatically 24/7'
        : 'Let AI execute your strategies automatically while you focus on what matters',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <CpuIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />,
      title: isMobile ? 'Portfolio' : 'Portfolio Optimization',
      description: isMobile 
        ? 'Diversify and maximize returns'
        : 'Intelligent diversification and risk management to maximize your returns',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className={`text-center max-w-3xl mx-auto ${isMobile ? 'px-4' : ''}`}>
        <h2 className={`font-bold mb-4 ${
          isMobile ? 'text-2xl' : 'text-3xl'
        }`}>
          AI-Powered Features
        </h2>
        <p className={`text-slate-400 ${
          isMobile ? 'text-sm' : ''
        }`}>
          {isMobile 
            ? 'Cutting-edge AI tools for smarter investing'
            : 'Discover how our artificial intelligence helps you make smarter and more profitable decisions'
          }
        </p>
      </div>

      {/* Grid 2x2 en mobile */}
      <div className={`grid gap-6 ${
        isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }`}>
        {features.map((feature, index) => (
          <div
            key={index}
            className={`card-unified group hover:scale-105 transition-all duration-300 ${
              isMobile ? 'p-4' : 'p-6'
            }`}
          >
            <div className={`rounded-xl bg-gradient-to-r ${feature.color} p-3 inline-block mb-4 group-hover:scale-110 transition-transform ${
              isMobile ? 'w-10 h-10 flex items-center justify-center' : ''
            }`}>
              {feature.icon}
            </div>
            <h3 className={`font-bold mb-2 ${
              isMobile ? 'text-sm' : 'text-xl'
            }`}>
              {feature.title}
            </h3>
            <p className={`text-slate-400 ${
              isMobile ? 'text-xs leading-tight' : 'text-sm'
            }`}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIFeaturesSection;