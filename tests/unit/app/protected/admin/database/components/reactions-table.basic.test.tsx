import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ReactionsTableWithSearch } from '@src/app/protected/admin/database/components/reactions-table';

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

describe('ReactionsTableWithSearch', () => {
  it('renders TableWithSearch with correct props', () => {
    render(<ReactionsTableWithSearch />);

    expect(screen.getByTestId('table-with-search')).toBeInTheDocument();
    expect(screen.getByTestId('table-name')).toHaveTextContent('reactions');
    expect(screen.getByTestId('item-label')).toHaveTextContent('reactions');
    expect(screen.getByTestId('columns-count')).toHaveTextContent('6');
  });

  it('renders all required columns', () => {
    render(<ReactionsTableWithSearch />);

    expect(screen.getByTestId('column-id')).toHaveTextContent('id: id (sortable: true)');
    expect(screen.getByTestId('column-user_id')).toHaveTextContent(
      'user_id: user_id (sortable: true)'
    );
    expect(screen.getByTestId('column-target_type')).toHaveTextContent(
      'target_type: target_type (sortable: true)'
    );
    expect(screen.getByTestId('column-target_id')).toHaveTextContent(
      'target_id: target_id (sortable: true)'
    );
    expect(screen.getByTestId('column-emoji')).toHaveTextContent('emoji: emoji (sortable: true)');
    expect(screen.getByTestId('column-created_at')).toHaveTextContent(
      'created_at: created_at (sortable: true)'
    );
  });

  it('has correct table configuration', () => {
    render(<ReactionsTableWithSearch />);

    // Verify all columns are sortable
    const columns = screen.getAllByTestId(/^column-/);
    columns.forEach(column => {
      expect(column).toHaveTextContent('(sortable: true)');
    });
  });
});
