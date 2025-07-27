import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { GameRatingsTableWithSearch } from '@src/app/protected/admin/database/components/game-ratings-table';

// Mock the TableWithSearch component
vi.mock('@/app/protected/admin/database/components/TableWithSearch', () => ({
  default: ({ columns, itemLabel, tableName }: any) => (
    <div data-testid="table-with-search">
      <div data-testid="table-name">{tableName}</div>
      <div data-testid="item-label">{itemLabel}</div>
      <div data-testid="columns-count">{columns.length}</div>
      <div data-testid="columns">
        {columns.map((col: any, index: number) => (
          <div key={index} data-testid={`column-${col.key}`}>
            {col.key}: {col.label} (sortable: {col.sortable.toString()})
          </div>
        ))}
      </div>
    </div>
  ),
}));

describe('GameRatingsTableWithSearch', () => {
  it('renders TableWithSearch with correct props', () => {
    render(<GameRatingsTableWithSearch />);

    expect(screen.getByTestId('table-with-search')).toBeInTheDocument();
    expect(screen.getByTestId('table-name')).toHaveTextContent('game_ratings');
    expect(screen.getByTestId('item-label')).toHaveTextContent('game ratings');
    expect(screen.getByTestId('columns-count')).toHaveTextContent('5');
  });

  it('renders all required columns', () => {
    render(<GameRatingsTableWithSearch />);

    expect(screen.getByTestId('column-id')).toHaveTextContent('id: id (sortable: true)');
    expect(screen.getByTestId('column-game_id')).toHaveTextContent(
      'game_id: game_id (sortable: true)'
    );
    expect(screen.getByTestId('column-average_rating')).toHaveTextContent(
      'average_rating: average_rating (sortable: true)'
    );
    expect(screen.getByTestId('column-total_ratings')).toHaveTextContent(
      'total_ratings: total_ratings (sortable: true)'
    );
    expect(screen.getByTestId('column-created_at')).toHaveTextContent(
      'created_at: created_at (sortable: true)'
    );
  });

  it('has correct table configuration', () => {
    render(<GameRatingsTableWithSearch />);

    // Verify all columns are sortable
    const columns = screen.getAllByTestId(/^column-/);
    columns.forEach(column => {
      expect(column).toHaveTextContent('(sortable: true)');
    });
  });
});
