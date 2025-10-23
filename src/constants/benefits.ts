/**
 * ✅ React 19 Best Practice: Centralized constants
 * Extracted from multiple components to:
 * - Reduce bundle size through deduplication
 * - Enable easy i18n integration
 * - Improve testability
 * - Single source of truth
 */

// NFT Tokenization Benefits
export const NFT_BENEFITS = [
  {
    icon: '🎨',
    title: 'Own Your Art',
    description: 'True digital ownership with blockchain verification',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: '💰',
    title: 'Earn Royalties',
    description: 'Get paid every time your NFT is resold',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: '🌍',
    title: 'Global Marketplace',
    description: 'Reach collectors worldwide instantly',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: '🔒',
    title: 'Secure & Permanent',
    description: 'Stored on IPFS and Polygon blockchain forever',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: '⚡',
    title: 'Low Fees',
    description: 'Mint on Polygon for minimal gas costs',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: '🚀',
    title: 'Instant Listing',
    description: 'List for sale immediately after creation',
    color: 'from-indigo-500 to-purple-500'
  }
] as const;

// Platform Benefits (DevHub)
export const PLATFORM_BENEFITS = [
  {
    title: 'Rapid Deployment',
    description: 'Launch your Web3 project in hours, not months. Pre-built smart contracts ready to customize.',
    icon: '⚡'
  },
  {
    title: 'Enterprise Security',
    description: 'Audited smart contracts and battle-tested infrastructure for peace of mind.',
    icon: '🛡️'
  },
  {
    title: 'Full Control',
    description: 'Own your infrastructure. No vendor lock-in. Deploy on any EVM-compatible chain.',
    icon: '🎯'
  },
  {
    title: 'Scalable Architecture',
    description: 'Built to scale from MVP to millions of users without architectural changes.',
    icon: '📈'
  }
] as const;

// Use Cases (DevHub)
export const USE_CASES = [
  {
    icon: '🏢',
    title: 'Startups',
    description: 'Launch your tokenized platform faster with pre-built infrastructure. Focus on product-market fit, not blockchain complexity.',
    examples: ['DeFi protocols', 'Gaming platforms', 'Social tokens']
  },
  {
    icon: '🤝',
    title: 'DAOs',
    description: 'Manage community assets, distribute rewards, and govern transparently with battle-tested smart contracts.',
    examples: ['Treasury management', 'Governance voting', 'Member rewards']
  },
  {
    icon: '👨‍💻',
    title: 'Developers',
    description: 'Build custom Web3 solutions on top of our infrastructure. Full API access and comprehensive documentation.',
    examples: ['Custom dApps', 'Integration services', 'White-label solutions']
  }
] as const;

// Type exports for TypeScript
export type NFTBenefit = typeof NFT_BENEFITS[number];
export type PlatformBenefit = typeof PLATFORM_BENEFITS[number];
export type UseCase = typeof USE_CASES[number];
