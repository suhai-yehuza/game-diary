import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { swaggerSpec } from '@/lib/openapi/config';

export function GET(_request: NextRequest) {
  return NextResponse.json(swaggerSpec, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
