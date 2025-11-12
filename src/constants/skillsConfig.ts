/**
 * Official Skill NFT Configuration - COMPLETE 18-SKILL SYSTEM
 * Covers: Staking Boosts, Staking Automation, Marketplace, Creator, Social, Access, Rewards
 * Used in GameifiedMarketplace smart contract
 */

export const SkillTypeEnum = {
  // Staking Boosts (0-2)
  STAKE_BOOST_I: 0,           // +5% APY
  STAKE_BOOST_II: 1,          // +10% APY
  STAKE_BOOST_III: 2,         // +20% APY
  // Staking Automation (3-5)
  AUTO_COMPOUND: 3,
  LOCK_REDUCER: 4,
  FEE_REDUCER_I: 5,
  // Marketplace (6-9)
  FEE_REDUCER_II: 6,
  PRIORITY_LISTING: 7,
  ROYALTY_BOOSTER: 8,
  BATCH_MINTER: 9,
  // Creator & Social (10-14)
  VERIFIED_CREATOR: 10,
  INFLUENCER: 11,
  CURATOR: 12,
  AMBASSADOR: 13,
  VIP_ACCESS: 14,
  // Exclusive Access (15-17)
  EARLY_ACCESS: 15,           // 24h early access
  PRIVATE_AUCTIONS: 16,       // Subastas privadas
  AIRDROP_MAGNET: 17          // 3x probabilidad airdrop
} as const;

export type SkillTypeEnumType = typeof SkillTypeEnum[keyof typeof SkillTypeEnum];

export interface SkillConfig {
  id: SkillTypeEnumType;
  name: string;
  emoji: string;
  description: string;
  impact: string;
  category: 'staking_boost' | 'staking_automation' | 'marketplace' | 'creator' | 'social' | 'access' | 'rewards';
  tier?: 'I' | 'II' | 'III';
  requiredStaking?: number;
}

/**
 * Official Skill Configurations - All 18 Skills
 * Order matches GameifiedMarketplace.SkillType enum (0-17)
 */
export const SKILL_CONFIGS: SkillConfig[] = [
  // Staking Boosts (0-2)
  {
    id: SkillTypeEnum.STAKE_BOOST_I,
    name: 'Stake Boost I',
    emoji: '📈',
    description: '+5% APY on staked tokens',
    impact: 'Increase staking rewards by 5%',
    category: 'staking_boost',
    tier: 'I',
  },
  {
    id: SkillTypeEnum.STAKE_BOOST_II,
    name: 'Stake Boost II',
    emoji: '📊',
    description: '+10% APY on staked tokens',
    impact: 'Increase staking rewards by 10%',
    category: 'staking_boost',
    tier: 'II',
  },
  {
    id: SkillTypeEnum.STAKE_BOOST_III,
    name: 'Stake Boost III',
    emoji: '�',
    description: '+20% APY on staked tokens',
    impact: 'Increase staking rewards by 20%',
    category: 'staking_boost',
    tier: 'III',
  },
  // Staking Automation (3-5)
  {
    id: SkillTypeEnum.AUTO_COMPOUND,
    name: 'Auto Compound',
    emoji: '🔄',
    description: 'Automatically compound staking rewards',
    impact: 'Rewards automatically reinvested for exponential growth',
    category: 'staking_automation',
  },
  {
    id: SkillTypeEnum.LOCK_REDUCER,
    name: 'Lock Reducer',
    emoji: '🔓',
    description: 'Reduce staking lock periods',
    impact: 'Access to faster unstaking with penalties reduced',
    category: 'staking_automation',
  },
  {
    id: SkillTypeEnum.FEE_REDUCER_I,
    name: 'Fee Reducer I',
    emoji: '💰',
    description: 'Reduce staking fees by 10%',
    impact: 'Pay 10% less on staking operations',
    category: 'staking_automation',
    tier: 'I',
  },
  // Marketplace (6-9)
  {
    id: SkillTypeEnum.FEE_REDUCER_II,
    name: 'Fee Reducer II',
    emoji: '�',
    description: 'Reduce marketplace fees by 20%',
    impact: 'Pay 20% less on trading and listing fees',
    category: 'marketplace',
    tier: 'II',
  },
  {
    id: SkillTypeEnum.PRIORITY_LISTING,
    name: 'Priority Listing',
    emoji: '📌',
    description: 'Get priority placement in marketplace',
    impact: 'NFTs appear at top of marketplace searches',
    category: 'marketplace',
  },
  {
    id: SkillTypeEnum.ROYALTY_BOOSTER,
    name: 'Royalty Booster',
    emoji: '👑',
    description: 'Increase secondary sale royalties by 5%',
    impact: 'Earn more from secondary market sales',
    category: 'marketplace',
  },
  {
    id: SkillTypeEnum.BATCH_MINTER,
    name: 'Batch Minter',
    emoji: '📦',
    description: 'Mint multiple NFTs in one transaction',
    impact: 'Create collections efficiently with batch operations',
    category: 'marketplace',
  },
  // Creator & Social (10-14)
  {
    id: SkillTypeEnum.VERIFIED_CREATOR,
    name: 'Verified Creator',
    emoji: '✅',
    description: 'Get verified creator badge',
    impact: 'Display verified badge on profile and NFTs',
    category: 'creator',
  },
  {
    id: SkillTypeEnum.INFLUENCER,
    name: 'Influencer',
    emoji: '⭐',
    description: 'Influencer status and reach boost',
    impact: 'NFTs get featured in influencer collections',
    category: 'social',
  },
  {
    id: SkillTypeEnum.CURATOR,
    name: 'Curator',
    emoji: '🎯',
    description: 'Curate and manage collections',
    impact: 'Create curated galleries and earn curation fees',
    category: 'creator',
  },
  {
    id: SkillTypeEnum.AMBASSADOR,
    name: 'Ambassador',
    emoji: '🌐',
    description: 'Ambassador program access',
    impact: 'Participate in special ambassador rewards',
    category: 'social',
  },
  {
    id: SkillTypeEnum.VIP_ACCESS,
    name: 'VIP Access',
    emoji: '💎',
    description: 'Exclusive VIP member status',
    impact: 'Access to VIP-only events and early launches',
    category: 'access',
  },
  // Exclusive Access (15-17)
  {
    id: SkillTypeEnum.EARLY_ACCESS,
    name: 'Early Access',
    emoji: '⏰',
    description: '24h early access to new NFT drops',
    impact: 'Access exclusive NFTs 24 hours before public',
    category: 'access',
  },
  {
    id: SkillTypeEnum.PRIVATE_AUCTIONS,
    name: 'Private Auctions',
    emoji: '🔐',
    description: 'Host private auction rooms',
    impact: 'Create exclusive private auctions for selected buyers',
    category: 'access',
  },
  {
    id: SkillTypeEnum.AIRDROP_MAGNET,
    name: 'Airdrop Magnet',
    emoji: '🎁',
    description: '3x probability for airdrops',
    impact: 'Receive airdrops 3x more frequently',
    category: 'rewards',
  },
];

/**
 * Rarity Configuration
 * Affects skill fee and effectiveness
 */
export const RarityEnum = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
} as const;

export type RarityEnumType = typeof RarityEnum[keyof typeof RarityEnum];

export interface RarityConfig {
  id: RarityEnumType;
  name: string;
  emoji: string;
  stars: number;
  color: string;
  skillFee: number; // Fee in POL for additional skills
}

export const RARITY_CONFIGS: RarityConfig[] = [
  {
    id: RarityEnum.COMMON,
    name: 'Common',
    emoji: '⚪',
    stars: 1,
    color: 'from-gray-400 to-gray-600',
    skillFee: 25,
  },
  {
    id: RarityEnum.UNCOMMON,
    name: 'Uncommon',
    emoji: '🟢',
    stars: 2,
    color: 'from-green-400 to-green-600',
    skillFee: 40,
  },
  {
    id: RarityEnum.RARE,
    name: 'Rare',
    emoji: '🔵',
    stars: 3,
    color: 'from-blue-400 to-blue-600',
    skillFee: 60,
  },
  {
    id: RarityEnum.EPIC,
    name: 'Epic',
    emoji: '🟣',
    stars: 4,
    color: 'from-purple-400 to-purple-600',
    skillFee: 80,
  },
  {
    id: RarityEnum.LEGENDARY,
    name: 'Legendary',
    emoji: '🟡',
    stars: 5,
    color: 'from-yellow-400 to-yellow-600',
    skillFee: 100,
  },
];

/**
 * Skill Categories for Filtering and Display
 */
export const SKILL_CATEGORIES = {
  staking_boost: SKILL_CONFIGS.filter(s => s.category === 'staking_boost'),
  staking_automation: SKILL_CONFIGS.filter(s => s.category === 'staking_automation'),
  marketplace: SKILL_CONFIGS.filter(s => s.category === 'marketplace'),
  creator: SKILL_CONFIGS.filter(s => s.category === 'creator'),
  social: SKILL_CONFIGS.filter(s => s.category === 'social'),
  access: SKILL_CONFIGS.filter(s => s.category === 'access'),
  rewards: SKILL_CONFIGS.filter(s => s.category === 'rewards'),
};

/**
 * Helper functions
 */
export const getSkillConfig = (skillTypeId: number): SkillConfig | undefined => {
  return SKILL_CONFIGS.find(s => s.id === skillTypeId);
};

export const getRarityConfig = (rarityId: number): RarityConfig | undefined => {
  return RARITY_CONFIGS.find(r => r.id === rarityId);
};

export const getSkillFee = (rarityId: number, isFirstSkill: boolean = false): number => {
  if (isFirstSkill) return 0; // First skill is always FREE
  const rarity = getRarityConfig(rarityId);
  return rarity?.skillFee || 25;
};

export const calculateTotalSkillFees = (skills: Array<{ rarity: number }>): number => {
  return skills.reduce((total, skill, index) => {
    return total + getSkillFee(skill.rarity, index === 0);
  }, 0);
};

/**
 * Display Helpers
 */
export const formatSkillDisplay = (skillTypeId: number): string => {
  const skill = getSkillConfig(skillTypeId);
  return skill ? `${skill.emoji} ${skill.name}` : 'Unknown Skill';
};

export const formatSkillDisplayWithBenefit = (skillTypeId: number): string => {
  const skill = getSkillConfig(skillTypeId);
  if (!skill) return 'Unknown Skill';
  
  // Extract the benefit from description (e.g., "+5%" from "+5% APY on staked tokens")
  const benefit = skill.description.match(/[+]?\d+%/)?.[0] || '';
  
  return skill ? `${skill.emoji} ${skill.name} ${benefit}`.trim() : 'Unknown Skill';
};

export const formatRarityDisplay = (rarityId: number): string => {
  const rarity = getRarityConfig(rarityId);
  if (!rarity) return 'Unknown';
  return `${rarity.emoji} ${rarity.name} (${'⭐'.repeat(rarity.stars)})`;
};

export const getCategoryLabel = (category: SkillConfig['category']): string => {
  const labels: Record<SkillConfig['category'], string> = {
    staking_boost: 'Staking Boosts',
    staking_automation: 'Staking Automation',
    marketplace: 'Marketplace',
    creator: 'Creator',
    social: 'Social',
    access: 'Exclusive Access',
    rewards: 'Rewards',
  };
  return labels[category] || category;
};
