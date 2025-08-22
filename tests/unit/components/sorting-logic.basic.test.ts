import { describe, it, expect } from 'vitest';

// Test the sorting logic directly
describe('Sorting Logic', () => {
  const mockUsers = [
    {
      id: '1',
      username: 'alice',
      email_address: 'alice@example.com',
      phone_number: '123-456-7890',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      username: 'bob',
      email_address: 'bob@example.com',
      phone_number: '098-765-4321',
      created_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      username: 'charlie',
      email_address: 'charlie@example.com',
      phone_number: '555-123-4567',
      created_at: '2024-01-03T00:00:00Z',
    },
  ];

  const sortUsers = (
    users: Array<{
      id: string;
      username: string | null | undefined;
      email_address: string;
      phone_number: string;
      created_at: string;
    }>,
    sortKey: string | null,
    sortDirection: 'asc' | 'desc' | null
  ) => {
    if (!sortKey || !sortDirection || users.length === 0) {
      return users;
    }

    return [...users].sort((a, b) => {
      const aValue = a[sortKey as keyof (typeof users)[0]];
      const bValue = b[sortKey as keyof (typeof users)[0]];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  it('returns original array when no sorting is applied', () => {
    const result = sortUsers(mockUsers, null, null);
    expect(result).toEqual(mockUsers);
  });

  it('returns original array when sort direction is null', () => {
    const result = sortUsers(mockUsers, 'username', null);
    expect(result).toEqual(mockUsers);
  });

  it('returns original array when sort key is null', () => {
    const result = sortUsers(mockUsers, null, 'asc');
    expect(result).toEqual(mockUsers);
  });

  it('returns original array when users array is empty', () => {
    const result = sortUsers([], 'username', 'asc');
    expect(result).toEqual([]);
  });

  it('sorts users by username in ascending order', () => {
    const result = sortUsers(mockUsers, 'username', 'asc');
    expect(result[0].username).toBe('alice');
    expect(result[1].username).toBe('bob');
    expect(result[2].username).toBe('charlie');
  });

  it('sorts users by username in descending order', () => {
    const result = sortUsers(mockUsers, 'username', 'desc');
    expect(result[0].username).toBe('charlie');
    expect(result[1].username).toBe('bob');
    expect(result[2].username).toBe('alice');
  });

  it('sorts users by email in ascending order', () => {
    const result = sortUsers(mockUsers, 'email_address', 'asc');
    expect(result[0].email_address).toBe('alice@example.com');
    expect(result[1].email_address).toBe('bob@example.com');
    expect(result[2].email_address).toBe('charlie@example.com');
  });

  it('sorts users by email in descending order', () => {
    const result = sortUsers(mockUsers, 'email_address', 'desc');
    expect(result[0].email_address).toBe('charlie@example.com');
    expect(result[1].email_address).toBe('bob@example.com');
    expect(result[2].email_address).toBe('alice@example.com');
  });

  it('sorts users by phone number in ascending order', () => {
    const result = sortUsers(mockUsers, 'phone_number', 'asc');
    expect(result[0].phone_number).toBe('098-765-4321');
    expect(result[1].phone_number).toBe('123-456-7890');
    expect(result[2].phone_number).toBe('555-123-4567');
  });

  it('sorts users by created_at in ascending order', () => {
    const result = sortUsers(mockUsers, 'created_at', 'asc');
    expect(result[0].created_at).toBe('2024-01-01T00:00:00Z');
    expect(result[1].created_at).toBe('2024-01-02T00:00:00Z');
    expect(result[2].created_at).toBe('2024-01-03T00:00:00Z');
  });

  it('handles null values correctly', () => {
    const usersWithNulls = [
      { ...mockUsers[0], username: null },
      { ...mockUsers[1] },
      { ...mockUsers[2], username: null },
    ];

    const result = sortUsers(usersWithNulls, 'username', 'asc');
    expect(result[0].username).toBe('bob'); // Only non-null value
    expect(result[1].username).toBeNull();
    expect(result[2].username).toBeNull();
  });

  it('handles undefined values correctly', () => {
    const usersWithUndefined = [
      { ...mockUsers[0], username: undefined },
      { ...mockUsers[1] },
      { ...mockUsers[2], username: undefined },
    ];

    const result = sortUsers(usersWithUndefined, 'username', 'asc');
    expect(result[0].username).toBe('bob'); // Only defined value
    expect(result[1].username).toBeUndefined();
    expect(result[2].username).toBeUndefined();
  });

  it('handles mixed null and undefined values', () => {
    const usersWithMixed = [
      { ...mockUsers[0], username: null },
      { ...mockUsers[1] },
      { ...mockUsers[2], username: undefined },
    ];

    const result = sortUsers(usersWithMixed, 'username', 'asc');
    expect(result[0].username).toBe('bob'); // Only defined value
    expect(result[1].username).toBeNull();
    expect(result[2].username).toBeUndefined();
  });

  it('does not mutate the original array', () => {
    const originalUsers = [...mockUsers];
    sortUsers(mockUsers, 'username', 'asc');
    expect(mockUsers).toEqual(originalUsers);
  });
});
