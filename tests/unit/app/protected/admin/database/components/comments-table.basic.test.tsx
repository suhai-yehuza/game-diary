import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { CommentsTableWithSearch } from '@src/app/protected/admin/database/components/comments-table';

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

describe('CommentsTableWithSearch', () => {
  it('renders TableWithSearch with correct props', () => {
    render(<CommentsTableWithSearch />);

    expect(screen.getByTestId('table-with-search')).toBeInTheDocument();
    expect(screen.getByTestId('table-name')).toHaveTextContent('comments');
    expect(screen.getByTestId('item-label')).toHaveTextContent('comments');
    expect(screen.getByTestId('columns-count')).toHaveTextContent('6');
  });

  it('renders all required columns', () => {
    render(<CommentsTableWithSearch />);

    expect(screen.getByTestId('column-id')).toHaveTextContent('id: id (sortable: true)');
    expect(screen.getByTestId('column-user_id')).toHaveTextContent(
      'user_id: user_id (sortable: true)'
    );
    expect(screen.getByTestId('column-parent_id')).toHaveTextContent(
      'parent_id: parent_id (sortable: true)'
    );
    expect(screen.getByTestId('column-parent_type')).toHaveTextContent(
      'parent_type: parent_type (sortable: true)'
    );
    expect(screen.getByTestId('column-content')).toHaveTextContent(
      'content: content (sortable: true)'
    );
    expect(screen.getByTestId('column-created_at')).toHaveTextContent(
      'created_at: created_at (sortable: true)'
    );
  });

  it('has correct table configuration', () => {
    render(<CommentsTableWithSearch />);

    // Verify all columns are sortable
    const columns = screen.getAllByTestId(/^column-/);
    columns.forEach(column => {
      expect(column).toHaveTextContent('(sortable: true)');
    });
  });
});
