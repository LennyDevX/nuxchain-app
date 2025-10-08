/**
 * GraphQL response types for The Graph queries
 */

export type ActivityType =
  | 'STAKING_DEPOSIT'
  | 'STAKING_WITHDRAW'
  | 'STAKING_COMPOUND'
  | 'NFT_MINT'
  | 'NFT_LIST'
  | 'NFT_SALE'
  | 'NFT_PURCHASE'
  | 'NFT_UNLIST'
  | 'OFFER_MADE'
  | 'OFFER_ACCEPTED';

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
  nftCount: number;
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
  tokenURI: string;
  category: string;
  timestamp: string; // BigInt as string
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

export interface GetUserWithdrawalsResponse {
  withdrawals: GraphQLWithdrawal[];
}

export interface GetUserNFTsResponse {
  nftMints: GraphQLNFTMint[];
}
