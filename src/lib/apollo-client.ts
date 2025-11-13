import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// The Graph Studio endpoint for nuxchain subgraph (v0.11 - latest with fixed activity types)
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/122195/nuxchain/v0.11"
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
            // Don't merge, always replace with fresh data from v0.0.2
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
