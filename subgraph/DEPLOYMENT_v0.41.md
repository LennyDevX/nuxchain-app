# Subgraph Deployment v0.41 - Feb 15, 2026

## Summary of Changes

**Version**: v0.40 → v0.41  
**Date**: February 15, 2026  
**Reason**: Updated all contract addresses to match new mainnet deployment

## Updated Contracts

| Contract | Old Address | New Address | Start Block |
|----------|-------------|-------------|-------------|
| **EnhancedSmartStaking Core** | `0xC67F0...DbF3` | `0xAA334...9E1c` | 83023000 |
| **EnhancedSmartStakingRewards** | `0x6AEd7...f3` | `0x6844...5CBA` | 83023000 |
| **EnhancedSmartStakingGamification** | `0x9021...598` | `0xc479...c97` | 83023000 |
| **EnhancedSmartStakingSkills** | `0x8Ea7...140` | `0xe2ee...d5` | 83023000 |
| **GameifiedMarketplace Proxy** | `0xd502...d5` | `0xe99f...Ee1` | 83023000 |
| **IndividualSkillsMarketplace** | `0xB232...df3` | `0x462b...F1` | 83023000 |
| **GameifiedMarketplaceQuests** | `0x61D7...245` | `0x1ae4...A0` | 83023000 |

## Files Modified

1. ✅ **subgraph/subgraph.yaml** - Updated 7 contract addresses and startBlocks
2. ✅ **subgraph/package.json** - Bumped version to 0.41
3. ✅ **src/lib/apollo-client.ts** - Updated endpoint to v0.41
4. ✅ **subgraph/README.md** - Updated contract documentation

## Build Status

✅ **Codegen**: Successful  
✅ **Build**: Successful  
⏳ **Deployment**: Ready to deploy

## Deployment Instructions

### Step 1: Deploy to The Graph Studio
```bash
cd subgraph
npm run deploy
```

This will:
- Deploy version v0.41 to The Graph Studio
- Start indexing from block 83023000
- Use deploy key already configured in package.json

### Step 2: Monitor Deployment
1. Visit: https://thegraph.com/studio/subgraph/nuxchain/
2. Watch the "Indexing Status" progress bar
3. Check for any indexing errors in the logs
4. Wait for sync to reach current block (~83027000+)

**Expected sync time**: 10-30 minutes (depending on event volume)

### Step 3: Verify Data After Sync

Test with GraphQL query in Studio Playground:
```graphql
{
  _meta {
    block {
      number
      timestamp
    }
    deployment
    hasIndexingErrors
  }
  
  deposits(first: 5, orderBy: timestamp, orderDirection: desc) {
    id
    user {
      id
    }
    amount
    timestamp
  }
  
  activities(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    type
    user
    amount
    timestamp
  }
}
```

### Step 4: Update Frontend (Already Done ✅)
The frontend `src/lib/apollo-client.ts` has been updated to query v0.41 endpoint. No additional changes needed.

## Impact Analysis

### What This WILL Fix ✅
- Activity feeds will show transactions from new contracts
- Historical data indexing for Feb 15, 2026 deployment
- NFT marketplace event tracking
- Skills/achievements data
- Transaction history queries

### What This WON'T Fix ❌
- **Pool Info Zero Balance Issue** - This uses direct contract calls (wagmi), not subgraph
- **Deposit Visibility in UI** - Separate contract read/parsing issue being debugged
- **Treasury Balance Display** - Uses direct contract calls, not subgraph queries

## Rollback Plan (If Needed)

If deployment fails or causes issues:

```bash
# Revert apollo-client.ts endpoint
SUBGRAPH_URL = "https://api.studio.thegraph.com/query/122195/nuxchain/v0.40"
```

Previous v0.40 will continue working for old contracts until you're ready to redeploy.

## Post-Deployment Checklist

- [ ] Deployment successful in The Graph Studio
- [ ] No indexing errors in logs
- [ ] Synced to current block
- [ ] GraphQL queries return recent data
- [ ] Activity feed in UI displays transactions
- [ ] NFT marketplace shows minted/sold items

## Notes

- The subgraph indexes **historical events only** - it does not affect real-time contract reads
- Pool Info component uses direct wagmi calls, so subgraph update won't fix zero balance issues
- For Pool Info debugging, continue with ContractDiagnostics component approach

## Contact

If deployment issues occur:
1. Check The Graph Studio logs for specific errors
2. Verify contract addresses in .env match subgraph.yaml
3. Confirm startBlock is before first event emission
4. Review ABI compatibility with deployed contracts

---

**Status**: Ready for deployment ✅  
**Build**: Successful ✅  
**Version**: v0.41  
**Date**: February 15, 2026
