'use client';

import { useUser } from '@clerk/nextjs';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/DropdownMenu';

// Hook to check if user is admin
function useIsAdmin() {
  // Check if we're in a Clerk context before using the hook
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn || !user) {
    return false;
  }

  // Check if user has admin role in their public metadata
  const userRoles = (user.publicMetadata?.role as string[]) || [];
  return userRoles.includes('admin') || userRoles.includes('Admin');
}

// Helper function to check if any admin route is active
function isAdminRouteActive(isActive: (path: string) => boolean): boolean {
  return (
    isActive('/protected/admin/database') ||
    isActive('/protected/admin/audit-logs') ||
    isActive('/protected/admin/experimental')
  );
}

// E2E test version of admin nav (no hooks)
function AdminNavE2E({ isActive }: { isActive: (path: string) => boolean }) {
  const isAdminActive = isAdminRouteActive(isActive);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center space-x-1 text-base lg:text-sm transition-colors whitespace-nowrap ${
            isAdminActive ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
          }`}
        >
          <span>Admin</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/database" className="cursor-pointer">
            Database Management
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/audit-logs" className="cursor-pointer">
            Audit Logs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/experimental" className="cursor-pointer">
            Experimental
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminNavContent({ isActive }: { isActive: (path: string) => boolean }) {
  const isAdminActive = isAdminRouteActive(isActive);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center space-x-1 text-base lg:text-sm transition-colors whitespace-nowrap ${
            isAdminActive ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
          }`}
        >
          <span>Admin</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/database" className="cursor-pointer">
            Database Management
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/audit-logs" className="cursor-pointer">
            Audit Logs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/experimental" className="cursor-pointer">
            Experimental
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminNav({ isActive }: { isActive: (path: string) => boolean }) {
  // Use E2E test version for test environments, but only if we're actually in E2E mode
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' &&
    process.env.E2E_MOCK_MODE === 'true'
  ) {
    return <AdminNavE2E isActive={isActive} />;
  }
  return <AdminNavContent isActive={isActive} />;
}

// Safe wrapper for AdminNav that handles Clerk context
function AdminNavWithAuthSafe({
  isActive,
  isStacked = false,
}: {
  isActive: (path: string) => boolean;
  isStacked?: boolean;
}) {
  try {
    const isAdmin = useIsAdmin();

    if (!isAdmin) {
      return null;
    }

    return isStacked ? (
      <div className="mt-12 w-full flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-[90vw] sm:w-[70vw] md:w-[400px] max-w-xs h-10 flex items-center justify-center text-sm whitespace-nowrap rounded font-semibold transition-all duration-150 bg-blue-500 text-white shadow-sm mb-3 mx-auto hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              <span>Admin</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/protected/admin/database" className="cursor-pointer">
                Database Management
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/protected/admin/audit-logs" className="cursor-pointer">
                Audit Logs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/protected/admin/experimental" className="cursor-pointer">
                Experimental
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ) : (
      <AdminNav isActive={isActive} />
    );
  } catch {
    // If Clerk is not available, don't render the admin nav
    return null;
  }
}

export function AdminNavWithAuth({
  isActive,
  isStacked = false,
}: {
  isActive: (path: string) => boolean;
  isStacked?: boolean;
}) {
  return <AdminNavWithAuthSafe isActive={isActive} isStacked={isStacked} />;
}
