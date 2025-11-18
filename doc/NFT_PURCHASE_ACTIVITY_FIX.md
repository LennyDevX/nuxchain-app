# 🛒 NFT Purchase Activity Fix - Recent Activity Not Showing Purchases

## Problem Description
When an NFT was purchased, the activity did NOT appear in the "Recent Activity" section of the buyer's profile. However, the seller could see the "NFT_SALE" activity. This was a critical issue affecting the marketplace gamification and activity tracking.

## Root Cause Analysis

### What was happening:
1. When `TokenSold` event was emitted on-chain, the subgraph handler only created ONE activity:
   - **Activity for SELLER** with `type: "NFT_SALE"` and `user: seller.id`
   - ❌ NO activity was created for the BUYER

2. The GraphQL query `GET_USER_PURCHASE_ACTIVITIES` was looking for:
   - `type: "TOKEN_SALE"` (wrong type name)
   - Using `buyer: $userAddress` filter (which worked for looking up activities by buyer field, but no activities existed with that structure)

### Why it was broken:
- The subgraph only created activities where the user was the "actor" (creator, lister, seller, offerer)
- Buyers were not considered "actors" in the transaction, so their activities were never indexed
- Without indexed activities for buyers, the query would always return empty results

## Solution Implementation

### 1. Fixed Subgraph Handler (`subgraph/src/gameified-marketplace.ts`)

**Before:**
```typescript
export function handleTokenSold(event: TokenSold): void {
  // Only created ONE activity for seller
  const activity = new Activity(...)
  activity.type = "NFT_SALE"
  activity.user = seller.id  // Only seller could query this
  activity.buyer = buyer.id  // Field existed but no activity for buyer
  activity.save()
}
```

**After:**
```typescript
export function handleTokenSold(event: TokenSold): void {
  // ✅ SELLER ACTIVITY
  const sellerActivity = new Activity(...)
  sellerActivity.type = "NFT_SALE"
  sellerActivity.user = seller.id
  sellerActivity.buyer = buyer.id
  sellerActivity.save()

  // ✅ BUYER ACTIVITY (NEW!)
  const buyerActivity = new Activity(...)
  buyerActivity.type = "NFT_PURCHASE"
  buyerActivity.user = buyer.id  // <- KEY: buyer is the user/actor
  buyerActivity.buyer = buyer.id
  buyerActivity.seller = seller.id
  buyerActivity.save()
}
```

**Key Changes:**
- Created a SEPARATE activity for the buyer after each sale
- Set `user: buyer.id` so the buyer can query their activities
- Used different activity IDs (`-seller` and `-buyer` suffixes) to avoid collisions

### 2. Fixed GraphQL Query (`src/lib/graphql/queries.ts`)

**Before:**
```graphql
query GetUserPurchaseActivities($userAddress: Bytes!, $first: Int!, $skip: Int!) {
  activities(
    where: { buyer: $userAddress, type: "TOKEN_SALE" }  # ❌ Wrong approach
    # ...
  )
}
```

**After:**
```graphql
query GetUserPurchaseActivities($userAddress: Bytes!, $first: Int!, $skip: Int!) {
  activities(
    where: { user: $userAddress, type: "NFT_PURCHASE" }  # ✅ Correct approach
    # ...
  )
}
```

**Key Changes:**
- Changed from `buyer: $userAddress` to `user: $userAddress`
- Changed from `type: "TOKEN_SALE"` to `type: "NFT_PURCHASE"`
- Now queries for activities where the user IS the buyer, not just mentioned in the buyer field

### 3. Simplified Hook Logic (`src/hooks/activity/useRecentActivitiesGraph.ts`)

**Before:**
```typescript
// Transformed TOKEN_SALE activities to NFT_PURCHASE manually
const transformedPurchases = purchasesData.map(activity => {
  // Convert type from TOKEN_SALE to NFT_PURCHASE
  return { ...activity, type: 'NFT_PURCHASE' }
})
```

**After:**
```typescript
// Activities are already NFT_PURCHASE from subgraph
const transformedPurchases = purchasesData.map(activity => {
  // No transformation needed - type is already correct
  return activity
})
```

## Deployment Steps

### Required Actions:

1. **Redeploy the Subgraph** to The Graph Studio:
   ```bash
   cd subgraph
   npm run build              # Build the subgraph
   graph auth --studio <DEPLOY_KEY>
   graph deploy --studio nuxchain
   ```
   - This updates the indexing logic on The Graph
   - All new NFT sales will create buyer activities
   - Existing data will not be reindexed (only new blocks)

2. **Restart the Frontend** to use updated code:
   ```bash
   npm run dev
   ```

3. **Test with a New NFT Purchase**:
   - Create a test NFT
   - Sell it with wallet A
   - Buy it with wallet B
   - Verify both activities appear:
     - Wallet A: "Sold NFT #X for Y POL" (NFT_SALE)
     - Wallet B: "Purchased NFT #X for Y POL" (NFT_PURCHASE)

## Expected Behavior After Fix

### User Activity Flow:
1. **Seller lists NFT** → `NFT_LIST` activity appears in seller's activity
2. **Buyer purchases NFT** → 
   - `NFT_SALE` activity appears in seller's activity
   - `NFT_PURCHASE` activity appears in **buyer's** activity (NEW!)
3. **Buyer sees their purchase** in recent activity

### Activity Types now properly tracked:
- `NFT_MINT` - Creating an NFT
- `NFT_LIST` - Listing an NFT for sale
- `NFT_SALE` - Selling an NFT (visible to seller)
- `NFT_PURCHASE` - Purchasing an NFT (visible to buyer) ✅ **NEW**
- `NFT_UNLIST` - Removing NFT from sale
- `OFFER_MADE` - Making an offer
- `OFFER_ACCEPTED` - Accepting an offer

## Files Modified

1. ✅ `subgraph/src/gameified-marketplace.ts` - Added buyer activity in `handleTokenSold`
2. ✅ `src/lib/graphql/queries.ts` - Fixed `GET_USER_PURCHASE_ACTIVITIES` query
3. ✅ `src/hooks/activity/useRecentActivitiesGraph.ts` - Simplified purchase transformation + better logging

## Verification Checklist

- [x] Subgraph compiles without errors
- [x] TypeScript types are correct
- [x] GraphQL query syntax is valid
- [ ] Subgraph is redeployed to The Graph Studio
- [ ] New NFT purchases appear in buyer's recent activity
- [ ] All activity types display correctly with icons and colors
- [ ] No duplicate activities in the activity list

## Related Issues

- Previous issue: Activities showed only for sellers, not buyers
- Gamification impact: Buyers couldn't earn XP for purchases
- User experience: No feedback that purchase was successful in activity feed

## Technical Notes

### Why separate activities?
- The Activity entity represents "what happened from USER's perspective"
- When A sells to B, it's TWO events from different users' perspectives:
  - From A's perspective: "I sold NFT #X"
  - From B's perspective: "I purchased NFT #X"
- Creating separate activities allows each user to query only their own activities

### Deduplication logic:
- Seller and buyer activities have different IDs: `txHash-logIndex-seller` vs `txHash-logIndex-buyer`
- Deduplication key: `${txHash}-${type}` prevents showing same tx twice
- NFT deduplication key: `${tokenId}-${type}` keeps only most recent activity per NFT

### Query optimization:
- `GET_USER_ACTIVITIES`: Returns all activities where user is the actor (creator, lister, seller, offerer)
- `GET_USER_PURCHASE_ACTIVITIES`: Returns only purchase activities (where user is the buyer)
- Both queries use `user` field, making queries efficient and consistent
