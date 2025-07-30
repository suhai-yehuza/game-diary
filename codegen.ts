import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/lib/graphql/schema.graphql',
  documents: ['./src/**/*.{ts,tsx,js,jsx}', './src/lib/graphql/**/*.graphql'],
  generates: {
    './src/lib/types/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        gqlImport: 'graphql-tag#gql',
        scalars: {
          DateTime: 'string',
          Any: 'any',
        },
      },
    },
  },
};

export default config;
