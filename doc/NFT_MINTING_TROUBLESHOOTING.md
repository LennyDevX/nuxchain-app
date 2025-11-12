# NFT Minting Troubleshooting Guide

## Issue: "Unknown Transaction" Error in OKX Wallet

### Root Cause
The OKX Wallet shows "Unknown transaction" when it cannot decode the transaction logs. This typically happens when:

1. **Insufficient Gas**: The transaction needs more gas than allocated
2. **Contract Not Recognized**: The wallet doesn't have the ABI to decode events
3. **Invalid Parameters**: The contract is rejecting parameters (skills, category, etc.)
4. **Network Issues**: Temporary blockchain network problems

### Solutions Applied

#### 1. **Improved Gas Estimation**
- Changed from fixed 500,000 gas to dynamic estimation
- Added 20% buffer to estimated gas
- Fallback to 1,000,000 gas if estimation fails
- Increased maximum gas limit to handle complex transactions

**File**: `src/hooks/nfts/useMintNFT.tsx`
```tsx
let gasEstimate = 500000n;
try {
  const estimated = await contract.estimateGas.createSkillNFT([...]);
  gasEstimate = (estimated * 120n) / 100n; // Add 20% buffer
} catch (estimateError) {
  console.warn("Gas estimation failed, using default:", estimateError);
  gasEstimate = 1000000n; // Increased default
}
```

#### 2. **Enhanced Category Mapping**
- Added support for both singular and plural forms
- Added aliases for common category names
- Provides sensible defaults

**File**: `src/hooks/nfts/useMintNFT.tsx`
```tsx
const categoryMap: Record<string, string> = {
  'art': 'arte',
  'artwork': 'arte',
  'collectible': 'coleccionables',
  'collectibles': 'coleccionables',
  // ... more mappings
};
```

#### 3. **Better Event Log Parsing**
- Changed from looking for non-existent "TokenMinted" event to standard ERC721 "Transfer" event
- Added fallback mechanisms for event extraction
- Detailed logging of all events in transaction receipt

**File**: `src/hooks/nfts/useMintNFT.tsx`
```tsx
// Look for Transfer event instead of TokenMinted
const transferEventSignature = keccak256(toHex("Transfer(address,address,uint256)"));
const transferEvent = receipt.logs.find(log => 
  log.topics[0] === transferEventSignature && 
  log.topics[1] === '0x0000000000000000000000000000000000000000000000000000000000000000' // from = 0x0 (mint)
);
```

#### 4. **Comprehensive Error Handling**
- Specific error messages for different failure scenarios
- Detection of contract-specific reverts (InvalidSkillConfiguration, MaxSkillsReached, etc.)
- Detailed console logging for debugging

**File**: `src/hooks/nfts/useMintNFT.tsx`
```tsx
if (error.message?.includes('execution reverted')) {
  if (reason.includes('InvalidSkillConfiguration')) {
    errorMessage = 'Invalid skill configuration. Please review your skills and try again.';
  } else if (reason.includes('MaxSkillsReached')) {
    errorMessage = 'Maximum number of skills reached. Please try with fewer skills.';
  }
  // ... more specific errors
}
```

#### 5. **Enhanced Error Display**
- Added support for showing mintError in the UI
- Better error propagation from hook to component
- Automatic error clearing after 5 seconds

**File**: `src/pages/Tokenization.tsx`
```tsx
try {
  const result = await mintNFT({...});
  if (result.success) { /* ... */ }
} catch (err) {
  const errorMsg = err instanceof Error ? err.message : 'Failed to create NFT';
  setError(errorMsg || mintError);
}
```

### What Happens During Minting

1. **File Upload Phase**
   - Image uploaded to IPFS via Pinata
   - Metadata JSON created and uploaded to IPFS
   - Returns tokenURI pointing to metadata

2. **Blockchain Phase**
   - Contract validates parameters (category, royalty, skills)
   - Gas is estimated dynamically
   - Transaction executed with safeguard gas limit
   - Receipt logs are parsed for Transfer events

3. **Confirmation Phase**
   - Transfer event is found in receipt logs
   - Token ID is extracted from event
   - Success status is returned to UI

### Common Issues and Fixes

#### "Insufficient funds to complete the transaction"
- **Issue**: Not enough MATIC in wallet
- **Fix**: Add more MATIC (recommend > 1 POL/MATIC)

#### "Invalid skill configuration"
- **Issue**: Skills parameters don't match contract expectations
- **Fix**: Verify all skills have:
  - skillType: 0-6
  - effectValue: valid number
  - rarity: 0-4

#### "MaxSkillsReached"
- **Issue**: Too many skills for the NFT
- **Fix**: Reduce number of skills (max depends on contract config)

#### "InsufficientStakingBalance"
- **Issue**: User doesn't have minimum staking to mint
- **Fix**: Stake more tokens via the Staking page

#### "Unknown Transaction (OKX Wallet)"
- **Issue**: Wallet can't decode transaction
- **Fix**: Transaction still goes through to blockchain. Check transaction in block explorer:
  - Go to [Polygon Scan](https://polygonscan.com)
  - Search for wallet address
  - Verify the transaction succeeded

### Debugging Steps

1. **Check Console Logs**
   - Open browser DevTools (F12)
   - Look for gas estimates and parameters
   - Check all logged receipt details

2. **Verify Transaction**
   - Copy transaction hash from error or success message
   - Paste into [Polygon Scan](https://polygonscan.com)
   - Verify status (success = 1, failed = 0)

3. **Check Wallet Balance**
   - Ensure you have enough MATIC
   - Verify contract address matches VITE_GAMEIFIED_MARKETPLACE_ADDRESS in .env

4. **Inspect Network**
   - Check if Polygon network is selected in wallet
   - Verify network status at https://status.polygon.technology/

### Environment Variables Required

```
VITE_GAMEIFIED_MARKETPLACE_ADDRESS=0x...
VITE_PINATA_JWT=your_jwt_token_here
```

### Testing Checklist

- [ ] Test with Standard NFT (no skills)
- [ ] Test with Skill NFT (1-5 skills)
- [ ] Test with different categories (Art, Music, Video, etc.)
- [ ] Test with different royalty percentages
- [ ] Verify transaction appears in Polygon Scan
- [ ] Verify NFT appears in user's NFTs page
- [ ] Check that token ID is correctly extracted

### References

- [ERC721 Transfer Event](https://docs.openzeppelin.com/contracts/2.x/api/token/erc721)
- [Polygon Documentation](https://polygon.technology/developers)
- [Pinata IPFS API](https://docs.pinata.cloud/)
