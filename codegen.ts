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
        contextType: '@/lib/types#Context',
        mappers: {
          User: '@/lib/types#User',
          UserSummary: '@/lib/types#UserSummary',
          GameLog: '@/lib/types#GameLog',
          Comment: '@/lib/types#Comment',
          Reaction: '@/lib/types#Reaction',
          Friendship: '@/lib/types#Friendship',
          Game: '@/lib/types#Game',
          GameStats: '@/lib/types#GameStats',
          Team: '@/lib/types#Team',
          Player: '@/lib/types#Player',
          PlayerStats: '@/lib/types#PlayerStats',
          Season: '@/lib/types#Season',
          SeasonData: '@/lib/types#SeasonData',
          Notification: '@/lib/types#Notification',
          Activity: '@/lib/types#Activity',
        },
        scalars: {
          Any: '@/lib/types/scalars#AnyScalar',
          JSON: '@/lib/types/scalars#JsonScalar',
          DateTime: '@/lib/types/scalars#DateTimeScalar',
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
