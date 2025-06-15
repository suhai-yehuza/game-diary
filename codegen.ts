import type { CodegenConfig } from '@graphql-codegen/cli';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const config: CodegenConfig = {
  schema: './src/lib/graphql/schema.graphql',
  documents: ['./src/**/*.ts', './src/**/*.tsx'],
  ignoreNoDocuments: true,
  generates: {
    './src/lib/types/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: false,
      },
    },
    './src/lib/types/generated/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '@/lib/graphql/context#IContext',
        mappers: {
          Player: '@/lib/types#IDBPlayer',
          Activity: '@/lib/types#IActivity',
          Notification: '@/lib/types#IAppNotification',
        },
        scalars: {
          Any: '@/lib/types/scalars#IAnyScalar',
          JSON: '@/lib/types/scalars#IJsonScalar',
          DateTime: '@/lib/types/scalars#IDateTimeScalar',
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
      },
    },
  },
};

export default config;
