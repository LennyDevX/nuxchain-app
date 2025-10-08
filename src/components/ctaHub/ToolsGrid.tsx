import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import FlipCard from './FlipCard';

function ToolsGrid() {
  const isMobile = useIsMobile();

  const tools = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Staking Infrastructure',
      description: 'Deploy secure staking contracts with flexible lock periods and auto-compound rewards for your community.',
      features: ['Custom APY configuration', 'Multi-token support', 'Real-time analytics dashboard'],
      color: 'from-purple-600/20 to-violet-600/20',
      backContent: {
        title: 'For Developers & Startups',
        details: [
          'Pre-audited smart contracts ready to deploy on any EVM chain',
          'Flexible reward distribution mechanisms with customizable parameters',
          'Built-in admin dashboard for managing staking pools and monitoring metrics',
          'Automatic reward calculation and distribution system',
          'Support for multiple lock periods with bonus multipliers',
          'Integration-ready APIs for frontend applications'
        ],
        techStack: ['Solidity', 'Hardhat', 'OpenZeppelin', 'Polygon']
      }
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'NFT Marketplace',
      description: 'Launch your own NFT marketplace with customizable royalties, auctions, and decentralized trading.',
      features: ['Lazy minting (zero gas)', 'Royalty management', 'Auction & fixed price'],
      color: 'from-pink-600/20 to-rose-600/20',
      backContent: {
        title: 'Marketplace Features',
        details: [
          'Complete marketplace infrastructure with buy, sell, and auction functionality',
          'Lazy minting technology to reduce gas costs for creators',
          'Automatic royalty distribution to original creators on secondary sales',
          'Support for ERC-721 and ERC-1155 standards',
          'IPFS integration for decentralized metadata storage',
          'Customizable marketplace fees and commission structures'
        ],
        techStack: ['ERC-721', 'ERC-1155', 'IPFS', 'The Graph']
      }
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      title: 'Token Creation Suite',
      description: 'Create and manage digital assets with our no-code tokenization platform for any use case.',
      features: ['ERC-20/721 standards', 'Instant deployment', 'Token utility builder'],
      color: 'from-blue-600/20 to-cyan-600/20',
      backContent: {
        title: 'Tokenization Tools',
        details: [
          'No-code token creation wizard for ERC-20 and ERC-721 tokens',
          'Configurable token economics (supply, decimals, burnable, mintable)',
          'Built-in vesting schedules and token locks for team allocations',
          'Airdrop tools for community distribution campaigns',
          'Token gating features for exclusive access control',
          'Comprehensive token analytics and holder tracking'
        ],
        techStack: ['ERC-20', 'ERC-721', 'Vesting', 'Merkle Trees']
      }
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Nuvim AI Assistant',
      description: 'Integrate AI-powered chat for customer support, community engagement, and user onboarding.',
      features: ['Context-aware responses', 'Custom knowledge base', 'Multi-language support'],
      color: 'from-indigo-600/20 to-purple-600/20',
      backContent: {
        title: 'AI Integration',
        details: [
          'Embeddable AI chat widget for your dApp or website',
          'Train on your project documentation and smart contract details',
          'Automatic response to common Web3 questions (gas, wallets, transactions)',
          'Real-time blockchain data integration for transaction status',
          'Customizable personality and tone to match your brand',
          'Analytics dashboard to track user interactions and improve responses'
        ],
        techStack: ['Gemini AI', 'RAG', 'Vector DB', 'WebSocket']
      }
    }
  ];

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className="text-center mb-12">
        <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-4`}>
          Complete <span className="text-gradient">Developer Toolkit</span>
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Production-ready infrastructure for every Web3 use case. Click each card to learn more.
        </p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-2 gap-8'}`}>
        {tools.map((tool, index) => (
          <FlipCard key={index} {...tool} />
        ))}
      </div>
    </section>
  );
}

export default ToolsGrid;
