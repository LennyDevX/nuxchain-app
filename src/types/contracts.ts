// Types for EnhancedSmartStaking and GameifiedMarketplace contracts

// ════════════════════════════════════════════════════════════════════════════════════════
// ENHANCED SMART STAKING TYPES
// ════════════════════════════════════════════════════════════════════════════════════════

export const SkillType = {
  STAKING_BOOST: 0,
  AUTO_COMPOUND: 1,
  REDUCE_LOCKUP: 2,
  EXTRA_REWARDS: 3,
  COMMISSION_DISCOUNT: 4,
  EMERGENCY_UNLOCK: 5,
  REWARD_MULTIPLIER: 6,
  LOYALTY_BONUS: 7
} as const

export type SkillType = typeof SkillType[keyof typeof SkillType]

export const Rarity = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4
} as const

export type Rarity = typeof Rarity[keyof typeof Rarity]

export interface NFTSkill {
  skillType: SkillType
  effectValue: number
  isActive: boolean
  appliedAt: bigint
  expiresAt: bigint
  level: number
}

export interface UserSkillProfile {
  activeSkillsCount: number
  totalSkillBoost: number
  autoCompoundEnabled: boolean
  lockupReduction: number
  rewardMultiplier: number
  lastSkillUpdate: bigint
}

export interface DepositData {
  amount: bigint
  depositTime: bigint
  lockupDuration: bigint
  lastClaimTime: bigint
  accumulatedRewards: bigint
  isActive: boolean
}

export interface UserStakingInfo {
  totalDeposit: bigint
  rewardsClaimed: bigint
  depositsCount: bigint
  lastDepositTime: bigint
  referralEarnings: bigint
  skillBoostActive: boolean
}

// ════════════════════════════════════════════════════════════════════════════════════════
// GAMEIFIED MARKETPLACE TYPES
// ════════════════════════════════════════════════════════════════════════════════════════

export interface NFTMetadata {
  creator: string
  tokenURI: string
  price: bigint
  category: string
  isListed: boolean
  createdAt: bigint
  rarity: Rarity
}

export interface SkillNFT {
  tokenId: bigint
  skillTypes: SkillType[]
  skillLevels: number[]
  rarity: Rarity
  isActive: boolean
  stakingBoost: number
  createdAt: bigint
  lastActivationTime: bigint
}

export interface UserProfile {
  totalXP: bigint
  level: number
  nftsCreated: bigint
  nftsSold: bigint
  nftsBought: bigint
  referralCount: bigint
  totalEarnings: bigint
  lastActivityTime: bigint
}

export interface Achievement {
  id: bigint
  name: string
  description: string
  xpReward: bigint
  requirement: bigint
  achievementType: number
  isActive: boolean
}

export interface Quest {
  id: bigint
  name: string
  description: string
  xpReward: bigint
  tokenReward: bigint
  requirement: bigint
  questType: number
  deadline: bigint
  isActive: boolean
}

export interface Offer {
  offerId: bigint
  tokenId: bigint
  buyer: string
  amount: bigint
  expiresAt: bigint
  isActive: boolean
}

export interface SkillFeeConfig {
  skillType: SkillType
  baseFee: bigint
  additionalFee: bigint
  cooldownPeriod: bigint
}

// ════════════════════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ════════════════════════════════════════════════════════════════════════════════════════

export interface SkillActivationParams {
  tokenId: bigint
  skillTypes: SkillType[]
  targetContract?: string
}

export interface ContractAddresses {
  enhancedSmartStaking: string
  gameifiedMarketplace: string
  polToken: string
  treasury: string
}

export const SKILL_TYPE_NAMES: Record<SkillType, string> = {
  [SkillType.STAKING_BOOST]: "Staking Boost",
  [SkillType.AUTO_COMPOUND]: "Auto Compound",
  [SkillType.REDUCE_LOCKUP]: "Reduce Lockup",
  [SkillType.EXTRA_REWARDS]: "Extra Rewards",
  [SkillType.COMMISSION_DISCOUNT]: "Commission Discount",
  [SkillType.EMERGENCY_UNLOCK]: "Emergency Unlock",
  [SkillType.REWARD_MULTIPLIER]: "Reward Multiplier",
  [SkillType.LOYALTY_BONUS]: "Loyalty Bonus"
}

export const RARITY_NAMES: Record<Rarity, string> = {
  [Rarity.COMMON]: "Common",
  [Rarity.UNCOMMON]: "Uncommon",
  [Rarity.RARE]: "Rare",
  [Rarity.EPIC]: "Epic",
  [Rarity.LEGENDARY]: "Legendary"
}

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: "text-gray-400",
  [Rarity.UNCOMMON]: "text-green-400",
  [Rarity.RARE]: "text-blue-400",
  [Rarity.EPIC]: "text-purple-400",
  [Rarity.LEGENDARY]: "text-orange-400"
}
