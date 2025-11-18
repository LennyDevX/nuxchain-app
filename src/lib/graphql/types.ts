/**
 * GraphQL response types for The Graph queries
 */

export type ActivityType =
  | 'STAKING_DEPOSIT'
  | 'STAKING_WITHDRAW'
  | 'STAKING_WITHDRAW_ALL'
  | 'STAKING_COMPOUND'
  | 'STAKING_AUTO_COMPOUND'
  | 'EMERGENCY_WITHDRAWAL'
  | 'SKILL_ACTIVATED'
  | 'SKILL_DEACTIVATED'
  | 'SKILL_UPGRADED'
  | 'SKILL_PURCHASED'
  | 'QUEST_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'NFT_MINT'
  | 'NFT_LIST'
  | 'NFT_SALE'
  | 'NFT_PURCHASE'
  | 'NFT_UNLIST'
  | 'OFFER_MADE'
  | 'OFFER_ACCEPTED'
  | 'OFFER_CANCELLED'
  | 'ROYALTY_PAID'
  | 'COMMISSION_PAID'
  | 'XP_GAINED'
  | 'LEVEL_UP'
  | 'AUTO_COMPOUND_ENABLED'
  | 'AUTO_COMPOUND_DISABLED'
  | 'AUTO_COMPOUND_EXECUTED';

export interface GraphQLActivity {
  id: string;
  type: ActivityType;
  timestamp: string; // BigInt as string
  transactionHash: string; // Bytes as hex string
  blockNumber: string; // BigInt as string
  amount?: string; // BigInt as string (optional)
  tokenId?: string; // BigInt as string (optional)
  lockupDuration?: string; // BigInt as string (optional)
  category?: string;
  buyer?: string; // Bytes as hex string (optional)
  seller?: string; // Bytes as hex string (optional)
  offerId?: string; // BigInt as string (optional)
}

export interface GraphQLUser {
  id: string; // Bytes as hex string (wallet address)
  totalDeposited: string; // BigInt as string
  totalWithdrawn: string; // BigInt as string
  totalCompounded: string; // BigInt as string
  nftMintedCount: number;
  depositCount: number;
  withdrawalCount: number;
  compoundCount: number;
  level: number;
  totalXP: string; // BigInt as string
  createdAt: string; // BigInt as string (timestamp)
  updatedAt: string; // BigInt as string (timestamp)
}

export interface GraphQLDeposit {
  id: string;
  amount: string; // BigInt as string
  lockupDuration: string; // BigInt as string
  timestamp: string; // BigInt as string
  transactionHash: string; // Bytes as hex string
  blockNumber: string; // BigInt as string
}

export interface GraphQLWithdrawal {
  id: string;
  amount: string; // BigInt as string
  timestamp: string; // BigInt as string
  transactionHash: string; // Bytes as hex string
  blockNumber: string; // BigInt as string
}

export interface GraphQLNFTMint {
  id: string;
  tokenId: string; // BigInt as string
  creator: {
    id: string; // Bytes as hex string
  };
  tokenURI: string;
  category: string;
  royaltyPercentage: string; // BigInt as string
  timestamp: string; // BigInt as string
  transactionHash: string; // Bytes as hex string
  blockNumber: string; // BigInt as string
}

export interface GraphQLIndividualSkill {
  id: string;
  skillId: string; // BigInt as string
  skillType: string; // BigInt as string
  rarity: string;
  level: string; // BigInt as string
  owner: string; // Bytes as hex string (wallet address)
  purchasedAt: string; // BigInt as string (timestamp)
  expiresAt: string; // BigInt as string (timestamp)
  isActive: boolean;
  metadata?: string;
  transactionHash: string; // Bytes as hex string
  blockNumber: string; // BigInt as string
}

export interface GraphQLSubgraphMeta {
  _meta: {
    block: {
      number: number;
      hash: string;
      timestamp: number;
    };
    deployment: string;
    hasIndexingErrors: boolean;
  };
}

// Query response types
export interface GetUserActivitiesResponse {
  activities: GraphQLActivity[];
}

export interface GetUserStatsResponse {
  user: GraphQLUser | null;
}

export interface GetUserDepositsResponse {
  deposits: GraphQLDeposit[];
}

export interface GetUserIndividualSkillsResponse {
  individualSkills: GraphQLIndividualSkill[];
}

export interface GetUserWithdrawalsResponse {
  withdrawals: GraphQLWithdrawal[];
}

export interface GetUserNFTsResponse {
  nftMints: GraphQLNFTMint[];
}
