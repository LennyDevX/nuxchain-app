import type { PublicClient } from 'viem';
import type { NFTMetadata } from '../types/nft';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
const MARKETPLACE_CONTRACT_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

// Upload file to IPFS using Pinata
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  if (!PINATA_JWT || PINATA_JWT.trim() === '') {
    throw new Error('Pinata JWT not configured. Please check PINATA_SETUP.md for setup instructions.');
  }

  const uploadFormData = new FormData();
  uploadFormData.append('file', file);
  
  const metadata = JSON.stringify({
    name: `${file.name}_image`,
    keyvalues: {
      type: 'nft_image'
    }
  });
  uploadFormData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  uploadFormData.append('pinataOptions', options);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`
    },
    body: uploadFormData
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid Pinata credentials. Please check your VITE_PINATA_JWT in .env file.');
    } else if (response.status === 403) {
      throw new Error('Pinata API key lacks required permissions.');
    } else if (response.status === 413) {
      throw new Error('File too large. Maximum file size is 10MB.');
    } else {
      throw new Error(`Failed to upload image to IPFS (${response.status}): ${response.statusText}`);
    }
  }

  const result = await response.json();
  return `${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`;
};

// Upload JSON metadata to IPFS using Pinata
export const uploadJsonToIPFS = async (metadata: NFTMetadata): Promise<string> => {
  if (!PINATA_JWT || PINATA_JWT.trim() === '') {
    throw new Error('Pinata JWT not configured. Please check PINATA_SETUP.md for setup instructions.');
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PINATA_JWT}`
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name}_metadata`,
        keyvalues: {
          type: 'nft_metadata'
        }
      }
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid Pinata credentials. Please check your VITE_PINATA_JWT in .env file.');
    } else if (response.status === 403) {
      throw new Error('Pinata API key lacks required permissions.');
    } else {
      throw new Error(`Failed to upload metadata to IPFS (${response.status}): ${response.statusText}`);
    }
  }

  const result = await response.json();
  return `${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`;
};

// Fetch token metadata from IPFS
export const fetchTokenMetadata = async (tokenURI: string): Promise<NFTMetadata | null> => {
  try {
    let metadataUrl = tokenURI;
    if (tokenURI.startsWith('ipfs://')) {
      metadataUrl = tokenURI.replace('ipfs://', `${PINATA_GATEWAY}/ipfs/`);
    }
    
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const metadata: NFTMetadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};

// Convert IPFS URL to HTTP URL
export const ipfsToHttp = (ipfsUrl: string): string => {
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', `${PINATA_GATEWAY}/ipfs/`);
  }
  return ipfsUrl;
};

// Enhanced fetch NFTs function with cache optimization
export const fetchNFTs = async (
  address: string, 
  _publicClient: PublicClient,
  options: {
    contractAddress?: string;
    limit?: number;
    withMetadata?: boolean;
    useCache?: boolean;
    batchSize?: number;
    maxRetries?: number;
  } = {}
) => {
  const { useCache = true, batchSize = 8, maxRetries = 3, contractAddress, limit = 100, withMetadata = true } = options;
  
  if (!contractAddress && !MARKETPLACE_CONTRACT_ADDRESS) {
    throw new Error('Marketplace contract address not configured');
  }

  // This is a placeholder implementation
  // The actual implementation would depend on your specific contract ABI and methods
  console.log('fetchNFTs called with:', { address, useCache, batchSize, maxRetries, contractAddress, limit, withMetadata });
  
  // Return empty array for now - this should be implemented based on your contract
  return [];
};

// Category mapping functions
export const mapCategoryToSpanish = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'art': 'Arte',
    'music': 'Música',
    'photography': 'Fotografía',
    'sports': 'Deportes',
    'gaming': 'Gaming',
    'collectibles': 'Coleccionables',
    'utility': 'Utilidad',
    'domain': 'Dominio',
    'other': 'Otro'
  };
  
  return categoryMap[category.toLowerCase()] || category;
};

export const normalizeCategory = (category: string): string => {
  const normalizedMap: { [key: string]: string } = {
    'arte': 'art',
    'música': 'music',
    'musica': 'music',
    'fotografía': 'photography',
    'fotografia': 'photography',
    'deportes': 'sports',
    'gaming': 'gaming',
    'coleccionables': 'collectibles',
    'utilidad': 'utility',
    'dominio': 'domain',
    'otro': 'other'
  };
  
  const normalized = normalizedMap[category.toLowerCase()];
  return normalized || category.toLowerCase();
};

// Default image for NFTs without image
export const DEFAULT_IMAGE = '/images/default-nft.png';