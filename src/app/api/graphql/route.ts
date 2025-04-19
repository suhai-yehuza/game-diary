import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../../../lib/graphql/schema";
import { resolvers } from "../../../lib/graphql/resolvers";
import { gql } from "graphql-tag";
import { db } from "../../../db";
import { cache } from "../../../lib/redis";
import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

type Context = {
  db: typeof db;
  redis: Redis;
};

const server = new ApolloServer({
  typeDefs: gql`
    ${typeDefs}
  `,
  resolvers,
  introspection: true,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (): Promise<Context> => ({
    db,
    redis: cache as unknown as Redis,
  }),
});

export { handler as GET, handler as POST };
