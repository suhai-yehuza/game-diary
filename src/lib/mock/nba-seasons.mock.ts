import type { INbaSeasonsApiResponse } from '@/lib/types/nba.api.types';

export const MOCK_NBA_SEASONS: INbaSeasonsApiResponse = {
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
