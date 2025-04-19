import type { NextRequest } from 'next/server';

export interface RouteContext {
  params: Record<string, string>;
  searchParams: URLSearchParams;
  request: NextRequest;
}
