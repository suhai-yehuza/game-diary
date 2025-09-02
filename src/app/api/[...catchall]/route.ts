import { NextResponse } from 'next/server';

export async function GET() {
  await Promise.resolve(); // Add await expression
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
      path: '/api/[...catchall]',
    },
    { status: 404 }
  );
}

export async function POST() {
  await Promise.resolve(); // Add await expression
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
      path: '/api/[...catchall]',
    },
    { status: 404 }
  );
}

export async function PUT() {
  await Promise.resolve(); // Add await expression
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
      path: '/api/[...catchall]',
    },
    { status: 404 }
  );
}

export async function DELETE() {
  await Promise.resolve(); // Add await expression
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
      path: '/api/[...catchall]',
    },
    { status: 404 }
  );
}

export async function PATCH() {
  await Promise.resolve(); // Add await expression
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
      path: '/api/[...catchall]',
    },
    { status: 404 }
  );
}
