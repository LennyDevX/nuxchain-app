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
    icon: '⚡',
    title: 'Create Skill NFTs',
    description: 'Add superpowers to your NFTs with built-in staking abilities',
    fullDescription: 'Transform standard NFTs into powerful Skill NFTs with up to 5 different staking-focused skills. Choose from 7 skill types: 📈 Stake Boost (I/II/III increase ROI by 5/10/20%), 🔄 Auto Compound (reinvests rewards every 24h), 🔓 Lock Reducer (reduce lock-up by 25%), or 💰/💸 Fee Reducers (reduce withdrawal fees by 10-25%). Each skill has an Effect Value (1-100) and Rarity (Common to Legendary). Skill NFTs are exponentially more valuable and sought-after by stakers and yield farmers.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: '🎨',
    title: 'Own Your Art',
    description: 'True digital ownership with blockchain verification',
    fullDescription: 'Establish unquestionable proof of ownership through blockchain technology. Your digital creations are permanently recorded on an immutable ledger, protected by cryptographic signatures. No platform can revoke or delete your assets.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: '💰',
    title: 'Earn Royalties',
    description: 'Get paid every time your NFT is resold',
    fullDescription: 'Set a royalty percentage (0-10%) during creation. Every subsequent sale of your NFT automatically sends your royalty share directly to your wallet. Earn passive income indefinitely—even if you\'re no longer actively creating.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: '🏆',
    title: 'Skill NFT Premium Value',
    description: 'Skill NFTs command 3-10x higher prices',
    fullDescription: 'Skill NFTs are dramatically more valuable than standard NFTs. The combination of visual appeal + gamified staking abilities creates premium demand. Stakers actively seek NFTs with Stake Boost, Auto Compound, and Fee Reducer skills to maximize yields. First skill is FREE to mint, additional skills cost 25-100 POL based on rarity. Users with 200+ POL staked unlock the ability to create these premium assets.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: '�🌍',
    title: 'Global Marketplace',
    description: 'Reach collectors worldwide instantly',
    fullDescription: 'Access a borderless marketplace with millions of collectors from every continent. Your NFT can be discovered and purchased 24/7 by anyone with a crypto wallet. No geographic restrictions or licensing complications.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: '🔒',
    title: 'Secure & Permanent',
    description: 'Stored on IPFS and Polygon blockchain forever',
    fullDescription: 'Your NFT metadata and skills are stored on IPFS (decentralized storage) with automatic replication across thousands of nodes. The blockchain records ensure permanent, tamper-proof existence. Skills are immutable once minted—guaranteeing authenticity and preventing fraud.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: '⚙️',
    title: 'Skill System Mechanics',
    description: 'Full control over your NFT\'s gamified properties',
    fullDescription: 'Configure up to 5 skills per NFT with granular control: choose from 7 official skill types (3x Stake Boosts, Auto Compound, Lock Reducer, 2x Fee Reducers), set effect values to customize impact levels (1-100), and select rarities from Common (1★) to Legendary (5★). Higher rarities unlock stronger bonuses: Stake Boosts increase ROI efficiency, Auto Compound maximizes APY, Lock Reducer improves liquidity, Fee Reducers minimize withdrawal costs.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: '⚡',
    title: 'Low Fees',
    description: 'Mint on Polygon for minimal gas costs',
    fullDescription: 'Polygon offers 100x lower transaction fees than Ethereum mainnet while maintaining identical security. First skill is completely FREE. Additional skills cost only 25-100 POL. Pay cents instead of hundreds of dollars. More profit stays in your pocket with every sale and interaction.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: '🚀',
    title: 'Instant Listing',
    description: 'List for sale immediately after creation',
    fullDescription: 'No waiting periods or approval processes. The moment your Standard or Skill NFT is minted, it\'s ready to sell. Tap into market momentum instantly. Multiple listing options across all major marketplaces at once.',
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
