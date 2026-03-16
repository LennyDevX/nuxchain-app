import React from 'react';
import { ZapIcon, BarChart3Icon, GlobeIcon, CpuIcon, AIIcon, LineChartIcon } from '../ui/CustomIcons';

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
    title: 'Smart Contracts v3.0',
    description: 'Development and iteration of innovative smart contract solutions expanding blockchain capabilities, creating new DeFi products, and enhancing cross-chain platform functionality.',
    date: 'Q1 2025',
    icon: <BarChart3Icon className="w-6 h-6" />,
    status: 'achieved',
    category: 'Technology'
  },
  {
    title: 'Developer Tooling Suite',
    description: 'A collection of SDKs, CLIs, and libraries aimed to accelerate building services and platforms on Web3, improving developer productivity and reliability.',
    date: 'Q2 2025',
    icon: <CpuIcon className="w-6 h-6" />,
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
    title: 'Roadmap Visualization',
    description: 'Comprehensive roadmap interface with interactive components showing development phases, milestones, and timeline visualization.',
    date: 'Q3 2025',
    icon: <LineChartIcon className="w-6 h-6" />,
    status: 'achieved',
    category: 'Features'
  },
  {
    title: 'Mobile UX 2.0',
    description: 'Comprehensive update focused on reviewing and optimizing the entire web app for mobile devices, ensuring a seamless and intuitive user experience across all screens.',
    date: 'Q4 2025',
    icon: <GlobeIcon className="w-6 h-6" />,
    status: 'achieved',
    category: 'Features'
  },
  {
    title: 'Performance System 2.0',
    description: 'Integration of best development and design practices to achieve efficient performance throughout the app codebase, enhancing speed, responsiveness, and scalability.',
    date: 'Q1 2026',
    icon: <LineChartIcon className="w-6 h-6" />,
    status: 'achieved',
    category: 'Technology'
  },
  {
    title: 'Nuxbee AI Platform 2.0',
    description: 'Full launch of the Nuxbee AI platform 2.0 — a deeply integrated AI assistant with advanced generative capabilities, contextual DeFi tools, real-time market insights, and cross-chain automation.',
    date: 'Q1 2026',
    icon: <AIIcon className="w-6 h-6" />,
    status: 'achieved',
    category: 'AI'
  },

  // In Progress Milestones
  {
    title: 'Cross-Chain AI Engine',
    description: 'Building the core AI inference layer that operates across multiple blockchains — enabling intelligent routing, cross-chain asset analysis, and unified wallet intelligence.',
    date: 'Q2 2026',
    icon: <AIIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'AI'
  },
  {
    title: 'NuxPass NFTs',
    description: 'Updating tokenization and marketplace contracts. NuxPass NFTs serve as cross-chain identity and access keys, unlocking premium AI features and platform privileges.',
    date: 'Q2 2026',
    icon: <ZapIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Technology'
  },
  {
    title: 'Tokenomics & $NUX Token',
    description: 'Designing and finalizing the economy of the $NUX token — utility across AI services, governance, staking rewards, and cross-chain gas abstraction.',
    date: 'Q2 2026',
    icon: <BarChart3Icon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'DeFi'
  },
  {
    title: 'Labs & Dev Hub',
    description: 'Spaces to experiment and develop new tools for the ecosystem — a sandbox for cross-chain integrations, rapid AI prototyping, and developer collaboration.',
    date: 'Q2 2026',
    icon: <GlobeIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Innovation'
  },
  {
    title: 'Partnerships 1.0',
    description: 'Strategic partnerships with leading blockchain projects, AI protocols, and cross-chain platforms to enhance ecosystem value, increase liquidity, and create synergies.',
    date: 'Q1-Q2 2026',
    icon: <GlobeIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Business'
  },
  {
    title: 'Marketing Campaigns',
    description: 'Initial marketing campaigns to raise awareness and drive user adoption. Strategic initiatives for community building and brand visibility across social media and crypto communities.',
    date: 'Q2 2026',
    icon: <LineChartIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Marketing'
  },
  {
    title: 'DAO Governance',
    description: 'Decentralized autonomous organization enabling community-driven governance. Vote on proposals, submit ideas, and shape the future of Nuxchain with full on-chain voting mechanisms.',
    date: 'Q3 2026',
    icon: <GlobeIcon className="w-6 h-6" />,
    status: 'in-progress',
    category: 'Governance'
  },

  // Upcoming Milestones
  {
    title: 'Nuxchain Cross-Chain Bridge',
    description: 'Native cross-chain bridge enabling seamless asset transfers across Ethereum, Base, Arbitrum, Solana, and emerging L2 networks — with AI-optimized routing for best fees and speed.',
    date: 'Q3 2026',
    icon: <GlobeIcon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'Cross-Chain'
  },
  {
    title: 'AI Agent Marketplace',
    description: 'A marketplace where users can discover, deploy, and monetize specialized AI agents for DeFi strategies, portfolio management, cross-chain arbitrage, and on-chain automation.',
    date: 'Q3 2026',
    icon: <AIIcon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'AI'
  },
  {
    title: 'Nuxbee AI Platform 3.0',
    description: 'The next evolution of Nuxbee AI — multimodal intelligence, autonomous cross-chain agents, predictive analytics, and a personalized AI copilot for every user.',
    date: 'Q4 2026',
    icon: <AIIcon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'AI'
  },
  {
    title: 'Nuxchain Kit',
    description: 'Comprehensive SDK and developer toolkit for building cross-chain AI applications with Nuxchain technology. Modular, open-source components and utilities for the next generation of dApps.',
    date: 'Q4 2026',
    icon: <CpuIcon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'Technology'
  },
  {
    title: 'Re-branding & New Styles',
    description: 'Complete platform re-branding with new visual identity, logo, and design system to reflect our evolution into a cross-chain AI powerhouse.',
    date: 'Q4 2026',
    icon: <ZapIcon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'Features'
  },
  {
    title: 'Physical Branding NFTs',
    description: 'Launch of physical NFT clothing brand with digital integration — bridging real-world identity with on-chain ownership.',
    date: 'Q4 2026',
    icon: <GlobeIcon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'Innovation'
  },
  {
    title: 'Global Expansion & Web Launch',
    description: 'Official public launch of the full web platform. Expansion to new markets, onboarding programs, and cross-chain liquidity partnerships.',
    date: 'Q1 2027',
    icon: <GlobeIcon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'Launch'
  },
  {
    title: 'AI-Powered DeFi Suite',
    description: 'Advanced DeFi tools powered by AI: automated yield optimization across chains, intelligent liquidity provision, on-chain risk scoring, and cross-chain portfolio rebalancing.',
    date: 'Q1 2027',
    icon: <BarChart3Icon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'DeFi'
  },
  {
    title: 'Mobile App Launch',
    description: 'Native iOS and Android apps with full cross-chain AI capabilities — manage assets, run AI agents, and interact with DeFi protocols from your pocket.',
    date: 'Q2 2027',
    icon: <ZapIcon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'Features'
  },
  {
    title: 'Gaming Platform',
    description: 'Cross-chain gaming ecosystem where AI-driven mechanics, NFT ownership, and on-chain rewards create an immersive and rewarding experience.',
    date: 'Q2-Q3 2027',
    icon: <ZapIcon className="w-6 h-6" />,
    status: 'upcoming',
    category: 'Gaming'
  },
  {
    title: 'Enterprise Solutions',
    description: 'Enterprise-grade cross-chain AI infrastructure for institutional clients: white-label tools, compliance layers, custom AI agents, and dedicated support.',
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
