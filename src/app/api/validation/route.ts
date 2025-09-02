import { NextResponse } from 'next/server';

// import { createValidationErrorResponse } from '@/app/api/error-handler';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; username?: string };
    const { email, username } = body;

    const errors: string[] = [];

    // Validate email
    if (email && typeof email === 'string' && !email.includes('@')) {
      errors.push('Invalid email format');
    }

    // Validate username
    if (username && typeof username === 'string' && username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: errors[0], // Return first error as main error
          validationErrors: errors,
          errors: errors, // Also include as 'errors' for compatibility
          field: 'validation',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Validation passed',
      data: { email, username },
    });
  } catch (_error) {
    return NextResponse.json(
      {
        error: 'Invalid request format',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      timestamp: new Date().toISOString(),
    },
    { status: 405 }
  );
}
