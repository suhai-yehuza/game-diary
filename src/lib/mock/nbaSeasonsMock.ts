import type { ISeasonsApiResponse } from '@/lib/types';

export const MOCK_NBA_SEASONS: ISeasonsApiResponse = {
  get: 'seasons',
  parameters: {},
  errors: [],
  results: 5,
  response: [
    { season: 2024 },
    { season: 2023 },
    { season: 2022 },
    { season: 2021 },
    { season: 2020 },
  ],
};
