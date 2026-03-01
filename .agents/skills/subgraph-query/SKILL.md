---
name: subgraph-query
description: Query NuxChain subgraphs using GraphQL and Apollo Client. Use when user says "subgraph", "GraphQL", "on-chain data", "The Graph", "query events", "staking events", "marketplace data", "indexed data", or needs to fetch blockchain event data. Provides schema, query patterns, and Apollo Client setup.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Subgraph Query Skill

Query NuxChain's indexed blockchain data via The Graph Protocol.

## Subgraph Sources

```
subgraph/
  src/
    enhanced-smart-staking.ts      ← Deposit, Withdraw, Claim events
    staking-gamification.ts        ← XP, quests, badge events
    staking-rewards.ts             ← Reward distribution events
    staking-skills.ts              ← Skill NFT staking events
    gameified-marketplace.ts       ← Marketplace transactions
    marketplace-quests.ts          ← Quest completions
    marketplace-skills.ts          ← Skill listings
    individual-skills.ts           ← Individual skill data
  schema.graphql                   ← Entity definitions
  subgraph.yaml                    ← Datasource config
  build/                           ← Compiled subgraph
  generated/                       ← Auto-generated types
```

## Apollo Client Setup

```typescript
// src/utils/apolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/<id>/nuxchain/version/latest';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: SUBGRAPH_URL }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    query: { fetchPolicy: 'network-only' },
  },
});
```

## Common Query Patterns

### Get user deposits
```typescript
import { useQuery, gql } from '@apollo/client';

const GET_USER_DEPOSITS = gql`
  query GetUserDeposits($user: String!, $first: Int = 10) {
    deposits(
      where: { user: $user }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      id
      user
      amount
      poolId
      timestamp
      transactionHash
    }
  }
`;

const { data, loading, error } = useQuery(GET_USER_DEPOSITS, {
  variables: { user: address?.toLowerCase(), first: 20 },
  skip: !address,
  pollInterval: 30000, // refresh every 30s
});
```

### Get staking stats (TVL, total stakers)
```typescript
const GET_STAKING_STATS = gql`
  query GetStakingStats {
    stakingStats(id: "global") {
      totalValueLocked
      totalStakers
      totalRewardsPaid
      lastUpdated
    }
  }
`;
```

### Get user gamification data
```typescript
const GET_USER_GAMIFICATION = gql`
  query GetUserGamification($user: String!) {
    userGamification(id: $user) {
      xp
      level
      questsCompleted
      badgesEarned {
        id
        name
        rarity
        earnedAt
      }
    }
  }
`;
```

### Get marketplace listings
```typescript
const GET_MARKETPLACE_LISTINGS = gql`
  query GetListings($first: Int = 20, $skip: Int = 0) {
    listings(
      first: $first
      skip: $skip
      where: { active: true }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      seller
      tokenId
      price
      collection
      createdAt
    }
  }
`;
```

## Lazy Query (on demand)
```typescript
import { useLazyQuery } from '@apollo/client';

const [fetchDeposits, { data, loading }] = useLazyQuery(GET_USER_DEPOSITS);

// Call when needed
const handleFetch = () => {
  fetchDeposits({ variables: { user: address?.toLowerCase() } });
};
```

## Direct Fetch (no Apollo, for API endpoints)
```typescript
const querySubgraph = async (query: string, variables = {}) => {
  const response = await fetch(process.env.SUBGRAPH_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data;
};
```

## Pagination Pattern
```typescript
const PAGE_SIZE = 20;
const [page, setPage] = useState(0);

const { data } = useQuery(GET_LISTINGS, {
  variables: {
    first: PAGE_SIZE,
    skip: page * PAGE_SIZE,
  },
});
```

## Schema Reference

Check `subgraph/schema.graphql` for all entity types. Key entities:
- `Deposit` — staking deposits
- `Withdrawal` — unstake events
- `RewardClaim` — claimed rewards
- `UserGamification` — XP, level, quests
- `Badge` — earned badges
- `Listing` — marketplace listings
- `Quest` — quest definitions and completions
- `Skill` — skill NFT data

## Environment Variables

```
VITE_SUBGRAPH_URL      ← Frontend subgraph endpoint
SUBGRAPH_URL           ← Backend subgraph endpoint (no VITE_ prefix)
```

## Deployment Reference

See `subgraph/DEPLOYMENT_v0.42.md` for the latest deployed subgraph version and endpoint URLs.
