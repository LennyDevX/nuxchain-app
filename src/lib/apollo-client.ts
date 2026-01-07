import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// The Graph Studio endpoint for nuxchain subgraph (v0.36 - fixed startBlocks to avoid 97% hang)
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/122195/nuxchain/v0.36"
// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: SUBGRAPH_URL,
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          activities: {
            // Don't merge, always replace with fresh data from v0.36 subgraph
            keyArgs: false,
            merge(_existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

/**
 * ✅ NEW: Function to clear Apollo Client cache after transactions
 * Call this after successful blockchain transactions to force refetch of data
 */
export async function clearSubgraphCache() {
  try {
    await apolloClient.clearStore();
    console.log('✅ [Apollo Client] Cache cleared successfully');
  } catch (error) {
    console.error('❌ [Apollo Client] Failed to clear cache:', error);
  }
}

/**
 * ✅ NEW: Function to refetch specific queries after transactions
 * More granular than clearing entire cache
 */
export async function refetchQueries(queryNames: string[]) {
  try {
    await apolloClient.refetchQueries({
      include: queryNames,
    });
    console.log(`✅ [Apollo Client] Refetched queries: ${queryNames.join(', ')}`);
  } catch (error) {
    console.error('❌ [Apollo Client] Failed to refetch queries:', error);
  }
}
