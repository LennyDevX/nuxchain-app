// Skill types from the contract
export const SkillType = {
  SPEED: 0,
  STRENGTH: 1,
  WISDOM: 2,
  ENDURANCE: 3,
  AGILITY: 4,
} as const;
export type SkillType = typeof SkillType[keyof typeof SkillType];

// Rarity types from the contract
export const Rarity = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
} as const;
export type Rarity = typeof Rarity[keyof typeof Rarity];

export const categoryMap: Record<string, string> = {
  'collectible': 'coleccionables',
  'artwork': 'arte',
  'photography': 'fotografia',
  'music': 'musica',
  'video': 'video',
  'item': 'collectible',
  'document': 'collectible'
};

export const MIN_POL_FOR_SKILL_NFT = '200'; // 200 POL (assuming 18 decimals)

export interface MintStandardNFTParams {
  file: File;
  name: string;
  description: string;
  category: string;
  royalty: number;
}

export interface MintSkillNFTParams extends MintStandardNFTParams {
  skills: number[] | SkillType[];
  effectValues: number[];
  rarities: number[] | Rarity[];
}

export interface MintNFTResult {
  success: boolean;
  txHash: string;
  tokenId: number | null;
  imageUrl: string;
  metadataUrl: string;
  contractAddress: string;
}

export interface UserStakingInfo {
  hasMinimumPOL: boolean;
  polBalance: string;
  requiredPOL: string;
}
