/**
 * Official Skill NFT Configuration
 * 7 Staking-Focused Skills with Emojis and Effects
 * Used in GameifiedMarketplace smart contract
 */

export const SkillTypeEnum = {
  STAKE_BOOST_I: 0,
  STAKE_BOOST_II: 1,
  STAKE_BOOST_III: 2,
  AUTO_COMPOUND: 3,
  LOCK_REDUCER: 4,
  FEE_REDUCER_I: 5,
  FEE_REDUCER_II: 6,
} as const;

export type SkillTypeEnumType = typeof SkillTypeEnum[keyof typeof SkillTypeEnum];

export interface SkillConfig {
  id: SkillTypeEnumType;
  name: string;
  emoji: string;
  description: string;
  impact: string;
  category: 'boost' | 'automation' | 'liquidity' | 'savings';
  tier?: 'I' | 'II' | 'III';
}

/**
 * Official Skill Configurations
 * Order matches IStakingIntegration.SkillType enum (0-6)
 */
export const SKILL_CONFIGS: SkillConfig[] = [
  {
    id: SkillTypeEnum.STAKE_BOOST_I,
    name: 'Stake Boost I',
    emoji: '📈',
    description: 'Increases ROI base by +5%',
    impact: 'More staking rewards per hour/day',
    category: 'boost',
    tier: 'I',
  },
  {
    id: SkillTypeEnum.STAKE_BOOST_II,
    name: 'Stake Boost II',
    emoji: '📊',
    description: 'Increases ROI base by +10%',
    impact: 'Even higher staking rewards',
    category: 'boost',
    tier: 'II',
  },
  {
    id: SkillTypeEnum.STAKE_BOOST_III,
    name: 'Stake Boost III',
    emoji: '💹',
    description: 'Increases ROI base by +20%',
    impact: 'Maximum reward boost',
    category: 'boost',
    tier: 'III',
  },
  {
    id: SkillTypeEnum.AUTO_COMPOUND,
    name: 'Auto Compound',
    emoji: '🔄',
    description: 'Activates auto-compound every 24h',
    impact: 'Rewards automatically reinvested, maximizing APY',
    category: 'automation',
  },
  {
    id: SkillTypeEnum.LOCK_REDUCER,
    name: 'Lock Reducer',
    emoji: '🔓',
    description: 'Reduces lock-up time by -25%',
    impact: 'Allows earlier withdrawals, more flexibility',
    category: 'liquidity',
  },
  {
    id: SkillTypeEnum.FEE_REDUCER_I,
    name: 'Fee Reducer I',
    emoji: '💰',
    description: 'Reduces withdrawal commission by -10%',
    impact: 'Lower fees when claiming rewards',
    category: 'savings',
    tier: 'I',
  },
  {
    id: SkillTypeEnum.FEE_REDUCER_II,
    name: 'Fee Reducer II',
    emoji: '💸',
    description: 'Reduces withdrawal commission by -25%',
    impact: 'Minimal fees when claiming rewards',
    category: 'savings',
    tier: 'II',
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
 * Skill Tiers for Display
 * Groups related skills by tier
 */
export const SKILL_TIERS = {
  boosts: SKILL_CONFIGS.filter(s => s.category === 'boost'),
  automation: SKILL_CONFIGS.filter(s => s.category === 'automation'),
  liquidity: SKILL_CONFIGS.filter(s => s.category === 'liquidity'),
  savings: SKILL_CONFIGS.filter(s => s.category === 'savings'),
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
  
  // Extract the benefit from description (e.g., "+5%" from "Increases ROI base by +5%")
  const benefit = skill.description.match(/[+]?\d+%/)?.[0] || '';
  
  return skill ? `${skill.emoji} ${skill.name} ${benefit}`.trim() : 'Unknown Skill';
};

export const formatRarityDisplay = (rarityId: number): string => {
  const rarity = getRarityConfig(rarityId);
  if (!rarity) return 'Unknown';
  return `${rarity.emoji} ${rarity.name} (${'⭐'.repeat(rarity.stars)})`;
};
