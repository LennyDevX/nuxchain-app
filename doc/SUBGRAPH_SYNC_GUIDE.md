# Subgraph Synchronization Guide

## Overview

The Nuxchain platform uses **The Graph** to index blockchain events and provide fast activity queries. When you perform actions like staking, minting NFTs, or making transactions, these events need to be indexed by the subgraph before they appear in your Recent Activity.

## Current Status

**Subgraph Deployment**: `https://thegraph.com/hosted-service/subgraph/nuxchain/nuxchain`

## Understanding Sync Status

In the **Profile > Recent Activity** section, you'll see a sync status indicator:

### Status Indicators

| Status | Color | Meaning |
|--------|-------|---------|
| **Live** | 🟢 Green | Subgraph is current (within 1 minute of latest block) |
| **Syncing** | 🟡 Yellow | Subgraph is catching up (1-5 minutes behind) |
| **Behind** | 🟠 Orange | Subgraph is significantly behind (5+ minutes) |
| **Indexing errors** | 🔴 Red | Subgraph encountered indexing issues |

### Checking the Status

1. Go to **Profile** → **Recent Activity**
2. Look at the status line: `[Status] • Block #123456 • 2m ago`
3. Click on it to see detailed information

## Why Activities Don't Show Immediately

When you perform a transaction (e.g., staking):

1. **Transaction submitted** (instant)
2. **Block confirmed** (~5-10 seconds on Polygon)
3. **Subgraph indexes event** (1-2 minutes)
4. **Activity appears** in your profile

**Total time: 2-3 minutes**

## Troubleshooting

### 1. Activities Not Showing After Staking

**Symptoms:**
- You made a deposit but don't see it in Recent Activity
- Status shows "Syncing" or "Behind"

**Solution:**
```
✓ Wait 2-3 minutes for the subgraph to index
✓ Click "Refresh Activities" in the sync status popup
✓ Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
```

### 2. Sync Status Shows "Indexing Errors"

**Symptoms:**
- Red status indicator
- Activities may be incomplete

**Solution:**
```
✓ This is temporary - the subgraph will auto-recover
✓ Wait 5-10 minutes
✓ Refresh and check again
✓ Contact support if persists > 30 minutes
```

### 3. Sync Status Unavailable

**Symptoms:**
- Red dot with "Subgraph unavailable"
- Cannot click for details

**Solution:**
```
✓ The subgraph might be temporarily offline
✓ Check https://thegraph.com/hosted-service/subgraph/nuxchain/nuxchain
✓ Try refreshing after 1-2 minutes
✓ Use the "Clear Cache and Refresh" button for force refresh
```

## How to Clear Cache and Refresh

In **Profile > Recent Activity**, there's a "Clear Cache" button that:

1. ✅ Clears Apollo Client cache
2. ✅ Forces fresh data fetch from The Graph
3. ✅ Shows latest activities

**Use this if:**
- You made a transaction but don't see it
- Status shows old block numbers
- You want to force a sync check

## Monitoring Subgraph Health

### Real-time Monitoring

```
Visit: https://thegraph.com/hosted-service/subgraph/nuxchain/nuxchain

You'll see:
- Current synced block
- Deployment status
- Recent queries
- Indexing progress
```

### GraphQL Query Examples

**Check latest activities:**
```graphql
{
  activities(first: 5, orderBy: timestamp, orderDirection: desc) {
    id
    type
    user
    amount
    timestamp
    transactionHash
  }
}
```

**Check user profile:**
```graphql
{
  user(id: "0x1234...") {
    id
    depositCount
    withdrawalCount
    totalDeposited
    updatedAt
  }
}
```

## Expected Behavior

### Staking Deposit
```
1. You confirm transaction (MetaMask)
2. Wait ~10 seconds for block confirmation
3. Wait ~1-2 minutes for subgraph indexing
4. See activity: "💎 Staked X.XX POL (30 Days)"
```

### NFT Minting
```
1. You confirm transaction
2. Wait ~10 seconds for block confirmation
3. Wait ~1-2 minutes for subgraph indexing
4. See activity: "🎨 Minted NFT #12345"
```

### Marketplace Transaction
```
1. You confirm transaction
2. Wait ~10 seconds for block confirmation
3. Wait ~1-2 minutes for subgraph indexing
4. See activity: "💵 Sold NFT #12345 for X POL"
```

## Performance

| Metric | Expected | Max |
|--------|----------|-----|
| Query Time | ~200ms | 5s |
| Index Delay | 1-2 min | 5 min |
| Cache TTL | 0s | (always fresh) |
| Polling Interval | 30s | - |

## Technical Details

### Indexed Events

The subgraph indexes events from:

**EnhancedSmartStaking.sol:**
- ✅ Deposited
- ✅ Withdrawn
- ✅ RewardsCompounded
- ✅ SkillActivated
- ✅ SkillDeactivated

**GameifiedMarketplace.sol:**
- ✅ NFTMinted
- ✅ NFTListed
- ✅ NFTSold
- ✅ OfferCreated
- ✅ OfferAccepted

### Activity Entity

```typescript
type Activity {
  id: ID!                    // tx hash + log index
  type: ActivityType!        // STAKING_DEPOSIT, NFT_MINT, etc
  user: Bytes!               // wallet address
  timestamp: BigInt!         // block timestamp
  transactionHash: Bytes!    // tx hash
  blockNumber: BigInt!       // block number
  amount: BigInt             // for staking/trades
  tokenId: BigInt            // for NFT activities
  lockupDuration: BigInt     // for staking
  category: String           // for NFTs
}
```

## Deployment & Updates

### Current Version
- **Subgraph Version**: v0.0.2
- **Network**: Polygon (PoS)
- **Deploy Command**: 
  ```bash
  npm run deploy
  ```

### Redeployment

If you need to redeploy the subgraph:

```bash
cd subgraph

# 1. Codegen (generates TypeScript from schema)
npm run codegen

# 2. Build WASM
npm run build

# 3. Deploy to hosted service
npm run deploy
```

Deploy key is stored in `package.json` (restricted access).

## FAQ

**Q: Why does it take 2-3 minutes?**  
A: The subgraph needs to wait for block confirmation (~10s) then index the event (~60-120s). This is normal and ensures data accuracy.

**Q: Can I see activities before the subgraph syncs?**  
A: Not recommended. The legacy `useRecentActivities` hook uses direct RPC calls but has rate limiting and is slower (~6 hours for large queries).

**Q: What if I'm seeing old activities?**  
A: Click "Clear Cache and Refresh" to force a fresh fetch from the subgraph.

**Q: How many activities can I view?**  
A: Default is 10 most recent. You can change via `useRecentActivities(maxActivities)`.

**Q: Are activities sorted correctly?**  
A: Yes, by timestamp descending (most recent first). Duplicates are removed by transaction hash + type.

## Support

If activities aren't showing after 5+ minutes:

1. **Check status**: Look at the sync status indicator
2. **Verify transaction**: Check block explorer (https://polygonscan.com)
3. **Try refresh**: Clear cache and refresh
4. **Contact support**: Include transaction hash and timestamp

---

**Last Updated**: November 2025  
**Status**: ✅ Deployed and Live
