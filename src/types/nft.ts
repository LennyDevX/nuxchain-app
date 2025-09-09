export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string | null;
  owner: string;
  creator: string;
  tokenId: string;
  tokenURI?: string | null;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  metadata: NFTMetadata;
  isListed: boolean;
  uniqueId?: string;
  contract?: `0x${string}`;
  likes?: string;
  category?: string;
  isForSale?: boolean;
}