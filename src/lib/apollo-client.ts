import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "/api/graphql",
  headers: {
    "Content-Type": "application/json",
  },
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
