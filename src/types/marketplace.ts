/**
 * Shared types for Marketplace components
 * Extracted from deleted hooks to maintain compatibility
 */

import type { NFTMetadata } from './nft';

export interface MarketplaceNFT {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price: string;
  priceInEth: number;
  seller: string;
  owner: string;
  isForSale: boolean;
  listedTimestamp: number;
  category: string;
  tokenURI?: string | null;
  attributes?: Array<{ trait_type: string; value: string }>;
  metadata?: NFTMetadata | null;
  uniqueId?: string;
  contract?: string;
  creator?: string;
  likes?: number | string; // Can be string from contract or number
}

export interface MarketplaceStats {
  totalListedNFTs: number;
  floorPrice: number;
  totalMarketValue: number;
  averagePrice: number;
}
