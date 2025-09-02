import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { safeSeedExternalApiData } from '@/lib/db/seed/safe-external-api-seed';
import { adminAuthMiddleware } from '@/lib/middleware/admin-auth';
import { errorHandlers } from '@/lib/utils/error-handler';

import { setCurrentJobId, clearCurrentJobId } from './cancel/route';

/**
 * Admin-only API endpoint to trigger safe database refresh
 * This endpoint only inserts new data without overwriting existing entries
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await adminAuthMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Auth failed, return error response
    }

    const { userId, userEmail } = authResult;

    console.log(`🔐 Admin user ${userId} (${userEmail}) triggered database refresh`);

    // Generate a unique job ID and set it as current
    const jobId = `db-refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCurrentJobId(jobId);

    try {
      // Start the safe seeding process with progress tracking
      const startTime = Date.now();
      await safeSeedExternalApiData();
      const duration = Date.now() - startTime;

      // Clear the job ID on completion
      clearCurrentJobId();

      console.log(`✅ Database refresh completed in ${Math.round(duration / 1000)}s`);

      return NextResponse.json({
        success: true,
        message: 'Database refresh completed successfully',
        duration: `${Math.round(duration / 1000)}s`,
        timestamp: new Date().toISOString(),
        userId,
        userEmail,
      });
    } catch (error) {
      // Clear the job ID on error
      clearCurrentJobId();

      const errorObj = error instanceof Error ? error : new Error(String(error));

      errorHandlers.api(errorObj, {
        component: 'Admin DB Refresh API',
        action: 'POST /api/admin/db-refresh',
      });

      return NextResponse.json(
        {
          success: false,
          error: errorObj.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    errorHandlers.api(errorObj, {
      component: 'Admin DB Refresh API',
      action: 'POST /api/admin/db-refresh',
    });

    return NextResponse.json(
      {
        success: false,
        error: errorObj.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Get the status of database refresh operations
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await adminAuthMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Auth failed, return error response
    }

    const { userId, userEmail } = authResult;

    // For now, return basic status
    // In the future, this could track ongoing refresh operations
    return NextResponse.json({
      success: true,
      message: 'Database refresh API is available',
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      status: 'ready',
    });
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    errorHandlers.api(errorObj, {
      component: 'Admin DB Refresh API',
      action: 'GET /api/admin/db-refresh',
    });

    return NextResponse.json(
      {
        success: false,
        error: errorObj.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
