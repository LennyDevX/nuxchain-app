# Subgraph Deployment v0.42 - V6.0 Contracts Update
**Date:** February 16, 2026  
**Network:** Polygon Mainnet (Chain ID: 137)  
**Status:** ✅ Ready to Deploy

---

## 📋 What Changed from v0.41

### ✅ Contract Address Updates
All datasources updated to V6.0 deployed contract addresses:

| Contract | Old Address | New Address | Block |
|----------|-------------|-------------|-------|
| **EnhancedSmartStaking** | 0xAA334176... | **0x5F084a3E...** | 83048858 |
| **EnhancedSmartStakingRewards** | 0x6844540B... | **0xC72C9Bdf...** | 83048858 |
| **EnhancedSmartStakingGamification** | 0xc47929be... | **0xcA4E14cd...** | 83048858 |
| **EnhancedSmartStakingSkills** | 0xe2eed56a... | **0x6ADD8eAd...** | 83048858 |
| **GameifiedMarketplaceCore** | 0xe99f8550... | **0x170972A6...** | 83048858 |
| **IndividualSkillsMarketplace** | 0x462b22c7... | **0xAD586A4F...** | 83048858 |
| **GameifiedMarketplaceQuests** | 0x1ae4244d... | **0x00ABC705...** | 83048858 |

### 🔄 ABI Updates
✅ All ABIs updated from `src/abi/`:
- `EnhancedSmartStakingCoreV2.json` → `EnhancedSmartStaking.json`
- `GameifiedMarketplaceSkillsNft.json` (new)
- `MarketplaceSocial.json` (new)
- `MarketplaceStatistics.json` (new)
- `MarketplaceView.json` (new)
- `CollaboratorBadgeRewards.json` (new)
- `TreasuryManager.json` (new)

### 🏗️ Build Status
✅ **Codegen:** Types generated successfully  
✅ **Compilation:** All datasources compiled to WASM  
✅ **Output:** `build/subgraph.yaml` ready

---

## 🚀 Deployment Steps

### 1. Authenticate with The Graph
```bash
cd subgraph
graph auth --product hosted-service <YOUR_ACCESS_TOKEN>
```

### 2. Deploy to Hosted Service
```bash
# For production
npm run deploy

# Or manual deployment
graph deploy --product hosted-service <USERNAME>/nuxchain-protocol-v6
```

### 3. Deploy to Subgraph Studio (Recommended)
```bash
graph deploy --studio nuxchain-protocol-v6
```

---

## 📊 Indexing Information

### Start Block: 83048858
- **Date:** February 16, 2026
- **Timestamp:** ~2026-02-16 04:55:41 UTC
- All contracts deployed in same transaction for consistency

### Reindex Required: ✅ Yes
Since contract addresses changed, a full reindex from block 83048858 is necessary.

---

## 📝 Entities Indexed

### Smart Staking
- ✅ User (deposits, rewards, staking data)
- ✅ Deposit (stake events)
- ✅ Withdrawal (unstake events)
- ✅ Compound (auto-compound events)
- ✅ SkillProfile (user skills)
- ✅ Achievement (gamification badges)
- ✅ Quest (quests system)

### Marketplace
- ✅ NFTMint (token created)
- ✅ NFTList (token listed)
- ✅ NFTSale (token sold)
- ✅ NFTPurchase (purchase confirmed)
- ✅ OfferCreated (offer made)
- ✅ OfferAccepted (offer accepted)

### Global Statistics
- ✅ GlobalStats (daily totals)
- ✅ DailyStats (historical data)
- ✅ UserStats (per-user analytics)

---

## 🔍 Verification

After deployment, verify indexing with GraphQL query:

```graphql
{
  users(first: 1) {
    id
    totalDeposited
    totalStaked
    rewardsEarned
  }
  nftMints(first: 5) {
    id
    creator
    tokenId
    timestamp
  }
}
```

---

## ⚠️ Known Issues / Notes

### Still Disabled
- **GameifiedMarketplaceSkillsV2**: Contains `tuple[][]` type in ABI (graph-codegen limitation)
  - Can be re-enabled when The Graph fixes the bug or contract is updated

### Compatibility
- ✅ Polygon Mainnet
- ✅ API Version: 0.0.7
- ✅ Spec Version: 0.0.5

---

## 🔗 Deployed URLs (after deployment)

**Hosted Service:**
```
https://thegraph.com/hosted-service/subgraph/<USERNAME>/nuxchain-protocol-v6
```

**Subgraph Studio (Preferred):**
```
https://api.studio.thegraph.com/query/67890/nuxchain-protocol-v6/version/latest
```

---

## 📚 Command Reference

```bash
# Generate types
npm run codegen

# Build locally
npm run build

# Deploy to hosted service
npm run deploy

# Deploy to studio
graph deploy --studio nuxchain-protocol-v6

# Watch logs during indexing
graph deploy --studio nuxchain-protocol-v6 --debug

# List all subgraphs
graph ls
```

---

**Previous Deploy:** v0.41 (Feb 15, 2026)  
**Version:** 0.42  
**Status:** ✅ Ready for Production
