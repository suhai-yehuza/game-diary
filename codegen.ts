import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/lib/graphql/schema.graphql',
  documents: ['./src/lib/graphql/**/*.ts'],
  generates: {
    './src/lib/types/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        gqlImport: 'graphql-tag#gql',
      },
    },
  },
};

export default config;
