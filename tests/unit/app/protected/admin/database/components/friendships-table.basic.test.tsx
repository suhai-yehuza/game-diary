import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { FriendshipsTableWithSearch } from '@src/app/protected/admin/database/components/friendships-table';

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

describe('FriendshipsTableWithSearch', () => {
  it('renders TableWithSearch with correct props', () => {
    render(<FriendshipsTableWithSearch />);

    expect(screen.getByTestId('table-with-search')).toBeInTheDocument();
    expect(screen.getByTestId('table-name')).toHaveTextContent('friendships');
    expect(screen.getByTestId('item-label')).toHaveTextContent('friendships');
    expect(screen.getByTestId('columns-count')).toHaveTextContent('5');
  });

  it('renders all required columns', () => {
    render(<FriendshipsTableWithSearch />);

    expect(screen.getByTestId('column-id')).toHaveTextContent('id: id (sortable: true)');
    expect(screen.getByTestId('column-user_id')).toHaveTextContent(
      'user_id: user_id (sortable: true)'
    );
    expect(screen.getByTestId('column-friend_id')).toHaveTextContent(
      'friend_id: friend_id (sortable: true)'
    );
    expect(screen.getByTestId('column-status')).toHaveTextContent(
      'status: status (sortable: true)'
    );
    expect(screen.getByTestId('column-created_at')).toHaveTextContent(
      'created_at: created_at (sortable: true)'
    );
  });

  it('has correct table configuration', () => {
    render(<FriendshipsTableWithSearch />);

    // Verify all columns are sortable
    const columns = screen.getAllByTestId(/^column-/);
    columns.forEach(column => {
      expect(column).toHaveTextContent('(sortable: true)');
    });
  });
});
