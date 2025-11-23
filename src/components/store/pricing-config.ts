/**
 * Skills Store Pricing Configuration
 * Prices differentiated by skill type based on their impact/APY boost
 * 
 * STAKING SKILLS (1-7) - Prices vary by skill tier:
 * - STAKE_BOOST_I (1.0x base): 50, 80, 100, 150, 220 POL
 * - STAKE_BOOST_II (1.5x): 75, 120, 150, 225, 330 POL
 * - STAKE_BOOST_III (2.2x): 110, 176, 220, 330, 484 POL
 * - AUTO_COMPOUND (1.8x): 90, 144, 180, 270, 396 POL
 * - LOCK_REDUCER (1.6x): 80, 128, 160, 240, 352 POL
 * - FEE_REDUCER_I (1.4x): 70, 112, 140, 210, 308 POL
 * - FEE_REDUCER_II (2.0x): 100, 160, 200, 300, 440 POL
 * 
 * ACTIVE SKILLS (8-16): 30% markup on corresponding staking skill prices
 */

import { Rarity, SkillType, SKILL_TYPE_CATEGORY, SkillCategory } from '../skills/config';

// STAKING SKILLS PRICES (Skills 1-7) - Calculated per skill type
// Generate dynamically based on multipliers
export const STAKING_PRICES_BY_SKILL: Record<SkillType, Record<Rarity, number>> = {
  // STAKE_BOOST_I: Base prices (1.0x)
  [SkillType.STAKE_BOOST_I]: {
    [Rarity.COMMON]: 50,
    [Rarity.UNCOMMON]: 80,
    [Rarity.RARE]: 100,
    [Rarity.EPIC]: 150,
    [Rarity.LEGENDARY]: 220,
  },
  // STAKE_BOOST_II: 1.5x multiplier
  [SkillType.STAKE_BOOST_II]: {
    [Rarity.COMMON]: 75,      // 50 * 1.5
    [Rarity.UNCOMMON]: 120,   // 80 * 1.5
    [Rarity.RARE]: 150,       // 100 * 1.5
    [Rarity.EPIC]: 225,       // 150 * 1.5
    [Rarity.LEGENDARY]: 330,  // 220 * 1.5
  },
  // STAKE_BOOST_III: 2.2x multiplier
  [SkillType.STAKE_BOOST_III]: {
    [Rarity.COMMON]: 110,     // 50 * 2.2
    [Rarity.UNCOMMON]: 176,   // 80 * 2.2
    [Rarity.RARE]: 220,       // 100 * 2.2
    [Rarity.EPIC]: 330,       // 150 * 2.2
    [Rarity.LEGENDARY]: 484,  // 220 * 2.2
  },
  // AUTO_COMPOUND: 1.8x multiplier
  [SkillType.AUTO_COMPOUND]: {
    [Rarity.COMMON]: 90,      // 50 * 1.8
    [Rarity.UNCOMMON]: 144,   // 80 * 1.8
    [Rarity.RARE]: 180,       // 100 * 1.8
    [Rarity.EPIC]: 270,       // 150 * 1.8
    [Rarity.LEGENDARY]: 396,  // 220 * 1.8
  },
  // LOCK_REDUCER: 1.6x multiplier
  [SkillType.LOCK_REDUCER]: {
    [Rarity.COMMON]: 80,      // 50 * 1.6
    [Rarity.UNCOMMON]: 128,   // 80 * 1.6
    [Rarity.RARE]: 160,       // 100 * 1.6
    [Rarity.EPIC]: 240,       // 150 * 1.6
    [Rarity.LEGENDARY]: 352,  // 220 * 1.6
  },
  // FEE_REDUCER_I: 1.4x multiplier
  [SkillType.FEE_REDUCER_I]: {
    [Rarity.COMMON]: 70,      // 50 * 1.4
    [Rarity.UNCOMMON]: 112,   // 80 * 1.4
    [Rarity.RARE]: 140,       // 100 * 1.4
    [Rarity.EPIC]: 210,       // 150 * 1.4
    [Rarity.LEGENDARY]: 308,  // 220 * 1.4
  },
  // FEE_REDUCER_II: 2.0x multiplier
  [SkillType.FEE_REDUCER_II]: {
    [Rarity.COMMON]: 100,     // 50 * 2.0
    [Rarity.UNCOMMON]: 160,   // 80 * 2.0
    [Rarity.RARE]: 200,       // 100 * 2.0
    [Rarity.EPIC]: 300,       // 150 * 2.0
    [Rarity.LEGENDARY]: 440,  // 220 * 2.0
  },
  // ACTIVE SKILLS (8-16): Use base staking prices + 30% markup
  [SkillType.PRIORITY_LISTING]: {
    [Rarity.COMMON]: 65,      // 50 * 1.3
    [Rarity.UNCOMMON]: 104,   // 80 * 1.3
    [Rarity.RARE]: 130,       // 100 * 1.3
    [Rarity.EPIC]: 195,       // 150 * 1.3
    [Rarity.LEGENDARY]: 286,  // 220 * 1.3
  },
  [SkillType.BATCH_MINTER]: {
    [Rarity.COMMON]: 65,      // 50 * 1.3
    [Rarity.UNCOMMON]: 104,   // 80 * 1.3
    [Rarity.RARE]: 130,       // 100 * 1.3
    [Rarity.EPIC]: 195,       // 150 * 1.3
    [Rarity.LEGENDARY]: 286,  // 220 * 1.3
  },
  [SkillType.VERIFIED_CREATOR]: {
    [Rarity.COMMON]: 65,      // 50 * 1.3
    [Rarity.UNCOMMON]: 104,   // 80 * 1.3
    [Rarity.RARE]: 130,       // 100 * 1.3
    [Rarity.EPIC]: 195,       // 150 * 1.3
    [Rarity.LEGENDARY]: 286,  // 220 * 1.3
  },
  [SkillType.INFLUENCER]: {
    [Rarity.COMMON]: 65,      // 50 * 1.3
    [Rarity.UNCOMMON]: 104,   // 80 * 1.3
    [Rarity.RARE]: 130,       // 100 * 1.3
    [Rarity.EPIC]: 195,       // 150 * 1.3
    [Rarity.LEGENDARY]: 286,  // 220 * 1.3
  },
  [SkillType.CURATOR]: {
    [Rarity.COMMON]: 65,      // 50 * 1.3
    [Rarity.UNCOMMON]: 104,   // 80 * 1.3
    [Rarity.RARE]: 130,       // 100 * 1.3
    [Rarity.EPIC]: 195,       // 150 * 1.3
    [Rarity.LEGENDARY]: 286,  // 220 * 1.3
  },
  [SkillType.AMBASSADOR]: {
    [Rarity.COMMON]: 65,      // 50 * 1.3
    [Rarity.UNCOMMON]: 104,   // 80 * 1.3
    [Rarity.RARE]: 130,       // 100 * 1.3
    [Rarity.EPIC]: 195,       // 150 * 1.3
    [Rarity.LEGENDARY]: 286,  // 220 * 1.3
  },
  [SkillType.VIP_ACCESS]: {
    [Rarity.COMMON]: 65,      // 50 * 1.3
    [Rarity.UNCOMMON]: 104,   // 80 * 1.3
    [Rarity.RARE]: 130,       // 100 * 1.3
    [Rarity.EPIC]: 195,       // 150 * 1.3
    [Rarity.LEGENDARY]: 286,  // 220 * 1.3
  },
  [SkillType.EARLY_ACCESS]: {
    [Rarity.COMMON]: 65,      // 50 * 1.3
    [Rarity.UNCOMMON]: 104,   // 80 * 1.3
    [Rarity.RARE]: 130,       // 100 * 1.3
    [Rarity.EPIC]: 195,       // 150 * 1.3
    [Rarity.LEGENDARY]: 286,  // 220 * 1.3
  },
  [SkillType.PRIVATE_AUCTIONS]: {
    [Rarity.COMMON]: 65,      // 50 * 1.3
    [Rarity.UNCOMMON]: 104,   // 80 * 1.3
    [Rarity.RARE]: 130,       // 100 * 1.3
    [Rarity.EPIC]: 195,       // 150 * 1.3
    [Rarity.LEGENDARY]: 286,  // 220 * 1.3
  },
};

// ACTIVE SKILLS PRICES (Skills 8-16) - 30% markup on base staking prices (STAKE_BOOST_I tier)
export const ACTIVE_PRICES_BY_RARITY: Record<Rarity, number> = {
  [Rarity.COMMON]: 65,       // 50 * 1.3
  [Rarity.UNCOMMON]: 104,    // 80 * 1.3
  [Rarity.RARE]: 130,        // 100 * 1.3
  [Rarity.EPIC]: 195,        // 150 * 1.3
  [Rarity.LEGENDARY]: 286,   // 220 * 1.3
};

// Legacy backward-compatible exports (for deprecated code)
export const STAKING_PRICES_BY_RARITY: Record<Rarity, number> = {
  [Rarity.COMMON]: 50,
  [Rarity.UNCOMMON]: 80,
  [Rarity.RARE]: 100,
  [Rarity.EPIC]: 150,
  [Rarity.LEGENDARY]: 220,
};

// Renewal cost is 50% of original price
export const RENEWAL_DISCOUNT = 0.50;

// Markup for active skills (30%)
export const ACTIVE_SKILLS_MARKUP = 1.3;

/**
 * Calculate price for a skill based on type and rarity
 * Each staking skill has its own pricing tier based on APY impact
 * @param skillType - Type of skill (1-16)
 * @param rarity - Rarity level (0-4)
 * @param isRenewal - Whether this is a renewal (50% discount)
 * @returns Price in POL
 */
export function calculateSkillPrice(
  skillType: SkillType,
  rarity: Rarity,
  isRenewal: boolean = false
): number {
  const category = SKILL_TYPE_CATEGORY[skillType];
  
  // Get base price from appropriate pricing table
  let basePrice: number;
  if (category === SkillCategory.STAKING) {
    // Use skill-specific pricing
    basePrice = STAKING_PRICES_BY_SKILL[skillType]?.[rarity] ?? STAKING_PRICES_BY_RARITY[rarity];
  } else {
    basePrice = ACTIVE_PRICES_BY_RARITY[rarity];
  }

  let finalPrice = basePrice;

  // Apply renewal discount if applicable
  if (isRenewal) {
    finalPrice = finalPrice * RENEWAL_DISCOUNT;
  }

  return Math.round(finalPrice * 100) / 100; // Round to 2 decimals
}

/**
 * Get marketplace price without discounts
 * @param skillType - Type of skill
 * @param rarity - Rarity level
 * @returns Price in POL
 */
export function getMarketplacePrice(skillType: SkillType, rarity: Rarity): number {
  const category = SKILL_TYPE_CATEGORY[skillType];
  
  if (category === SkillCategory.STAKING) {
    return STAKING_PRICES_BY_SKILL[skillType]?.[rarity] ?? STAKING_PRICES_BY_RARITY[rarity];
  } else {
    return ACTIVE_PRICES_BY_RARITY[rarity];
  }
}

/**
 * Get markup percentage for active skills vs staking skills
 * @param skillType - Type of skill
 * @returns Markup percentage (0 for staking, 30 for active)
 */
export function getMarkupPercentage(skillType: SkillType): number {
  const category = SKILL_TYPE_CATEGORY[skillType];
  
  if (category === SkillCategory.MARKETPLACE) {
    return Math.round((ACTIVE_SKILLS_MARKUP - 1) * 100);
  }
  
  return 0;
}

/**
 * Check if skill is an active skill (has markup)
 * @param skillType - Type of skill
 * @returns True if skill is active skills type
 */
export function isActiveSkill(skillType: SkillType): boolean {
  const category = SKILL_TYPE_CATEGORY[skillType];
  return category === SkillCategory.MARKETPLACE;
}

/**
 * Get formatted price string
 * @param price - Price in POL
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  if (price === 0) {
    return 'FREE';
  }
  return `${price} POL`;
}

/**
 * Calculate total price for multiple skills
 * @param skills - Array of {skillType, rarity}
 * @returns Total price in POL
 */
export function calculateBundlePrice(skills: Array<{ skillType: SkillType; rarity: Rarity }>): number {
  let total = 0;

  for (const skill of skills) {
    total += calculateSkillPrice(skill.skillType, skill.rarity, false);
  }

  return Math.round(total * 100) / 100;
}

/**
 * Pricing tiers for display in pricing guide
 */
export interface PricingTier {
  rarity: Rarity;
  rarityName: string;
  stakingPrice: number;
  activePrice: number;
  markup: number;
  color: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    rarity: Rarity.COMMON,
    rarityName: 'Common',
    stakingPrice: STAKING_PRICES_BY_RARITY[Rarity.COMMON],
    activePrice: ACTIVE_PRICES_BY_RARITY[Rarity.COMMON],
    markup: 30,
    color: '#A0AEC0',
  },
  {
    rarity: Rarity.UNCOMMON,
    rarityName: 'Uncommon',
    stakingPrice: STAKING_PRICES_BY_RARITY[Rarity.UNCOMMON],
    activePrice: ACTIVE_PRICES_BY_RARITY[Rarity.UNCOMMON],
    markup: 30,
    color: '#48BB78',
  },
  {
    rarity: Rarity.RARE,
    rarityName: 'Rare',
    stakingPrice: STAKING_PRICES_BY_RARITY[Rarity.RARE],
    activePrice: ACTIVE_PRICES_BY_RARITY[Rarity.RARE],
    markup: 30,
    color: '#4299E1',
  },
  {
    rarity: Rarity.EPIC,
    rarityName: 'Epic',
    stakingPrice: STAKING_PRICES_BY_RARITY[Rarity.EPIC],
    activePrice: ACTIVE_PRICES_BY_RARITY[Rarity.EPIC],
    markup: 30,
    color: '#9F7AEA',
  },
  {
    rarity: Rarity.LEGENDARY,
    rarityName: 'Legendary',
    stakingPrice: STAKING_PRICES_BY_RARITY[Rarity.LEGENDARY],
    activePrice: ACTIVE_PRICES_BY_RARITY[Rarity.LEGENDARY],
    markup: 30,
    color: '#ED8936',
  },
];

// Minimum POL required in staking to activate skills
export const MIN_POL_TO_ACTIVATE = 250;

// Skill duration in days
export const SKILL_DURATION_DAYS = 30;

// Maximum active skills per user
export const MAX_ACTIVE_SKILLS = 3;
