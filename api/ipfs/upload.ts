/**
 * /api/ipfs/upload
 * Server-side Pinata proxy — keeps PINATA_JWT out of the browser bundle.
 *
 * POST /api/ipfs/upload?type=file  → multipart/form-data  (field: "file")
 * POST /api/ipfs/upload?type=json  → application/json     (body: NFTMetadata)
 *
 * Returns: { IpfsHash: string, url: string }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const PINATA_API = 'https://api.pinata.cloud/pinning';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud';

// ─── helpers ────────────────────────────────────────────────────────────────

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
}

function getJwt(): string {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error('PINATA_JWT environment variable not configured');
  return jwt;
}

// ─── file upload (multipart/form-data forwarded to Pinata) ──────────────────

async function uploadFile(req: VercelRequest, res: VercelResponse) {
  // Forward the raw body as-is — Vercel passes multipart body as Buffer
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({ error: 'Expected multipart/form-data for file upload' });
  }

  const pinatRes = await fetch(`${PINATA_API}/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getJwt()}`,
      'Content-Type': contentType,
    },
    // Node.js VercelRequest body is a Buffer when bodyParser is disabled
    // @ts-ignore — readable stream compatible
    body: req as unknown as ReadableStream,
    duplex: 'half',
  } as RequestInit);

  const data = await pinatRes.json();
  if (!pinatRes.ok) {
    return res.status(pinatRes.status).json({ error: data?.error?.details || 'Pinata file upload failed' });
  }

  return res.status(200).json({
    IpfsHash: data.IpfsHash,
    url: `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`,
  });
}

// ─── JSON metadata upload ────────────────────────────────────────────────────

async function uploadJson(req: VercelRequest, res: VercelResponse) {
  const metadata = req.body;
  if (!metadata || typeof metadata !== 'object') {
    return res.status(400).json({ error: 'Expected JSON body with NFT metadata' });
  }

  const pinatRes = await fetch(`${PINATA_API}/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getJwt()}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${(metadata as Record<string, string>).name || 'nft'}_metadata`,
        keyvalues: { type: 'nft_metadata' },
      },
    }),
  });

  const data = await pinatRes.json();
  if (!pinatRes.ok) {
    return res.status(pinatRes.status).json({ error: data?.error?.details || 'Pinata JSON upload failed' });
  }

  return res.status(200).json({
    IpfsHash: data.IpfsHash,
    url: `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`,
  });
}

// ─── handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const type = (req.query.type as string) || 'json';

    if (type === 'file') return await uploadFile(req, res);
    if (type === 'json') return await uploadJson(req, res);

    return res.status(400).json({ error: 'Invalid type. Use ?type=file or ?type=json' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
}

// Disable body parser for file uploads so we can forward the raw stream
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
