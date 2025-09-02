import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
}

export function POST() {
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
}

export function PUT() {
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
}

export function DELETE() {
  return NextResponse.json(
    {
      error: 'Not Found',
      message: 'The requested API endpoint does not exist',
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
}
