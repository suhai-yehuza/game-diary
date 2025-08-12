import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { TableSearch } from '@/app/protected/admin/database/components/ui/table-search';

describe('TableSearch (extended)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces search input changes and calls onSearchChange', () => {
    const onSearchChange = vi.fn();
    const onClear = vi.fn();

    render(
      <TableSearch
        searchTerm=""
        searchField="name"
        searchFields={[
          { value: 'name', label: 'Name' },
          { value: 'email', label: 'Email' },
        ]}
        onSearchChange={onSearchChange}
        onClear={onClear}
        placeholder="Search..."
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'hello' } });

    // Not called immediately
    expect(onSearchChange).not.toHaveBeenCalled();

    // Advance debounce
    vi.advanceTimersByTime(300);
    expect(onSearchChange).toHaveBeenCalledWith('hello', 'name');

    // Change field and ensure it triggers with latest term
    const select = screen.getByDisplayValue('Name');
    fireEvent.change(select, { target: { value: 'email' } });
    expect(onSearchChange).toHaveBeenLastCalledWith('hello', 'email');
  });

  it('shows and triggers clear actions via x button and Clear button', () => {
    const onSearchChange = vi.fn();
    const onClear = vi.fn();

    render(
      <TableSearch
        searchTerm="abc"
        searchField="name"
        searchFields={[{ value: 'name', label: 'Name' }]}
        onSearchChange={onSearchChange}
        onClear={onClear}
      />
    );

    // Clear via x icon
    const xButton = screen.getAllByRole('button')[0];
    fireEvent.click(xButton);
    expect(onClear).toHaveBeenCalled();

    // Type again to reveal Clear button
    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: 'z' } });
    vi.advanceTimersByTime(300);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    expect(onClear).toHaveBeenCalledTimes(2);
  });
});
