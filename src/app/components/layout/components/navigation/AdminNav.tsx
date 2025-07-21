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
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn || !user) {
    return false;
  }

  // Check if user has admin role in their public metadata
  const userRoles = (user.publicMetadata?.role as string[]) || [];
  return userRoles.includes('admin') || userRoles.includes('Admin');
}

// E2E test version of admin nav (no hooks)
function AdminNavE2E({ isActive: _isActive }: { isActive: (path: string) => boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-1 text-base lg:text-sm transition-colors hover:text-blue-600">
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

function AdminNavContent({ isActive: _isActive }: { isActive: (path: string) => boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-1 text-base lg:text-sm transition-colors hover:text-blue-600">
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

export function AdminNavWithAuth({
  isActive,
  isStacked = false,
}: {
  isActive: (path: string) => boolean;
  isStacked?: boolean;
}) {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return null;
  }

  return isStacked ? (
    <div className="mt-12 w-full flex justify-center">
      <AdminNav isActive={isActive} />
    </div>
  ) : (
    <AdminNav isActive={isActive} />
  );
}
