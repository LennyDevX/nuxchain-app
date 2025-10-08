import React from 'react';
import { BrainIcon, BarChart3Icon, ZapIcon, CpuIcon } from './CustomIcons';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const AIFeaturesSection: React.FC = () => {
  const isMobile = useIsMobile();

  const features = [
    {
      icon: <CpuIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />,
      title: isMobile ? 'Nuvim Chat' : 'Nuvim AI Chat',
      description: isMobile
        ? 'Intelligent assistant for platform queries and help'
        : 'Nuvim is an AI chat where users can ask questions, get help, and receive real-time recommendations about all Nuxchain features.',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: <BrainIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />,
      title: isMobile ? 'AI Strategist' : 'AI Strategist & Insights',
      description: isMobile
        ? 'Personalized staking recommendations'
        : 'Advanced analysis that generates personalized staking strategies and recommended actions based on your profile.',
      color: 'from-indigo-600 to-violet-600'
    },
    {
      icon: <BarChart3Icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />,
      title: isMobile ? 'Staking Analytics' : 'Staking & NFT Analytics',
      description: isMobile
        ? 'Key staking and NFT metrics'
        : 'Dashboards and metrics to help you understand performance, APY and the health of your positions and NFT collections.',
      color: 'from-green-600 to-teal-600'
    },
    {
      icon: <ZapIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />,
      title: isMobile ? 'Speed & Automations' : 'Processing Speed & Automations',
      description: isMobile
        ? 'Fast responses and automations'
        : 'Optimized processing and automations to accelerate common tasks (claims, compounding, KB searches).',
      color: 'from-amber-600 to-red-600'
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