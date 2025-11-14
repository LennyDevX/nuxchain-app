/**
 * Skills Store Pricing Configuration
 * Prices match IndividualSkillsMarketplace contract exactly
 * 
 * STAKING SKILLS (1-7):
 * - COMMON: 50 POL
 * - UNCOMMON: 80 POL
 * - RARE: 100 POL
 * - EPIC: 150 POL
 * - LEGENDARY: 220 POL
 * 
 * ACTIVE SKILLS (8-16): 30% markup on staking prices
 * - COMMON: 65 POL (50 * 1.3)
 * - UNCOMMON: 104 POL (80 * 1.3)
 * - RARE: 130 POL (100 * 1.3)
 * - EPIC: 195 POL (150 * 1.3)
 * - LEGENDARY: 286 POL (220 * 1.3)
 */

import { Rarity, SkillType, SKILL_TYPE_CATEGORY, SkillCategory } from '../skills/config';

// STAKING SKILLS PRICES (Skills 1-7) - From contract constants
export const STAKING_PRICES_BY_RARITY: Record<Rarity, number> = {
  [Rarity.COMMON]: 50,
  [Rarity.UNCOMMON]: 80,
  [Rarity.RARE]: 100,
  [Rarity.EPIC]: 150,
  [Rarity.LEGENDARY]: 220,
};

// ACTIVE SKILLS PRICES (Skills 8-16) - 30% markup on staking prices
export const ACTIVE_PRICES_BY_RARITY: Record<Rarity, number> = {
  [Rarity.COMMON]: 65,       // 50 * 1.3
  [Rarity.UNCOMMON]: 104,    // 80 * 1.3
  [Rarity.RARE]: 130,        // 100 * 1.3
  [Rarity.EPIC]: 195,        // 150 * 1.3
  [Rarity.LEGENDARY]: 286,   // 220 * 1.3
};

// Renewal cost is 50% of original price
export const RENEWAL_DISCOUNT = 0.50;

// Markup for active skills (30%)
export const ACTIVE_SKILLS_MARKUP = 1.3;

/**
 * Calculate price for a skill based on type and rarity
 * Matches IndividualSkillsMarketplace contract pricing
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
    basePrice = STAKING_PRICES_BY_RARITY[rarity];
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
    return STAKING_PRICES_BY_RARITY[rarity];
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
    markup: Math.round((ACTIVE_PRICES_BY_RARITY[Rarity.COMMON] / STAKING_PRICES_BY_RARITY[Rarity.COMMON] - 1) * 100),
    color: '#A0AEC0',
  },
  {
    rarity: Rarity.UNCOMMON,
    rarityName: 'Uncommon',
    stakingPrice: STAKING_PRICES_BY_RARITY[Rarity.UNCOMMON],
    activePrice: ACTIVE_PRICES_BY_RARITY[Rarity.UNCOMMON],
    markup: Math.round((ACTIVE_PRICES_BY_RARITY[Rarity.UNCOMMON] / STAKING_PRICES_BY_RARITY[Rarity.UNCOMMON] - 1) * 100),
    color: '#48BB78',
  },
  {
    rarity: Rarity.RARE,
    rarityName: 'Rare',
    stakingPrice: STAKING_PRICES_BY_RARITY[Rarity.RARE],
    activePrice: ACTIVE_PRICES_BY_RARITY[Rarity.RARE],
    markup: Math.round((ACTIVE_PRICES_BY_RARITY[Rarity.RARE] / STAKING_PRICES_BY_RARITY[Rarity.RARE] - 1) * 100),
    color: '#4299E1',
  },
  {
    rarity: Rarity.EPIC,
    rarityName: 'Epic',
    stakingPrice: STAKING_PRICES_BY_RARITY[Rarity.EPIC],
    activePrice: ACTIVE_PRICES_BY_RARITY[Rarity.EPIC],
    markup: Math.round((ACTIVE_PRICES_BY_RARITY[Rarity.EPIC] / STAKING_PRICES_BY_RARITY[Rarity.EPIC] - 1) * 100),
    color: '#9F7AEA',
  },
  {
    rarity: Rarity.LEGENDARY,
    rarityName: 'Legendary',
    stakingPrice: STAKING_PRICES_BY_RARITY[Rarity.LEGENDARY],
    activePrice: ACTIVE_PRICES_BY_RARITY[Rarity.LEGENDARY],
    markup: Math.round((ACTIVE_PRICES_BY_RARITY[Rarity.LEGENDARY] / STAKING_PRICES_BY_RARITY[Rarity.LEGENDARY] - 1) * 100),
    color: '#ED8936',
  },
];

// Minimum POL required in staking to activate skills
export const MIN_POL_TO_ACTIVATE = 250;

// Skill duration in days
export const SKILL_DURATION_DAYS = 30;

// Maximum active skills per user
export const MAX_ACTIVE_SKILLS = 3;
