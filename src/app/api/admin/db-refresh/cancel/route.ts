import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { adminAuthMiddleware } from '@/lib/middleware/admin-auth';
import { errorHandlers } from '@/lib/utils/error-handler';

// In-memory storage for job cancellation (in production, you might want to use Redis or database)
let currentJobId: string | null = null;
let isJobCancelled = false;

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await adminAuthMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Auth failed, return error response
    }

    const { userId, userEmail } = authResult;

    console.log(`🔐 Admin user ${userId} (${userEmail}) requested job cancellation`);

    if (!currentJobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active job to cancel',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Mark the job as cancelled
    isJobCancelled = true;
    currentJobId = null;

    console.log('🛑 Database refresh job cancellation requested');

    return NextResponse.json({
      success: true,
      message: 'Job cancellation requested successfully',
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
    });
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    errorHandlers.api(errorObj, {
      component: 'Admin DB Refresh Cancel API',
      action: 'POST /api/admin/db-refresh/cancel',
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

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await adminAuthMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Auth failed, return error response
    }

    return NextResponse.json({
      success: true,
      message: 'Job cancellation API is available',
      hasActiveJob: !!currentJobId,
      isCancelled: isJobCancelled,
      status: 'ready',
    });
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    errorHandlers.api(errorObj, {
      component: 'Admin DB Refresh Cancel API',
      action: 'GET /api/admin/db-refresh/cancel',
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

// Export functions to manage job state (used by the main refresh endpoint)
export function setCurrentJobId(jobId: string) {
  currentJobId = jobId;
  isJobCancelled = false;
}

export function clearCurrentJobId() {
  currentJobId = null;
  isJobCancelled = false;
}

export function isJobCancelledCheck() {
  return isJobCancelled;
}
