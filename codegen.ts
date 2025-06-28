import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/lib/graphql/schema.graphql',
  generates: {
    './src/lib/types/generated/graphql.ts': {
      plugins: ['typescript'],
    },
  },
};

// eslint-disable-next-line import/no-default-export
export default config;
