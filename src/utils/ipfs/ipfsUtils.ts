import type { PublicClient } from 'viem';
import type { NFTMetadata } from '../../types/nft';

// PINATA_JWT intentionally NOT referenced here — uploads go through /api/ipfs/upload proxy
// so the JWT never appears in the browser bundle.
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// Resolve API base: relative path works on Vercel, absolute for local dev
const IPFS_UPLOAD_URL =
  import.meta.env.PROD
    ? '/api/ipfs/upload'
    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'}/api/ipfs/upload`;
const MARKETPLACE_CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_ADDRESS;

// ONLY verified working public IPFS gateways (tested and functional)
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs',              // ✅ Protocol Labs official - ALWAYS works
  'https://dweb.link/ipfs',            // ✅ Protocol Labs alternative - reliable
  'https://gateway.pinata.cloud/ipfs', // ✅ Pinata - has rate limits but works
];

// In-memory cache for metadata to reduce duplicate requests
const metadataCache = new Map<string, { data: NFTMetadata; timestamp: number }>();
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes - longer cache to reduce requests

// Track gateway failures to prioritize working gateways
const gatewayFailures = new Map<string, number>();
const GATEWAY_FAILURE_THRESHOLD = 2; // Quick failover

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Extract CID from IPFS URL
const extractCID = (url: string): string | null => {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  const match = url.match(/\/ipfs\/([^/?#]+)/);
  return match ? match[1] : null;
};

// Get best available gateway (avoiding failed ones)
const getBestGateway = (): string => {
  const availableGateways = IPFS_GATEWAYS.filter(
    gateway => (gatewayFailures.get(gateway) || 0) < GATEWAY_FAILURE_THRESHOLD
  );
  
  if (availableGateways.length === 0) {
    // Reset failures if all gateways are down
    gatewayFailures.clear();
    return IPFS_GATEWAYS[0];
  }
  
  // Prefer ipfs.io as primary, then rotate others
  if (availableGateways.includes('https://ipfs.io/ipfs') && 
      (gatewayFailures.get('https://ipfs.io/ipfs') || 0) === 0) {
    return 'https://ipfs.io/ipfs';
  }
  
  // Return random gateway to distribute load
  return availableGateways[Math.floor(Math.random() * availableGateways.length)];
};

// Mark gateway as failed
const markGatewayFailed = (gateway: string) => {
  const failures = (gatewayFailures.get(gateway) || 0) + 1;
  gatewayFailures.set(gateway, failures);
  // Only log if threshold reached
  if (failures >= GATEWAY_FAILURE_THRESHOLD) {
    console.warn(`Gateway ${gateway.split('/')[2]} temporarily disabled`);
  }
};

// Mark gateway as successful (reset failure count)
const markGatewaySuccess = (gateway: string) => {
  gatewayFailures.delete(gateway);
};

// Fetch with multiple gateway fallback and exponential backoff for rate limiting
async function fetchWithGatewayFallback(
  cid: string,
  options: RequestInit = {}
): Promise<Response> {
  let lastError: Error | null = null;
  
  // Try all available gateways
  for (let attempt = 0; attempt < IPFS_GATEWAYS.length; attempt++) {
    const gateway = getBestGateway();
    const url = `${gateway}/${cid}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors',
        cache: 'force-cache' // Aggressive caching
      });
      
      clearTimeout(timeoutId);
      
      // Success
      if (response.ok) {
        markGatewaySuccess(gateway);
        return response;
      }
      
      // Rate limit or server error - use exponential backoff
      if (response.status === 429 || response.status >= 500) {
        markGatewayFailed(gateway);
        // Exponential backoff: 500ms, 1s, 2s, 4s with jitter
        const backoffMs = Math.min(500 * Math.pow(2, attempt) + Math.random() * 1000, 8000);
        console.warn(`[IPFS] Gateway ${gateway.split('/')[2]} returned ${response.status}, retrying in ${Math.round(backoffMs)}ms...`);
        await sleep(backoffMs);
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      markGatewayFailed(gateway);
      
      // Only continue if we have more gateways to try - use exponential backoff
      if (attempt < IPFS_GATEWAYS.length - 1) {
        const backoffMs = Math.min(500 * Math.pow(2, attempt) + Math.random() * 1000, 8000);
        await sleep(backoffMs);
      }
    }
  }
  
  throw lastError || new Error('All IPFS gateways failed');
}

// Upload file to IPFS — routed through /api/ipfs/upload so PINATA_JWT stays server-side
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);

  const metadata = JSON.stringify({
    name: `${file.name}_image`,
    keyvalues: { type: 'nft_image' },
  });
  uploadFormData.append('pinataMetadata', metadata);

  const options = JSON.stringify({ cidVersion: 0 });
  uploadFormData.append('pinataOptions', options);

  const response = await fetch(`${IPFS_UPLOAD_URL}?type=file`, {
    method: 'POST',
    body: uploadFormData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Invalid Pinata credentials (server-side).');
    if (response.status === 403) throw new Error('Pinata API key lacks required permissions.');
    if (response.status === 413) throw new Error('File too large. Maximum file size is 10MB.');
    throw new Error(`Failed to upload image to IPFS (${response.status}): ${err.error || response.statusText}`);
  }

  const result = await response.json();
  return result.url || `${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`;
};

// Upload JSON metadata to IPFS — routed through /api/ipfs/upload so PINATA_JWT stays server-side
export const uploadJsonToIPFS = async (metadata: NFTMetadata): Promise<string> => {
  const response = await fetch(`${IPFS_UPLOAD_URL}?type=json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Invalid Pinata credentials (server-side).');
    if (response.status === 403) throw new Error('Pinata API key lacks required permissions.');
    throw new Error(`Failed to upload metadata to IPFS (${response.status}): ${err.error || response.statusText}`);
  }

  const result = await response.json();
  return result.url || `${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`;
};

// Fetch token metadata from IPFS with caching and multi-gateway fallback
export const fetchTokenMetadata = async (tokenURI: string): Promise<NFTMetadata | null> => {
  if (!tokenURI) return null;
  
  // Check cache first
  const cached = metadataCache.get(tokenURI);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    let cid: string | null = null;
    
    // Extract CID from various URL formats
    if (tokenURI.startsWith('ipfs://')) {
      cid = tokenURI.replace('ipfs://', '');
    } else if (tokenURI.includes('/ipfs/')) {
      cid = extractCID(tokenURI);
    } else if (tokenURI.startsWith('http')) {
      // If it's already an HTTP URL, try to fetch directly with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(tokenURI, { 
          signal: controller.signal,
          mode: 'cors',
          cache: 'default'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const metadata: NFTMetadata = await response.json();
          metadataCache.set(tokenURI, { data: metadata, timestamp: Date.now() });
          return metadata;
        }
      } catch {
        // If direct fetch fails, try to extract CID and use gateways
        cid = extractCID(tokenURI);
        if (!cid) return null;
      }
    }
    
    if (!cid) return null;
    
    // Use multi-gateway fallback
    const response = await fetchWithGatewayFallback(cid);
    
    if (!response.ok) {
      console.warn(`Metadata fetch failed with status: ${response.status}`);
      return null;
    }
    
    const metadata: NFTMetadata = await response.json();
    
    // Cache the result
    metadataCache.set(tokenURI, { data: metadata, timestamp: Date.now() });
    
    // Cleanup old cache entries (keep cache size under control)
    if (metadataCache.size > 1000) {
      const entries = Array.from(metadataCache.entries());
      const oldestEntry = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldestEntry) {
        metadataCache.delete(oldestEntry[0]);
      }
    }
    
    return metadata;
  } catch {
    // Silently fail to reduce console noise
    return null;
  }
};

// Convert IPFS URL to HTTP URL using best available gateway
export const ipfsToHttp = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  
  // Extract CID from various formats
  const cid = extractCID(ipfsUrl);
  if (cid) {
    // Use best available gateway for images
    const gateway = getBestGateway();
    return `${gateway}/${cid}`;
  }
  
  // If already HTTP and not IPFS, return as-is
  if (ipfsUrl.startsWith('http') && !ipfsUrl.includes('/ipfs/')) {
    return ipfsUrl;
  }
  
  // Fallback: try to convert ipfs:// 
  if (ipfsUrl.startsWith('ipfs://')) {
    const gateway = getBestGateway();
    return ipfsUrl.replace('ipfs://', `${gateway}/`);
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

// Default image for NFTs without image - using data URI to avoid 404
export const DEFAULT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ORlQ8L3RleHQ+PC9zdmc+';