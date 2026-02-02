import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// The Graph Studio endpoint for nuxchain subgraph (v0.39 - fixed startBlocks and 429 optimization)
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/122195/nuxchain/v0.39"

// ⚡ RATE LIMIT PROTECTION: Retry link with exponential backoff
const retryLink = new RetryLink({
  delay: {
    initial: 1000,  // Start with 1s delay
    max: 10000,     // Max 10s delay
    jitter: true    // Add randomness to prevent thundering herd
  },
  attempts: {
    max: 3,
    retryIf: (error) => {
      // Only retry on 429 rate limit errors
      return !!error && error.statusCode === 429;
    }
  }
});

// ⚡ ERROR HANDLING: Log 429 errors for debugging
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (networkError && 'statusCode' in networkError && networkError.statusCode === 429) {
    console.warn('⚠️ [Apollo Client] Rate limited (429) on operation:', operation.operationName);
  }
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }
});

// HTTP link with The Graph endpoint
const httpLink = new HttpLink({
  uri: SUBGRAPH_URL,
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, retryLink, httpLink]), // ⚡ Chain links: error → retry → http
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          activities: {
            // Separate cache by filter variables (where, first, skip)
            keyArgs: ["where", "first", "skip"],
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
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
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
