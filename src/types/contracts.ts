// Types for EnhancedSmartStaking and GameifiedMarketplace contracts

// ════════════════════════════════════════════════════════════════════════════════════════
// ENHANCED SMART STAKING TYPES
// ════════════════════════════════════════════════════════════════════════════════════════

export const SkillType = {
  NONE: 0,
  STAKE_BOOST_I: 1,
  STAKE_BOOST_II: 2,
  STAKE_BOOST_III: 3,
  AUTO_COMPOUND: 4,
  LOCK_REDUCER: 5,
  FEE_REDUCER_I: 6,
  FEE_REDUCER_II: 7,
  PRIORITY_LISTING: 8,
  BATCH_MINTER: 9,
  VERIFIED_CREATOR: 10,
  INFLUENCER: 11,
  CURATOR: 12,
  AMBASSADOR: 13,
  VIP_ACCESS: 14,
  EARLY_ACCESS: 15,
  PRIVATE_AUCTIONS: 16
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
  nftsOwned: bigint
  nftsSold: bigint
  nftsBought: bigint
  referralCount?: bigint // Optional - from ReferralSystem
  totalEarnings?: bigint // Optional - legacy
  lastActivityTime?: bigint // Optional - legacy
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
  [SkillType.NONE]: "None",
  [SkillType.STAKE_BOOST_I]: "Stake Boost I",
  [SkillType.STAKE_BOOST_II]: "Stake Boost II",
  [SkillType.STAKE_BOOST_III]: "Stake Boost III",
  [SkillType.AUTO_COMPOUND]: "Auto Compound",
  [SkillType.LOCK_REDUCER]: "Lock Reducer",
  [SkillType.FEE_REDUCER_I]: "Fee Reducer I",
  [SkillType.FEE_REDUCER_II]: "Fee Reducer II",
  [SkillType.PRIORITY_LISTING]: "Priority Listing",
  [SkillType.BATCH_MINTER]: "Batch Minter",
  [SkillType.VERIFIED_CREATOR]: "Verified Creator",
  [SkillType.INFLUENCER]: "Influencer",
  [SkillType.CURATOR]: "Curator",
  [SkillType.AMBASSADOR]: "Ambassador",
  [SkillType.VIP_ACCESS]: "VIP Access",
  [SkillType.EARLY_ACCESS]: "Early Access",
  [SkillType.PRIVATE_AUCTIONS]: "Private Auctions"
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
