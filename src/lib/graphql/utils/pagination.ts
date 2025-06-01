export interface ConnectionArgs {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface PaginationParams {
  limit: number;
  offset: number;
  isForward: boolean;
}

/**
 * Parse connection arguments and return pagination parameters
 */
export function parsePaginationArgs(args: ConnectionArgs): PaginationParams {
  const { first, after, last, before } = args;

  // Default pagination settings
  const defaultLimit = 20;
  const maxLimit = 100;

  if (first !== null && first !== undefined) {
    // Forward pagination
    const limit = Math.min(first, maxLimit);
    const offset = after ? parseCursor(after) : 0;
    return { limit, offset, isForward: true };
  }

  if (last !== null && last !== undefined) {
    // Backward pagination
    const limit = Math.min(last, maxLimit);
    const offset = before ? Math.max(0, parseCursor(before) - limit) : 0;
    return { limit, offset, isForward: false };
  }

  // Default forward pagination
  return { limit: defaultLimit, offset: 0, isForward: true };
}

/**
 * Create a cursor from an offset
 */
export function createCursor(offset: number): string {
  return Buffer.from(offset.toString()).toString('base64');
}

/**
 * Parse a cursor to get the offset
 */
export function parseCursor(cursor: string): number {
  try {
    return parseInt(Buffer.from(cursor, 'base64').toString(), 10);
  } catch {
    return 0;
  }
}

/**
 * Create edges from items with offset-based cursors
 */
export function createEdges<T>(items: T[], offset: number): Edge<T>[] {
  return items.map((item, index) => ({
    cursor: createCursor(offset + index),
    node: item,
  }));
}

/**
 * Create page info for the connection
 */
export function createPageInfo<T>(
  edges: Edge<T>[],
  totalCount: number,
  limit: number,
  offset: number,
  isForward: boolean
): PageInfo {
  const hasNextPage = isForward ? offset + edges.length < totalCount : false;
  const hasPreviousPage = isForward ? offset > 0 : offset + limit < totalCount;

  return {
    hasNextPage,
    hasPreviousPage,
    startCursor: edges.length > 0 ? edges[0].cursor : null,
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
  };
}

/**
 * Create a complete connection from items and pagination info
 */
export function createConnection<T>(
  items: T[],
  totalCount: number,
  args: ConnectionArgs
): Connection<T> {
  const { limit, offset, isForward } = parsePaginationArgs(args);

  // Take only the requested number of items
  const paginatedItems = items.slice(0, limit);

  const edges = createEdges(paginatedItems, offset);
  const pageInfo = createPageInfo<T>(edges, totalCount, limit, offset, isForward);

  return {
    edges,
    pageInfo,
    totalCount,
  };
}

/**
 * Create an empty connection
 */
export function createEmptyConnection<T>(): Connection<T> {
  return {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: 0,
  };
}
