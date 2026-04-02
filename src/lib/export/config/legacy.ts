import {
  CONTRACT_ADDRESSES as GENERATED_CONTRACT_ADDRESSES,
  QUEST_CATEGORY_NAMES,
  QUEST_TYPE_NAMES,
  QuestCategory,
  QuestType,
  RARITY_COLORS,
  RARITY_NAMES,
  SKILL_TYPE_NAMES,
  WALLET_ADDRESSES,
} from './index';

export {
  QuestCategory,
  QuestType,
  QUEST_CATEGORY_NAMES,
  QUEST_TYPE_NAMES,
  RARITY_COLORS,
  RARITY_NAMES,
  SKILL_TYPE_NAMES,
  WALLET_ADDRESSES,
};

export const CONTRACT_ADDRESSES = {
  ...GENERATED_CONTRACT_ADDRESSES,
  EnhancedSmartStakingCoreV2: GENERATED_CONTRACT_ADDRESSES.StakingCore,
  EnhancedSmartStakingRewards: GENERATED_CONTRACT_ADDRESSES.StakingRewards,
  EnhancedSmartStakingSkills: GENERATED_CONTRACT_ADDRESSES.StakingSkills,
  EnhancedSmartStakingGamification: GENERATED_CONTRACT_ADDRESSES.StakingGamification,
  EnhancedSmartStakingView: GENERATED_CONTRACT_ADDRESSES.StakingViewCore,
  EnhancedSmartStakingViewStats: GENERATED_CONTRACT_ADDRESSES.StakingViewStats,
  GameifiedMarketplaceCoreV1: GENERATED_CONTRACT_ADDRESSES.MarketplaceProxy,
  GameifiedMarketplaceQuests: GENERATED_CONTRACT_ADDRESSES.QuestCore,
  GameifiedMarketplaceSkillsNft: GENERATED_CONTRACT_ADDRESSES.MarketplaceSkillsNFT,
  IndividualSkillsMarketplace: GENERATED_CONTRACT_ADDRESSES.IndividualSkills,
  IndividualSkillsMarketplaceImpl: GENERATED_CONTRACT_ADDRESSES.IndividualSkills,
  CollaboratorBadgeRewards: GENERATED_CONTRACT_ADDRESSES.CollaboratorBadges,
  ReferralSystem: GENERATED_CONTRACT_ADDRESSES.MarketplaceReferral,
  LevelingSystem: GENERATED_CONTRACT_ADDRESSES.MarketplaceLeveling,
} as const;

export type LegacyContractAddresses = typeof CONTRACT_ADDRESSES;