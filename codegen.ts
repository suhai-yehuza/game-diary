import type { CodegenConfig } from '@graphql-codegen/cli';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const config: CodegenConfig = {
  schema: './src/lib/graphql/schema.graphql',
  documents: ['./src/**/*.ts', './src/**/*.tsx'],
  ignoreNoDocuments: true,
  generates: {
    './src/lib/types/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-resolvers'],
      config: {
        mappers: {
          // Removed mappers for types that don't exist in consolidated structure
        },
        scalars: {
          Any: '@src/lib/types/declarations.d#IAnyScalar',
          JSON: '@src/lib/types/declarations.d#IAnyScalar',
          DateTime: '@src/lib/types/declarations.d#IDateTimeScalar',
        },
        strictScalars: true,
        useTypeImports: true,
        enumsAsTypes: true,
        skipTypename: true,
        dedupeFragments: true,
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: true,
          defaultValue: true,
        },
        constEnums: true,
        maybeValue: 'T | null | undefined',
        namingConvention: {
          typeNames: 'change-case-all#pascalCase',
          enumValues: 'change-case-all#upperCase',
        },
        documentMode: 'documentNode',
        preResolveTypes: true,
      },
    },
  },
};

export default config;
