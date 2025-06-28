import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

export const runtime = 'nodejs';

export async function GET(_request: Readonly<NextRequest>) {
  try {
    // Get the project directory
    const projectDir = process.env.VERCEL_DIR ?? process.cwd();
    const scriptPath = path.join(projectDir, 'scripts', 'nightly-update.sh');

    // Execute the script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);

    return NextResponse.json({
      success: true,
      message: 'Nightly update completed successfully',
      stdout,
      stderr,
    });
  } catch (error) {
    console.error('Nightly update failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Nightly update failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
