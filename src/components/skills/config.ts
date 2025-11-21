/**
 * Skills Configuration
 * Defines skill types, rarities, effects, and descriptions
 * Matches IStakingIntegration.sol contract: 17 skill types
 * TOTAL: 17 skills × 5 rarities = 85 combinations
 */

// Define skill types that match the contract (1-16) - using const as Record
// NOTE: NONE (0) is not displayed in UI
export const SkillType = {
  STAKE_BOOST_I: 1,      // +5% APY
  STAKE_BOOST_II: 2,     // +10% APY
  STAKE_BOOST_III: 3,    // +20% APY
  AUTO_COMPOUND: 4,      // Automatic compounding
  LOCK_REDUCER: 5,       // -25% lock time
  FEE_REDUCER_I: 6,      // -10% platform fees
  FEE_REDUCER_II: 7,     // -25% platform fees
  PRIORITY_LISTING: 8,   // Featured on homepage
  BATCH_MINTER: 9,       // Mint multiple NFTs
  VERIFIED_CREATOR: 10,  // Verified badge
  INFLUENCER: 11,        // 2x weight on likes/comments
  CURATOR: 12,           // Can create featured collections
  AMBASSADOR: 13,        // 2x referral bonus
  VIP_ACCESS: 14,        // Access to exclusive drops
  EARLY_ACCESS: 15,      // 24h early access
  PRIVATE_AUCTIONS: 16,  // Access to private auctions
} as const;

export type SkillType = typeof SkillType[keyof typeof SkillType];

// Rarity types
export const Rarity = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
} as const;

export type Rarity = typeof Rarity[keyof typeof Rarity];

export interface SkillEffectConfig {
  label: string; // What the skill does (e.g., "Coding Mastery", "Design Excellence")
  effectFormat: (value: number) => string; // How to display the effect (e.g., "+5% Fee Discount")
  description: string;
  color: string; // Visual indicator color
}

// Names mapping
export const SKILL_TYPE_NAMES: Record<SkillType, string> = {
  [SkillType.STAKE_BOOST_I]: 'Stake Boost I',
  [SkillType.STAKE_BOOST_II]: 'Stake Boost II',
  [SkillType.STAKE_BOOST_III]: 'Stake Boost III',
  [SkillType.AUTO_COMPOUND]: 'Auto Compound',
  [SkillType.LOCK_REDUCER]: 'Lock Reducer',
  [SkillType.FEE_REDUCER_I]: 'Fee Reducer I',
  [SkillType.FEE_REDUCER_II]: 'Fee Reducer II',
  [SkillType.PRIORITY_LISTING]: 'Priority Listing',
  [SkillType.BATCH_MINTER]: 'Batch Minter',
  [SkillType.VERIFIED_CREATOR]: 'Verified Creator',
  [SkillType.INFLUENCER]: 'Influencer',
  [SkillType.CURATOR]: 'Curator',
  [SkillType.AMBASSADOR]: 'Ambassador',
  [SkillType.VIP_ACCESS]: 'VIP Access',
  [SkillType.EARLY_ACCESS]: 'Early Access',
  [SkillType.PRIVATE_AUCTIONS]: 'Private Auctions',
};

export const RARITY_NAMES: Record<Rarity, string> = {
  [Rarity.COMMON]: 'Common',
  [Rarity.UNCOMMON]: 'Uncommon',
  [Rarity.RARE]: 'Rare',
  [Rarity.EPIC]: 'Epic',
  [Rarity.LEGENDARY]: 'Legendary',
};

// Effect configurations by skill type - 17 types from contract
export const SKILL_EFFECTS: Record<SkillType, SkillEffectConfig> = {
  // === STAKING SKILLS (7) - Affect staking rewards ===
  [SkillType.STAKE_BOOST_I]: {
    label: 'Staking APY Boost',
    effectFormat: (value: number) => `+${value}% APY`,
    description: 'Increases your staking rewards by 5% annually',
    color: '#48BB78',
  },
  [SkillType.STAKE_BOOST_II]: {
    label: 'Staking APY Boost',
    effectFormat: (value: number) => `+${value}% APY`,
    description: 'Significantly boosts your staking rewards by 10% annually',
    color: '#4299E1',
  },
  [SkillType.STAKE_BOOST_III]: {
    label: 'Staking APY Boost',
    effectFormat: (value: number) => `+${value}% APY`,
    description: 'Maximizes your staking rewards with a 15% base APY boost (highest tier)',
    color: '#9F7AEA',
  },
  [SkillType.AUTO_COMPOUND]: {
    label: 'Auto Compound',
    effectFormat: () => 'Auto-Reinvest',
    description: 'Automatically compounds your staking rewards daily for exponential growth',
    color: '#ED8936',
  },
  [SkillType.LOCK_REDUCER]: {
    label: 'Lock Time Reduction',
    effectFormat: (value: number) => `-${value}% Lock Time`,
    description: 'Reduces required lock period, access your funds faster (up to -45% at LEGENDARY)',
    color: '#38B2AC',
  },
  [SkillType.FEE_REDUCER_I]: {
    label: 'Platform Fee Discount',
    effectFormat: (value: number) => `-${value}% Fees`,
    description: 'Save 10% on all platform transaction fees',
    color: '#F687B3',
  },
  [SkillType.FEE_REDUCER_II]: {
    label: 'Platform Fee Discount',
    effectFormat: (value: number) => `-${value}% Fees`,
    description: 'Save up to 45% on all platform transaction fees for power users',
    color: '#D53F8C',
  },
  // === ACTIVE SKILLS (10) - Platform features ===
  [SkillType.PRIORITY_LISTING]: {
    label: 'Priority Listing',
    effectFormat: () => 'Featured Placement',
    description: 'Your NFTs are featured prominently on the homepage and category pages',
    color: '#F59E0B',
  },
  [SkillType.BATCH_MINTER]: {
    label: 'Batch Minting',
    effectFormat: () => 'Multi-Mint',
    description: 'Mint multiple NFTs in a single transaction, saving time and gas fees',
    color: '#8B5CF6',
  },
  [SkillType.VERIFIED_CREATOR]: {
    label: 'Verified Badge',
    effectFormat: () => 'Verified ✓',
    description: 'Display a verified creator badge, building trust with buyers',
    color: '#3B82F6',
  },
  [SkillType.INFLUENCER]: {
    label: 'Social Influence',
    effectFormat: (value: number) => `${value}x Social Weight`,
    description: 'Your likes and comments have 2x weight in trending algorithms',
    color: '#EC4899',
  },
  [SkillType.CURATOR]: {
    label: 'Collection Curator',
    effectFormat: () => 'Curator Access',
    description: 'Create and manage featured collections to showcase top NFTs',
    color: '#10B981',
  },
  [SkillType.AMBASSADOR]: {
    label: 'Ambassador Rewards',
    effectFormat: (value: number) => `${value}x Referral`,
    description: 'Earn 2x referral bonuses for bringing new users to the platform',
    color: '#F59E0B',
  },
  [SkillType.VIP_ACCESS]: {
    label: 'VIP Exclusive',
    effectFormat: () => 'VIP Only',
    description: 'Access exclusive NFT drops and private collections before anyone else',
    color: '#8B5CF6',
  },
  [SkillType.EARLY_ACCESS]: {
    label: 'Early Access',
    effectFormat: () => '24h Early',
    description: 'Get 24-hour early access to all new NFT launches and features',
    color: '#06B6D4',
  },
  [SkillType.PRIVATE_AUCTIONS]: {
    label: 'Private Auctions',
    effectFormat: () => 'Private Access',
    description: 'Participate in exclusive private auctions with premium NFTs',
    color: '#7C3AED',
  },
};

// Rarity color mapping
export const RARITY_COLOR_MAP: Record<Rarity, string> = {
  [Rarity.COMMON]: '#A0AEC0',
  [Rarity.UNCOMMON]: '#48BB78',
  [Rarity.RARE]: '#4299E1',
  [Rarity.EPIC]: '#9F7AEA',
  [Rarity.LEGENDARY]: '#ED8936',
};

// Skill icons - one per skill type (17 total)
export const SKILL_ICONS: Record<SkillType, string> = {
  [SkillType.STAKE_BOOST_I]: '📈',
  [SkillType.STAKE_BOOST_II]: '🚀',
  [SkillType.STAKE_BOOST_III]: '⚡',
  [SkillType.AUTO_COMPOUND]: '♻️',
  [SkillType.LOCK_REDUCER]: '🔓',
  [SkillType.FEE_REDUCER_I]: '💰',
  [SkillType.FEE_REDUCER_II]: '💎',
  [SkillType.PRIORITY_LISTING]: '⭐',
  [SkillType.BATCH_MINTER]: '📦',
  [SkillType.VERIFIED_CREATOR]: '✅',
  [SkillType.INFLUENCER]: '🎯',
  [SkillType.CURATOR]: '🎨',
  [SkillType.AMBASSADOR]: '🤝',
  [SkillType.VIP_ACCESS]: '👑',
  [SkillType.EARLY_ACCESS]: '⏰',
  [SkillType.PRIVATE_AUCTIONS]: '🔒',
};

// CRITICAL: Effect values MUST vary by SKILL TYPE, not just rarity
// Otherwise expensive skills (STAKE_BOOST_III) would have same APY as cheap ones (STAKE_BOOST_I)
// 
// STAKE_BOOST_I (base): +5% APY baseline
// - COMMON: 5%, UNCOMMON: 7%, RARE: 9%, EPIC: 12%, LEGENDARY: 16%
//
// STAKE_BOOST_II (1.5x cost): +10% APY baseline  
// - COMMON: 10%, UNCOMMON: 13%, RARE: 16%, EPIC: 21%, LEGENDARY: 28%
//
// STAKE_BOOST_III (2.2x cost): +15% APY baseline
// - COMMON: 15%, UNCOMMON: 19%, RARE: 23%, EPIC: 30%, LEGENDARY: 38%
//
// DEFAULT (used as fallback for non-staking skills)
export const EFFECT_VALUES_BY_RARITY: Record<Rarity, number> = {
  [Rarity.COMMON]: 5,
  [Rarity.UNCOMMON]: 10,
  [Rarity.RARE]: 15,
  [Rarity.EPIC]: 25,
  [Rarity.LEGENDARY]: 50,
};

/**
 * Get skill effect value based on skill type and rarity
 * Each skill type has its own impact curve per rarity level
 * Staking skills (1-7): APY percentage
 * Marketplace skills (8-16): Text/multiplier display values
 */
export function getSkillEffectByType(skillType: SkillType, rarity: Rarity): number {
  // Staking skill impact values (APY percentages)
  const stakingEffects: Record<SkillType, Record<Rarity, number>> = {
    // STAKE_BOOST_I (1.0x cost): +5% baseline
    [SkillType.STAKE_BOOST_I]: {
      [Rarity.COMMON]: 5,
      [Rarity.UNCOMMON]: 7,
      [Rarity.RARE]: 9,
      [Rarity.EPIC]: 12,
      [Rarity.LEGENDARY]: 16,
    },
    // STAKE_BOOST_II (1.5x cost): +10% baseline
    [SkillType.STAKE_BOOST_II]: {
      [Rarity.COMMON]: 10,
      [Rarity.UNCOMMON]: 13,
      [Rarity.RARE]: 16,
      [Rarity.EPIC]: 21,
      [Rarity.LEGENDARY]: 28,
    },
    // STAKE_BOOST_III (2.2x cost): +15% baseline
    [SkillType.STAKE_BOOST_III]: {
      [Rarity.COMMON]: 15,
      [Rarity.UNCOMMON]: 19,
      [Rarity.RARE]: 23,
      [Rarity.EPIC]: 30,
      [Rarity.LEGENDARY]: 38,
    },
    // AUTO_COMPOUND (1.8x cost): Compounding multiplier
    [SkillType.AUTO_COMPOUND]: {
      [Rarity.COMMON]: 1,
      [Rarity.UNCOMMON]: 1.3,
      [Rarity.RARE]: 1.6,
      [Rarity.EPIC]: 2.1,
      [Rarity.LEGENDARY]: 2.6,
    },
    // LOCK_REDUCER (1.6x cost): Lock duration reduction %
    [SkillType.LOCK_REDUCER]: {
      [Rarity.COMMON]: 15,
      [Rarity.UNCOMMON]: 20,
      [Rarity.RARE]: 25,
      [Rarity.EPIC]: 35,
      [Rarity.LEGENDARY]: 45,
    },
    // FEE_REDUCER_I (1.4x cost): Fee reduction %
    [SkillType.FEE_REDUCER_I]: {
      [Rarity.COMMON]: 10,
      [Rarity.UNCOMMON]: 13,
      [Rarity.RARE]: 16,
      [Rarity.EPIC]: 22,
      [Rarity.LEGENDARY]: 28,
    },
    // FEE_REDUCER_II (2.0x cost): Higher fee reduction %
    [SkillType.FEE_REDUCER_II]: {
      [Rarity.COMMON]: 18,
      [Rarity.UNCOMMON]: 23,
      [Rarity.RARE]: 28,
      [Rarity.EPIC]: 37,
      [Rarity.LEGENDARY]: 45,
    },
    // PRIORITY_LISTING (8): Display multiplier (1.0x - 5.0x)
    [SkillType.PRIORITY_LISTING]: {
      [Rarity.COMMON]: 1.0,
      [Rarity.UNCOMMON]: 1.5,
      [Rarity.RARE]: 2.0,
      [Rarity.EPIC]: 3.0,
      [Rarity.LEGENDARY]: 5.0,
    },
    // BATCH_MINTER (9): Batch size multiplier (1.0x - 5.0x)
    [SkillType.BATCH_MINTER]: {
      [Rarity.COMMON]: 1.0,
      [Rarity.UNCOMMON]: 1.5,
      [Rarity.RARE]: 2.0,
      [Rarity.EPIC]: 3.0,
      [Rarity.LEGENDARY]: 5.0,
    },
    // VERIFIED_CREATOR (10): Badge level (1.0x - 5.0x)
    [SkillType.VERIFIED_CREATOR]: {
      [Rarity.COMMON]: 1.0,
      [Rarity.UNCOMMON]: 1.5,
      [Rarity.RARE]: 2.0,
      [Rarity.EPIC]: 3.0,
      [Rarity.LEGENDARY]: 5.0,
    },
    // INFLUENCER (11): Algorithm weight multiplier ⭐
    [SkillType.INFLUENCER]: {
      [Rarity.COMMON]: 2.0,
      [Rarity.UNCOMMON]: 2.4,
      [Rarity.RARE]: 2.8,
      [Rarity.EPIC]: 3.6,
      [Rarity.LEGENDARY]: 4.8,
    },
    // CURATOR (12): Curation power multiplier
    [SkillType.CURATOR]: {
      [Rarity.COMMON]: 1.0,
      [Rarity.UNCOMMON]: 1.2,
      [Rarity.RARE]: 1.4,
      [Rarity.EPIC]: 1.8,
      [Rarity.LEGENDARY]: 2.4,
    },
    // AMBASSADOR (13): Referral multiplier ⭐
    [SkillType.AMBASSADOR]: {
      [Rarity.COMMON]: 1.5,
      [Rarity.UNCOMMON]: 2.0,
      [Rarity.RARE]: 2.6,
      [Rarity.EPIC]: 3.0,
      [Rarity.LEGENDARY]: 3.5,
    },
    // VIP_ACCESS (14): Feature access level
    [SkillType.VIP_ACCESS]: {
      [Rarity.COMMON]: 1.0,
      [Rarity.UNCOMMON]: 1.5,
      [Rarity.RARE]: 2.0,
      [Rarity.EPIC]: 3.0,
      [Rarity.LEGENDARY]: 5.0,
    },
    // EARLY_ACCESS (15): Hours early access
    [SkillType.EARLY_ACCESS]: {
      [Rarity.COMMON]: 1.0,
      [Rarity.UNCOMMON]: 1.5,
      [Rarity.RARE]: 2.0,
      [Rarity.EPIC]: 3.0,
      [Rarity.LEGENDARY]: 5.0,
    },
    // PRIVATE_AUCTIONS (16): Auction access level
    [SkillType.PRIVATE_AUCTIONS]: {
      [Rarity.COMMON]: 1.0,
      [Rarity.UNCOMMON]: 1.5,
      [Rarity.RARE]: 2.0,
      [Rarity.EPIC]: 3.0,
      [Rarity.LEGENDARY]: 5.0,
    },
  };

  return stakingEffects[skillType]?.[rarity] ?? EFFECT_VALUES_BY_RARITY[rarity];
}

// Skill categories for grouping
export const SkillCategory = {
  STAKING: 'STAKING',
  MARKETPLACE: 'MARKETPLACE',
} as const;

export type SkillCategory = typeof SkillCategory[keyof typeof SkillCategory];

export const SKILL_CATEGORY_NAMES: Record<SkillCategory, string> = {
  [SkillCategory.STAKING]: 'Staking Skills',
  [SkillCategory.MARKETPLACE]: 'Marketplace Skills',
};

export const SKILL_CATEGORY_DESCRIPTIONS: Record<SkillCategory, string> = {
  [SkillCategory.STAKING]: 'Boost your staking rewards and reduce fees',
  [SkillCategory.MARKETPLACE]: 'Unlock exclusive marketplace features and visibility',
};

// Map skill types to categories
export const SKILL_TYPE_CATEGORY: Record<SkillType, SkillCategory> = {
  [SkillType.STAKE_BOOST_I]: SkillCategory.STAKING,
  [SkillType.STAKE_BOOST_II]: SkillCategory.STAKING,
  [SkillType.STAKE_BOOST_III]: SkillCategory.STAKING,
  [SkillType.AUTO_COMPOUND]: SkillCategory.STAKING,
  [SkillType.LOCK_REDUCER]: SkillCategory.STAKING,
  [SkillType.FEE_REDUCER_I]: SkillCategory.STAKING,
  [SkillType.FEE_REDUCER_II]: SkillCategory.STAKING,
  [SkillType.PRIORITY_LISTING]: SkillCategory.MARKETPLACE,
  [SkillType.BATCH_MINTER]: SkillCategory.MARKETPLACE,
  [SkillType.VERIFIED_CREATOR]: SkillCategory.MARKETPLACE,
  [SkillType.INFLUENCER]: SkillCategory.MARKETPLACE,
  [SkillType.CURATOR]: SkillCategory.MARKETPLACE,
  [SkillType.AMBASSADOR]: SkillCategory.MARKETPLACE,
  [SkillType.VIP_ACCESS]: SkillCategory.MARKETPLACE,
  [SkillType.EARLY_ACCESS]: SkillCategory.MARKETPLACE,
  [SkillType.PRIVATE_AUCTIONS]: SkillCategory.MARKETPLACE,
};

export interface SkillData {
  id: number;
  name: string;
  skillType: SkillType;
  rarity: Rarity;
  icon: string;
  description: string;
  effectLabel: string; // What it does
  effectValue: number; // The percentage/multiplier
  effectFormatted: string; // Formatted effect string
  color: string;
}

/**
 * Generate skills: 17 skill types × 5 rarities = 85 total skills
 * Matches IStakingIntegration.sol contract
 */
export function generateSkills(): SkillData[] {
  const skills: SkillData[] = [];
  let skillIndex = 0;

  const skillTypesList: SkillType[] = [
    SkillType.STAKE_BOOST_I,
    SkillType.STAKE_BOOST_II,
    SkillType.STAKE_BOOST_III,
    SkillType.AUTO_COMPOUND,
    SkillType.LOCK_REDUCER,
    SkillType.FEE_REDUCER_I,
    SkillType.FEE_REDUCER_II,
    SkillType.PRIORITY_LISTING,
    SkillType.BATCH_MINTER,
    SkillType.VERIFIED_CREATOR,
    SkillType.INFLUENCER,
    SkillType.CURATOR,
    SkillType.AMBASSADOR,
    SkillType.VIP_ACCESS,
    SkillType.EARLY_ACCESS,
    SkillType.PRIVATE_AUCTIONS,
  ];

  const raritiesForDisplay: Rarity[] = [
    Rarity.COMMON,
    Rarity.UNCOMMON,
    Rarity.RARE,
    Rarity.EPIC,
    Rarity.LEGENDARY,
  ];

  for (const skillType of skillTypesList) {
    for (const rarity of raritiesForDisplay) {
      const skillTypeName = SKILL_TYPE_NAMES[skillType];
      const rarityName = RARITY_NAMES[rarity];
      const effectConfig = SKILL_EFFECTS[skillType];
      const effectValue = getSkillEffectByType(skillType, rarity);

      skills.push({
        id: skillIndex,
        name: `${skillTypeName} - ${rarityName}`,
        skillType,
        rarity,
        icon: SKILL_ICONS[skillType],
        description: effectConfig.description,
        effectLabel: effectConfig.label,
        effectValue,
        effectFormatted: effectConfig.effectFormat(effectValue),
        color: RARITY_COLOR_MAP[rarity],
      });

      skillIndex++;
    }
  }

  return skills;
}

export const SKILLS_DATA = generateSkills();

// FAQ items
export const FAQ_ITEMS = [
  {
    question: 'What are Skills?',
    answer: 'Skills are special NFT abilities that enhance your experience on the Nuxchain platform. We offer 17 different skill types across 5 rarity tiers (Common to Legendary), providing benefits from staking rewards boosts to exclusive platform features. Each skill provides specific advantages based on its type and rarity.',
  },
  {
    question: 'What types of Skills are available?',
    answer: 'There are two main categories: Staking Skills (7 types) that directly boost your rewards like Stake Boost I/II/III, Auto Compound, Lock Reducer, and Fee Reducers; and Active Skills (10 types) that unlock platform features like Priority Listing, Batch Minter, Verified Creator, Influencer, Curator, Ambassador, VIP Access, Early Access, and Private Auctions.',
  },
  {
    question: 'How do I activate a Skill?',
    answer: 'You can purchase Skills individually or as part of an NFT. Once purchased, activate them from your profile. Note that you must have at least 250 POL staked to activate skills, and there\'s a maximum of 3 active skills per type. Skills last 30 days and can be renewed.',
  },
  {
    question: 'What\'s the difference between rarities?',
    answer: 'Rarity determines effect strength with a multiplier system. Common provides baseline benefits (e.g., +5% APY for Stake Boost I), while higher rarities scale up: Uncommon (×1.5), Rare (×2.0), Epic (×2.8), and Legendary (×3.5). For example, Stake Boost I LEGENDARY provides +16% APY, while Stake Boost III LEGENDARY reaches +38% APY. Higher rarity costs more but provides exponentially stronger benefits.',
  },
  {
    question: 'Can I use multiple Skills at once?',
    answer: 'Yes! You can activate multiple skills simultaneously, and their effects stack. However, you can only have up to 3 active skills of the same type. Strategically combine different skill types to maximize your benefits across staking, trading, and platform features.',
  },
  {
    question: 'What happens when a Skill expires?',
    answer: 'Skills expire after 30 days. You can renew them before expiration to keep the benefits active. If a skill expires, it becomes inactive but remains in your inventory. You\'ll need to pay a renewal fee to reactivate it. Deactivated skills can also be transferred to other wallets.',
  },
];
