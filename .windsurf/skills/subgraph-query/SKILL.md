---
name: subgraph-query
description: Query NuxChain subgraphs using GraphQL and Apollo Client. Use when user says "subgraph", "GraphQL", "on-chain data", "The Graph", "query events", "staking events", "marketplace data", "indexed data", or needs to fetch blockchain event data.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

See full skill at: .agents/skills/subgraph-query/SKILL.md

# Subgraph Query — Quick Reference

## Key Files
- Schema: `subgraph/schema.graphql`
- Sources: `subgraph/src/` (8 mapping files)
- Deployment: `subgraph/DEPLOYMENT_v0.42.md`
- Env: `VITE_SUBGRAPH_URL`

## Apollo Client Setup
```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: import.meta.env.VITE_SUBGRAPH_URL }),
  cache: new InMemoryCache(),
});
```

## Query Pattern
```typescript
import { useQuery, gql } from '@apollo/client';

const GET_USER_DEPOSITS = gql`
  query GetUserDeposits($user: String!) {
    deposits(where: { user: $user }, orderBy: timestamp, orderDirection: desc, first: 20) {
      id
      amount
      poolId
      timestamp
    }
  }
`;

const { data, loading } = useQuery(GET_USER_DEPOSITS, {
  variables: { user: address?.toLowerCase() },
  skip: !address,
  pollInterval: 30000,
});
```

## Key Entities
`Deposit`, `Withdrawal`, `RewardClaim`, `UserGamification`, `Badge`, `Listing`, `Quest`, `Skill`
