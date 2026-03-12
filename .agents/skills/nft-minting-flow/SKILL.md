---
name: nft-minting-flow
description: Implement NFT minting, tokenization, or NFT-related features in NuxChain. Use when user says "mint NFT", "create NFT", "tokenization", "NFT collection", "IPFS upload", "NFT metadata", "NFT marketplace", "NuxPass", "Avatar NFT", or any NFT creation/display work. Covers the full flow from upload to on-chain mint.
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain NFT Minting Flow Skill

Implement NFT minting and tokenization features following NuxChain's patterns.

## NFT Collections in NuxChain

```
public/AvatarsNFTs/          ← Avatar NFT images (Avatar1.png ... Avatar14.png)
public/NuxPassNFTs.png       ← Nux-Pass collection preview
public/NuxPassMinting.jpg

src/components/
  tokenization/              ← NFT creation UI components
  nfts/                      ← NFT display and gallery components
  marketplace/               ← NFT marketplace components

src/pages/
  Tokenization.tsx           ← /create-my-nfts and /tokenization routes
  NFTs.tsx                   ← /nfts route
  Marketplace.tsx            ← /marketplace route
```

## Minting Flow Overview

```
1. User uploads image → IPFS (Pinata or NFT.Storage)
2. Generate metadata JSON → upload to IPFS
3. Call mint() on NFT contract with tokenURI
4. Wait for transaction confirmation
5. Display minted NFT to user
```

## IPFS Upload (Pinata)

```typescript
const uploadToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
    },
    body: formData,
  });

  const { IpfsHash } = await response.json();
  return `ipfs://${IpfsHash}`;
};
```

## NFT Metadata Standard (ERC-721)

```typescript
interface NFTMetadata {
  name: string;
  description: string;
  image: string;          // ipfs://... URI
  external_url?: string;  // https://nuxchain.com/nfts/...
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

const uploadMetadata = async (metadata: NFTMetadata): Promise<string> => {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
    },
    body: JSON.stringify(metadata),
  });

  const { IpfsHash } = await response.json();
  return `ipfs://${IpfsHash}`;
};
```

## Minting with wagmi

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import NFT_ABI from '../../abi/MyNFTCollection/MyNFTCollection.json';

const NFT_CONTRACT = '0x...' as `0x${string}`;

const { writeContract, data: txHash, isPending } = useWriteContract();
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

const handleMint = async () => {
  // 1. Upload image to IPFS
  const imageUri = await uploadToIPFS(selectedFile);

  // 2. Create and upload metadata
  const metadata: NFTMetadata = {
    name: `NuxChain NFT #${tokenId}`,
    description: 'A unique NuxChain NFT with staking utility.',
    image: imageUri,
    attributes: [
      { trait_type: 'Rarity', value: 'Common' },
      { trait_type: 'Staking Boost', value: '5%' },
    ],
  };
  const tokenUri = await uploadMetadata(metadata);

  // 3. Mint on-chain
  writeContract({
    address: NFT_CONTRACT,
    abi: NFT_ABI,
    functionName: 'mint',
    args: [userAddress, tokenUri],
  });
};
```

## Minting UI State Pattern

```tsx
const MintButton: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <button
        onClick={handleMint}
        disabled={isPending || isConfirming || !selectedFile}
        className={`btn-primary jersey-20-regular w-full ${
          isMobile ? 'py-3 text-xl' : 'py-4 text-2xl'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isPending ? 'Confirm in wallet...' :
         isConfirming ? 'Minting...' :
         isSuccess ? '✓ Minted!' :
         'Mint NFT'}
      </button>

      {isSuccess && txHash && (
        <a
          href={`https://polygonscan.com/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-purple-400 underline jersey-20-regular"
        >
          View on PolygonScan →
        </a>
      )}
    </div>
  );
};
```

## NFT Display Card

```tsx
interface NFTCardProps {
  tokenId: number;
  image: string;
  name: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}

const NFTCard: React.FC<NFTCardProps> = ({ tokenId, image, name, attributes }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`card-unified overflow-hidden ${isMobile ? 'p-3' : 'p-4'}`}>
      <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-black/20">
        <img
          src={image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <h3 className={`font-bold text-white jersey-15-regular ${isMobile ? 'text-lg' : 'text-xl'}`}>
        {name}
      </h3>
      <p className="text-slate-500 text-xs jersey-20-regular">#{tokenId}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {attributes.slice(0, 3).map(attr => (
          <span
            key={attr.trait_type}
            className="text-xs px-2 py-0.5 rounded-full border border-purple-500/20 text-purple-400 bg-black/20 jersey-20-regular"
          >
            {attr.value}
          </span>
        ))}
      </div>
    </div>
  );
};
```

## IPFS Gateway Conversion

```typescript
// Always convert ipfs:// to a gateway URL for display
const toGatewayUrl = (ipfsUri: string): string => {
  if (ipfsUri.startsWith('ipfs://')) {
    return ipfsUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return ipfsUri;
};
```

## Environment Variables

```
VITE_PINATA_JWT            ← Pinata JWT for IPFS uploads (frontend)
VITE_NFT_CONTRACT_ADDRESS  ← NFT contract address
```

## ABI Location

After deploying an NFT contract, add its ABI to:
```
src/abi/<ContractName>/<ContractName>.json
```
Then update `src/abi/abis-by-category.json` to include it.
