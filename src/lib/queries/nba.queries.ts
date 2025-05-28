import { gql } from '@apollo/client';

export const GET_NBA_GAMES = gql`
  query GetNBAGames($season: Int!, $first: Int!, $after: String) {
    games(season: $season, first: $first, after: $after) {
      edges {
        node {
          id
          date {
            start
            end
            duration
          }
          teams
          scores
          status {
            clock
            halftime
            long
            short
          }
          season
          stage
          arena
          officials
          periods
          timesTied
          leadChanges
          nugget
          created_at
          updated_at
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
