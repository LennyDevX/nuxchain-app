export interface AvatarSlot {
  id: number;
  tokenId: number;
  image: string;
  name: string;
  role: string;
  rarity: 1 | 2 | 3 | 4; // 1=Legendary, 2=Epic, 3=Rare, 4=Uncommon
  rarityName: string;
  description: string;
  // Real benefits based on contract mechanics
  benefits: string[];
  // Real requirements - just need the badge
  requirements: string[];
  categoryId: 'community' | 'content' | 'technical' | 'business';
  skillType: number;
  // Quest-specific info (role-based quest access)
  questAccess: string;
}

// Real contract values:
// - Claim fee: 2% default (tiered: 2% → 1.5% → 1% based on volume)
// - Rewards come from completing quests (not revenue share %)
// - Contract receives 25% of protocol revenue to fund quest rewards

export const AVATAR_SLOTS: AvatarSlot[] = [
  {
    id: 1,
    tokenId: 1,
    image: '/AvatarsNFTs/Avatar1.png',
    name: 'Genesis Visionary',
    role: 'Elite Collaborator',
    rarity: 1,
    rarityName: 'Legendary',
    description: 'The first collaborator slot. Highest visibility and priority access to high-value quests.',
    benefits: [
      'Access to all active quests',
      '2% claim fee (reduces to 1% with volume)',
      'Priority quest notifications',
      'Early access to new quest types'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete quests to earn POL rewards',
      'Claim rewards anytime (fee applies)'
    ],
    categoryId: 'business',
    skillType: 3,
    questAccess: 'All quest categories + Premium quests'
  },
  {
    id: 2,
    tokenId: 2,
    image: '/AvatarsNFTs/Avatar2.png',
    name: 'Protocol Architect',
    role: 'Technical Lead',
    rarity: 1,
    rarityName: 'Legendary',
    description: 'Elite technical position with access to development and security quests.',
    benefits: [
      'Access to technical quests (dev, security, testing)',
      '2% claim fee (reduces to 1% with volume)',
      'Priority for bug bounty quests',
      'Beta testing quest access'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete technical quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'technical',
    skillType: 0,
    questAccess: 'Technical + Security + Beta testing quests'
  },
  {
    id: 3,
    tokenId: 3,
    image: '/AvatarsNFTs/Avatar3.png',
    name: 'Community Sovereign',
    role: 'Community Director',
    rarity: 1,
    rarityName: 'Legendary',
    description: 'Ultimate community leadership with access to moderation and event quests.',
    benefits: [
      'Access to community quests (mod, events, support)',
      '2% claim fee (reduces to 1% with volume)',
      'Event organization quest priority',
      'Community ambassador quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete community quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'community',
    skillType: 4,
    questAccess: 'Community + Events + Moderation quests'
  },
  {
    id: 4,
    tokenId: 4,
    image: '/AvatarsNFTs/Avatar4.png',
    name: 'Brand Ambassador Prime',
    role: 'Head of Content',
    rarity: 2,
    rarityName: 'Epic',
    description: 'Premier content creation role with access to marketing and content quests.',
    benefits: [
      'Access to content quests (social, articles, videos)',
      '2% claim fee (reduces to 1.5% → 1% with volume)',
      'Sponsored content quest priority',
      'Influencer campaign quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete content quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'content',
    skillType: 2,
    questAccess: 'Content + Marketing + Social quests'
  },
  {
    id: 5,
    tokenId: 5,
    image: '/AvatarsNFTs/Avatar5.png',
    name: 'Investment Partner',
    role: 'Strategic Investor',
    rarity: 2,
    rarityName: 'Epic',
    description: 'Key strategic investor with access to business development quests.',
    benefits: [
      'Access to business quests (partnerships, BD)',
      '2% claim fee (reduces to 1.5% → 1% with volume)',
      'Strategic partnership quest priority',
      'Investor relation quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete business quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'business',
    skillType: 3,
    questAccess: 'Business + Partnership + Investor quests'
  },
  {
    id: 6,
    tokenId: 6,
    image: '/AvatarsNFTs/Avatar6.png',
    name: 'Security Guardian',
    role: 'Security Lead',
    rarity: 2,
    rarityName: 'Epic',
    description: 'Elite security research position with access to security audit quests.',
    benefits: [
      'Access to security quests (audits, bug bounties)',
      '2% claim fee (reduces to 1.5% → 1% with volume)',
      'Bug bounty quest priority',
      'Security research quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete security quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'technical',
    skillType: 0,
    questAccess: 'Security + Audit + Bug bounty quests'
  },
  {
    id: 7,
    tokenId: 7,
    image: '/AvatarsNFTs/Avatar7.png',
    name: 'Moderator Elite',
    role: 'Senior Moderator',
    rarity: 3,
    rarityName: 'Rare',
    description: 'Advanced community moderation with access to moderation quests.',
    benefits: [
      'Access to moderation quests',
      '2% claim fee (reduces to 1.5% → 1% with volume)',
      'Community management quests',
      'Support-related quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete moderation quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'community',
    skillType: 4,
    questAccess: 'Moderation + Community management quests'
  },
  {
    id: 8,
    tokenId: 8,
    image: '/AvatarsNFTs/Avatar8.png',
    name: 'Content Creator Pro',
    role: 'Verified Creator',
    rarity: 3,
    rarityName: 'Rare',
    description: 'Established content creator with access to content creation quests.',
    benefits: [
      'Access to content creation quests',
      '2% claim fee (reduces to 1.5% → 1% with volume)',
      'Educational content quests',
      'Tutorial creation quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete content quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'content',
    skillType: 2,
    questAccess: 'Content creation + Educational quests'
  },
  {
    id: 9,
    tokenId: 9,
    image: '/AvatarsNFTs/Avatar9.png',
    name: 'Core Developer',
    role: 'Developer',
    rarity: 3,
    rarityName: 'Rare',
    description: 'Core development team member with access to development quests.',
    benefits: [
      'Access to development quests',
      '2% claim fee (reduces to 1.5% → 1% with volume)',
      'Feature testing quests',
      'Code contribution quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete development quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'technical',
    skillType: 0,
    questAccess: 'Development + Testing quests'
  },
  {
    id: 10,
    tokenId: 10,
    image: '/AvatarsNFTs/Avatar10.png',
    name: 'Community Guardian',
    role: 'Ambassador',
    rarity: 4,
    rarityName: 'Uncommon',
    description: 'Community ambassador with access to onboarding and event quests.',
    benefits: [
      'Access to ambassador quests',
      '2% claim fee (reduces to 1.5% → 1% with volume)',
      'Onboarding quests',
      'Event participation quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete ambassador quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'community',
    skillType: 4,
    questAccess: 'Ambassador + Onboarding + Event quests'
  },
  {
    id: 11,
    tokenId: 11,
    image: '/AvatarsNFTs/Avatar11.png',
    name: 'Beta Pioneer',
    role: 'Beta Tester',
    rarity: 4,
    rarityName: 'Uncommon',
    description: 'Early adopter and beta tester with access to testing quests.',
    benefits: [
      'Access to beta testing quests',
      '2% claim fee (reduces to 1.5% → 1% with volume)',
      'Feature feedback quests',
      'Bug reporting quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete testing quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'technical',
    skillType: 0,
    questAccess: 'Beta testing + Feedback quests'
  },
  {
    id: 12,
    tokenId: 12,
    image: '/AvatarsNFTs/Avatar12.png',
    name: 'Business Associate',
    role: 'Partner',
    rarity: 4,
    rarityName: 'Uncommon',
    description: 'Business development partner with access to growth quests.',
    benefits: [
      'Access to growth quests',
      '2% claim fee (reduces to 1.5% → 1% with volume)',
      'Partnership quests',
      'Network expansion quests'
    ],
    requirements: [
      'Hold this Collaborator Badge NFT',
      'Complete growth quests to earn POL',
      'Claim rewards with tiered fees'
    ],
    categoryId: 'business',
    skillType: 3,
    questAccess: 'Growth + Partnership quests'
  }
];

// Contract Reward Info - Based on actual smart contract
export const CONTRACT_REWARD_INFO = {
  // Fee structure from contract (line 184-186)
  claimFeeDefault: 2, // 2% default (200 BPS)
  claimFeeTiers: [
    { volume: '0 POL', volumeWei: 0, fee: 2 },
    { volume: '10 POL', volumeWei: '10000000000000000000', fee: 1.5 },
    { volume: '50 POL', volumeWei: '50000000000000000000', fee: 1 }
  ],
  // Revenue source (line 14-16)
  revenueSource: '25% of ALL protocol revenue (staking + marketplace + quest fees)',
  // How rewards work
  rewardMechanism: 'Complete quests → Earn POL → Claim with tiered fee',
  // Max limits from contract (lines 178-180)
  maxRewardPerQuest: '500 POL',
  maxPendingPerUser: '1000 POL',
  maxContractBalance: '10000 POL'
};

export function getRarityColor(rarity: number): string {
  switch (rarity) {
    case 1: return '#f59e0b'; // Legendary - Orange/Amber
    case 2: return '#ec4899'; // Epic - Pink
    case 3: return '#8b5cf6'; // Rare - Purple
    case 4: return '#10b981'; // Uncommon - Emerald
    default: return '#6b7280';
  }
}

export function getRarityGradient(rarity: number): string {
  switch (rarity) {
    case 1: return 'from-amber-500 to-orange-600'; // Legendary
    case 2: return 'from-pink-500 to-rose-600'; // Epic
    case 3: return 'from-purple-500 to-indigo-600'; // Rare
    case 4: return 'from-emerald-500 to-teal-600'; // Uncommon
    default: return 'from-gray-500 to-gray-600';
  }
}

export const TOTAL_AVATAR_SLOTS = 12;
