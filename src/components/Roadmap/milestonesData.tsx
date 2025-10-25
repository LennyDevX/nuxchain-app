import React from 'react';
import { CalendarIcon, ZapIcon, BarChart3Icon, GlobeIcon, CpuIcon, AIIcon, LineChartIcon } from '../ui/CustomIcons';

export type Milestone = {
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  status: 'achieved' | 'in-progress' | 'upcoming';
  category: string;
};

export const milestones: Milestone[] = [
  // Achieved Milestones
  {
    title: 'Project Inception',
    description: 'Started development of Nuxchain platform with initial architecture and core features.',
    date: 'Q4 2024',
    icon: <CpuIcon className="w-6 h-6" />,
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
    icon: <AIIcon className="w-6 h-6" />,
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
  {
    title: 'Roadmap Visualization',
    description: 'Comprehensive roadmap interface with interactive components showing development phases, milestones, and timeline visualization.',
    date: 'Q3 2025',
    icon: <LineChartIcon className="w-6 h-6" />,
    status: 'achieved',
    category: 'Features'
  },
  
  // In Progress Milestones
  {
    title: 'NFT Analytics Dashboard',
    description: 'Comprehensive analytics platform for NFT collections with trend prediction, market analysis, and investment optimization tools powered by AI.',
    date: 'Q4 2025',
    icon: <BarChart3Icon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Features'
  },
  {
    title: 'Governance DAO',
    description: 'Decentralized autonomous organization enabling community-driven governance. Vote on proposals, submit ideas, and shape the future of Nuxchain.',
    date: 'Q4 2025',
    icon: <CalendarIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Governance'
  },
  {
    title: 'Nuxbee AI Platform 2.0',
    description: 'Launch of dedicated Nuxbee AI platform with advanced features, deep integration throughout Nuxchain, providing contextual help, automation, and sophisticated tools.',
    date: 'Q1 2026',
    icon: <AIIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Technology'
  },
  {
    title: 'Mobile UX 2.0',
    description: 'Comprehensive update focused on reviewing and optimizing the entire web app for mobile devices, ensuring a seamless and intuitive user experience across all screens.',
    date: 'Q4 2025',
    icon: <GlobeIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Features'
  },
  {
    title: 'Performance System 2.0',
    description: 'Integration of best development and design practices to achieve efficient performance throughout the app codebase, enhancing speed, responsiveness, and scalability.',
    date: 'Q1 2026',
    icon: <LineChartIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Technology'
  },
  {
    title: 'Update Smart Contracts',
    description: 'Update and optimize smart contracts for better performance and security.',
    date: 'Q1 2026',
    icon: <BarChart3Icon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Technology'
  },
  
  // Upcoming Milestones
  {
    title: 'Nuxbee AI Platform',
    description: 'Advanced AI-powered platform with generative AI capabilities. A comprehensive toolset hub for users with sophisticated features and automation tools.',
    date: 'Q2 2026',
    icon: <AIIcon className="w-6 h-6" />,
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

export const getCounts = (list: Milestone[]) => {
  const achieved = list.filter(m => m.status === 'achieved');
  const inProgress = list.filter(m => m.status === 'in-progress');
  const upcoming = list.filter(m => m.status === 'upcoming');
  return {
    achieved,
    inProgress,
    upcoming,
    total: list.length
  };

};

// Progress calculation: achieved count full weight, in-progress half weight (assumption)
export const getProgressPercentage = (list: Milestone[]) => {
  const { achieved, inProgress, total } = getCounts(list);
  if (total === 0) return 0;
  const score = achieved.length + inProgress.length * 0.5;
  return Math.round((score / total) * 100);
};

export default milestones;
