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
    title: 'Create Powerful Skill NFTs',
    description: 'Transform NFTs with gamified staking superpowers and abilities',
    fullDescription: 'Transform standard NFTs into powerful Skill NFTs with up to 5 different staking-focused skills. Choose from 7 skill types: 📈 Stake Boost (I/II/III increase ROI by 5/10/20%), 🔄 Auto Compound (reinvests rewards every 24h), 🔓 Lock Reducer (reduce lock-up by 25%), or 💰/💸 Fee Reducers (reduce withdrawal fees by 10-25%). Each skill has an Effect Value (1-100) and Rarity (Common to Legendary). Skill NFTs are exponentially more valuable and sought-after by stakers and yield farmers.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: '🎨',
    title: 'True Digital Ownership',
    description: 'Immutable ownership secured by blockchain technology',
    fullDescription: 'Establish unquestionable proof of ownership through blockchain technology. Your digital creations are permanently recorded on an immutable ledger, protected by cryptographic signatures. No platform can revoke or delete your assets.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: '💰',
    title: 'Automatic Royalties',
    description: 'Earn passive income from every resale forever',
    fullDescription: 'Set a royalty percentage (0-10%) during creation. Every subsequent sale of your NFT automatically sends your royalty share directly to your wallet. Earn passive income indefinitely—even if you\'re no longer actively creating.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: '🏆',
    title: 'Premium Value Multiplier',
    description: 'Skill NFTs worth 3-10x more than standard NFTs',
    fullDescription: 'Skill NFTs are dramatically more valuable than standard NFTs. The combination of visual appeal + gamified staking abilities creates premium demand. Stakers actively seek NFTs with Stake Boost, Auto Compound, and Fee Reducer skills to maximize yields. First skill is FREE to mint, additional skills cost 25-100 POL based on rarity. Users with 200+ POL staked unlock the ability to create these premium assets.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: ' 🌍',
    title: 'Borderless Marketplace',
    description: 'Connect with millions of collectors worldwide 24/7',
    fullDescription: 'Access a borderless marketplace with millions of collectors from every continent. Your NFT can be discovered and purchased 24/7 by anyone with a crypto wallet. No geographic restrictions or licensing complications.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: '🔒',
    title: 'Permanent Security',
    description: 'Decentralized storage with blockchain immutability',
    fullDescription: 'Your NFT metadata and skills are stored on IPFS (decentralized storage) with automatic replication across thousands of nodes. The blockchain records ensure permanent, tamper-proof existence. Skills are immutable once minted—guaranteeing authenticity and preventing fraud.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: '⚙️',
    title: 'Advanced Skill System',
    description: 'Complete control over gamified NFT abilities',
    fullDescription: 'Configure up to 5 skills per NFT with granular control: choose from 7 official skill types (3x Stake Boosts, Auto Compound, Lock Reducer, 2x Fee Reducers), set effect values to customize impact levels (1-100), and select rarities from Common (1★) to Legendary (5★). Higher rarities unlock stronger bonuses: Stake Boosts increase ROI efficiency, Auto Compound maximizes APY, Lock Reducer improves liquidity, Fee Reducers minimize withdrawal costs.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: '⚡',
    title: 'Ultra-Low Fees',
    description: 'Mint for cents instead of dollars on Polygon',
    fullDescription: 'Polygon offers 100x lower transaction fees than Ethereum mainnet while maintaining identical security. First skill is completely FREE. Additional skills cost only 25-100 POL. Pay cents instead of hundreds of dollars. More profit stays in your pocket with every sale and interaction.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: '🚀',
    title: 'Instant Market Access',
    description: 'Sell immediately after minting with no delays',
    fullDescription: 'No waiting periods or approval processes. The moment your Standard or Skill NFT is minted, it\'s ready to sell. Tap into market momentum instantly. Multiple listing options across all major marketplaces at once.',
    color: 'from-indigo-500 to-purple-500'
  }
] as const;

// Platform Benefits (DevHub)
export const PLATFORM_BENEFITS = [
  {
    title: 'Lightning-Fast Deployment',
    description: 'Launch Web3 projects in hours with pre-built smart contracts',
    icon: '⚡'
  },
  {
    title: 'Enterprise-Grade Security',
    description: 'Audited contracts and battle-tested infrastructure',
    icon: '🛡️'
  },
  {
    title: 'Complete Control',
    description: 'Own infrastructure with no vendor lock-in',
    icon: '🎯'
  },
  {
    title: 'Infinite Scalability',
    description: 'Scale from MVP to millions without architectural changes',
    icon: '📈'
  }
] as const;

// Use Cases (DevHub)
export const USE_CASES = [
  {
    icon: '🏢',
    title: 'Web3 Startups',
    description: 'Launch tokenized platforms rapidly with pre-built infrastructure',
    examples: ['DeFi protocols', 'Gaming platforms', 'Social tokens']
  },
  {
    icon: '🤝',
    title: 'DAO Management',
    description: 'Transparent governance with battle-tested smart contracts',
    examples: ['Treasury management', 'Governance voting', 'Member rewards']
  },
  {
    icon: '👨‍💻',
    title: 'Web3 Development',
    description: 'Build custom solutions with full API access and documentation',
    examples: ['Custom dApps', 'Integration services', 'White-label solutions']
  }
] as const;

// Type exports for TypeScript
export type NFTBenefit = typeof NFT_BENEFITS[number];
export type PlatformBenefit = typeof PLATFORM_BENEFITS[number];
export type UseCase = typeof USE_CASES[number];
