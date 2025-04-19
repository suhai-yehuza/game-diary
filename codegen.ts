import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/lib/graphql/schema.graphql',
  documents: ['./src/**/*.ts', './src/**/*.tsx'],
  generates: {
    './src/lib/graphql/generated/': {
      preset: 'client-preset',
      plugins: [],
      config: {
        dedupeFragments: true,
        exportFragmentSpreadSubTypes: true,
        skipTypename: true,
        useTypeImports: true,
        strictScalars: true,
        scalars: {
          DateTime: 'Date',
          JSON: 'Record<string, any>',
          Any: 'any',
          ID: 'string',
        },
        avoidOptionals: {
          field: false,
          inputValue: false,
          object: false,
          defaultValue: true,
        },
        enumsAsTypes: true,
        constEnums: true,
        maybeValue: 'T | null | undefined',
        namingConvention: {
          typeNames: 'change-case-all#pascalCase',
          enumValues: 'change-case-all#upperCase',
        },
      },
    },
  },
};

export default config;
