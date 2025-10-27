import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/nfts
 * 
 * Fetch NFTs with cursor-based pagination
 * Supports both local server and Vercel serverless
 * 
 * Authentication:
 * - Header: X-API-Key (optional in development, required in production)
 * - Query: apiKey (alternative to header)
 * 
 * Query Parameters:
 * - limit: number (default: 24) - items per page
 * - cursor: string (optional) - pagination cursor
 * 
 * Response:
 * {
 *   "items": NFTData[],
 *   "nextCursor": string | null,
 *   "hasMore": boolean,
 *   "total": number
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authentication check
    const apiKey = (req.headers['x-api-key'] || req.query.apiKey) as string;
    const serverApiKey = process.env.SERVER_API_KEY || 'dev-key';
    const nodeEnv = process.env.NODE_ENV || 'development';

    // In development, allow all requests (no auth required)
    // In production, validate API key
    const isDevelopment = nodeEnv === 'development';

    if (!isDevelopment) {
      // Production: require valid API key
      if (!apiKey) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'API key required. Provide X-API-Key header or apiKey query parameter.'
        });
      }

      if (apiKey !== serverApiKey) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Invalid API key'
        });
      }
    }
    // Development: skip authentication checks

    // Extract query parameters
    const {
      limit = '24',
      cursor
    } = req.query;

    const pageSize = Math.min(parseInt(limit as string) || 24, 100); // Max 100 per page
    const offset = cursor ? decodeCursor(cursor as string) : 0;

    // TODO: Replace with actual database query (call to blockchain or database)
    // For now, return mock data
    const mockNFTs = generateMockNFTs(pageSize, offset);
    const totalCount = 150; // Mock total count
    const hasMore = offset + pageSize < totalCount;
    const nextCursor = hasMore ? encodeCursor(offset + pageSize) : null;

    return res.status(200).json({
      items: mockNFTs,
      nextCursor,
      hasMore,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return res.status(500).json({
      error: 'Failed to fetch NFTs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Encode offset as cursor (base64)
 */
function encodeCursor(offset: number): string {
  return Buffer.from(offset.toString()).toString('base64');
}

/**
 * Decode cursor to offset
 */
function decodeCursor(cursor: string): number {
  try {
    return parseInt(Buffer.from(cursor, 'base64').toString(), 10);
  } catch {
    return 0;
  }
}

function generateMockNFTs(limit: number, offset: number) {
  const nfts = [];
  
  // TODO: In production, use Pinata gateway
  // const pinataGateway = process.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
  
  for (let i = offset; i < offset + limit; i++) {
    // Use placeholder images (in production, would come from IPFS/Pinata)
    const imageUrl = `https://via.placeholder.com/300x300?text=NFT+${i}`;
    
    nfts.push({
      tokenId: `${i}`,
      uniqueId: `nft-${i}`,
      name: `NFT #${i}`,
      description: `This is a mock NFT #${i}. In production, this would be fetched from blockchain and IPFS.`,
      // In production: image: `${pinataGateway}/ipfs/QmHash...`
      image: imageUrl,
      attributes: [
        { trait_type: 'category', value: 'art' },
        { trait_type: 'rarity', value: 'common' },
        { trait_type: 'edition', value: `${i}` }
      ],
      owner: `0x${'0'.repeat(40)}`,
      creator: `0x${'1'.repeat(40)}`,
      price: '1000000000000000000', // 1 ETH in wei
      isForSale: i % 2 === 0,
      likes: Math.floor(Math.random() * 1000).toString(),
      category: 'art',
      contract: `0x${'a'.repeat(40)}`,
      tokenURI: `ipfs://QmHash${i}`
    });
  }
  
  return nfts;
}
