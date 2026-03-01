---
name: nft-minting-flow
description: Implement NFT minting, tokenization, or NFT-related features in NuxChain. Use when user says "mint NFT", "create NFT", "tokenization", "NFT collection", "IPFS upload", "NFT metadata", "NFT marketplace", "DragonixCard", "Avatar NFT", or any NFT creation/display work.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

See full skill at: .agents/skills/nft-minting-flow/SKILL.md

# NFT Minting Flow — Quick Reference

## Key Files
- Components: `src/components/tokenization/`, `src/components/nfts/`, `src/components/marketplace/`
- Pages: `src/pages/Tokenization.tsx` (/create-my-nfts), `src/pages/NFTs.tsx`, `src/pages/Marketplace.tsx`
- Public assets: `public/AvatarsNFTs/`, `public/DragonixCardNFTs.png`
- ABIs: `src/abi/<ContractName>/`

## Minting Flow
1. Upload image → IPFS (Pinata JWT: `VITE_PINATA_JWT`)
2. Upload metadata JSON → IPFS
3. Call `mint(address, tokenUri)` on NFT contract
4. Wait for tx confirmation

## IPFS Upload
```typescript
const formData = new FormData();
formData.append('file', file);
const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
  method: 'POST',
  headers: { Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}` },
  body: formData,
});
const { IpfsHash } = await res.json();
return `ipfs://${IpfsHash}`;
```

## Gateway Conversion
```typescript
const toGatewayUrl = (uri: string) => uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
```

## Mint with wagmi
```typescript
const { writeContract, data: txHash } = useWriteContract();
const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
writeContract({ address: NFT_CONTRACT, abi: NFT_ABI, functionName: 'mint', args: [userAddress, tokenUri] });
```
