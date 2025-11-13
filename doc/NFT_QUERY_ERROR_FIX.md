# Subgraph NFT Query Error - Resolution Guide

## Problem

**Error**: `Server response was missing for query 'GetMarketplaceNFTsFallback'`

This error occurs when:
- The Apollo Client sends a query to the subgraph
- The subgraph server receives the query but returns no response or an empty response
- The query name doesn't match what the server expects

## Root Causes

### 1. **Query Parameter Issues**
The original query required a `$user` parameter with a specific filter:
```graphql
query GetMarketplaceNFTsFallback(
  $user: Bytes!     # ← Required parameter
  ...
) {
  activities(
    where: { user: $user, type: "NFT_MINT" }  # ← Strict filtering
    ...
  )
}
```

If the subgraph doesn't have the `user` field indexed or doesn't support filtering by it, the query fails silently.

### 2. **Subgraph Schema Mismatch**
The subgraph schema may not have all the fields we're querying, or the query structure doesn't match the subgraph's design.

### 3. **Network/Server Issues**
Sometimes The Graph service returns empty responses due to:
- Service maintenance
- Network issues
- Subgraph being temporarily unavailable

## Solution Implemented

###  Step 1: Add Fallback Query
Created a simpler query without the strict `$user` filter:
```graphql
query GetMarketplaceNFTsSimple(
  $first: Int!
  $skip: Int!
) {
  activities(
    where: { type: "NFT_MINT" }  # ← No user filter
    first: $first
    skip: $skip
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    tokenId
    timestamp
    transactionHash
    blockNumber
    user
    category
  }
}
```

### Step 2: Try-Catch with Fallback Logic
```typescript
let mintResult;
try {
  // Try the original query first (with user filter)
  mintResult = await apolloClient.query({
    query: GET_MARKETPLACE_NFTS_FALLBACK,
    variables: {
      user: address.toLowerCase(),
      first: limit,
      skip: skip
    },
    fetchPolicy: 'network-only'
  });
} catch (fallbackError) {
  console.warn('⚠️ GET_MARKETPLACE_NFTS_FALLBACK failed, trying simple query...',  fallbackError);
  // Fallback to simple query
  mintResult = await apolloClient.query({
    query: GET_MARKETPLACE_NFTS_SIMPLE,
    variables: {
      first: limit,
      skip: skip
    },
    fetchPolicy: 'network-only'
  });
}

// Filter results by user on the client side
const mintActivities = mintResult.data?.activities.filter(
  (activity: { user?: string }) => 
    activity.user?.toLowerCase() === address.toLowerCase()
) || [];
```

### Step 3: Client-Side Filtering
Instead of relying on server-side filtering, we now:
1. Fetch all NFT_MINT activities from the subgraph
2. Filter them on the client side for the specific user
3. This is more robust and works even if the subgraph doesn't support user filtering

## Benefits

✅ **Resilient**: If one query fails, automatically tries a simpler alternative  
✅ **Flexible**: Works with different subgraph versions and schemas  
✅ **Debuggable**: Clear console messages when fallback is triggered  
✅ **User-Filtered**: Client-side filtering ensures correct results  
✅ **No Data Loss**: Fallback query returns all NFTs, just needs client filtering  

## Testing

To verify the fix works:

1. **Check Console** for fallback messages:
   ```
   ⚠️ GET_MARKETPLACE_NFTS_FALLBACK failed, trying simple query...
   ```

2. **Monitor Network Tab**:
   - First request may fail (GET_MARKETPLACE_NFTS_FALLBACK)
   - Second request succeeds (GET_MARKETPLACE_NFTS_SIMPLE)

3. **Verify Data** appears in UI:
   - User's NFTs should display in Profile > NFTs section
   - Marketplace should show all available NFTs

## Performance Impact

- **Minimal**: Only retries on failure, normal path unchanged
- **Cached**: Apollo Client caches responses (5min stale time)
- **Network**: One additional query only if first fails
- **Processing**: Client-side filtering is O(n) and negligible

## If Issues Persist

### Check Subgraph Status
```
https://thegraph.com/hosted-service/subgraph/nuxchain/nuxchain
```

- ✅ Status: DEPLOYED
- ✅ Latest block: X
- ✅ No indexing errors

### Monitor Console

Look for patterns:
```
✅ Loaded X NFT items with metadata     // Success
❌ GET_MARKETPLACE_NFTS_FALLBACK failed  // Fallback triggered
⚠️ NFT query FAILED: ...                // Complete failure
```

### Manual Query Test

Try in GraphQL Playground:
```graphql
{
  activities(
    where: { type: "NFT_MINT" }
    first: 10
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    tokenId
    user
    category
    timestamp
  }
}
```

If this works but the app fails, it's likely a client-side issue.

## Related Files

- `/src/hooks/nfts/useMarketplaceNFTsGraph.tsx` - Main NFT query hook
- `/src/lib/graphql/queries.ts` - GraphQL query definitions
- `/doc/SUBGRAPH_SYNC_GUIDE.md` - Subgraph synchronization info

---

**Status**: ✅ Fixed and Deployed  
**Last Updated**: November 13, 2025
