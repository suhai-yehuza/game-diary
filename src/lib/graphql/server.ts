import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

export default startServerAndCreateNextHandler(server);
