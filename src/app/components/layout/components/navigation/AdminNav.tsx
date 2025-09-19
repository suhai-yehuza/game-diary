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
import { isSSOCallback } from '@/lib/utils/sso-utils';

// Hook to check if user is admin
function useIsAdmin() {
  try {
    // Always call useUser to satisfy React's rules
    const userData = useUser();

    // Handle case where Clerk is not configured (e.g., in test environment)
    if (!userData.isLoaded) {
      return false;
    }

    if (!userData.isSignedIn || !userData.user) {
      return false;
    }

    // Check if user has admin role in their public metadata
    const userRoles = (userData.user.publicMetadata?.role as string[]) || [];
    return userRoles.includes('admin') || userRoles.includes('Admin');
  } catch (_error) {
    // Handle case where Clerk is not configured (e.g., in mock mode or test environment)
    console.log('Clerk not configured, admin nav disabled');
    return false;
  }
}

// Helper function to check if any admin route is active
function isAdminRouteActive(isActive: (path: string) => boolean): boolean {
  return (
    isActive('/protected/admin/database') ||
    isActive('/protected/admin/audit-logs') ||
    isActive('/protected/admin/experimental') ||
    isActive('/protected/admin/demos')
  );
}

// E2E test version of admin nav (no hooks)
function AdminNavE2E({
  isActive,
  closeMenu,
}: {
  isActive: (path: string) => boolean;
  closeMenu?: () => void;
}) {
  const isAdminActive = isAdminRouteActive(isActive);

  const handleLinkClick = () => {
    if (closeMenu) closeMenu();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center space-x-1 text-base lg:text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
            isAdminActive ? 'text-brand-primary font-semibold' : 'hover:text-brand-primary'
          }`}
          aria-haspopup="menu"
          aria-expanded={isAdminActive}
        >
          <span>Admin</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link
            href="/protected/admin/database"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            onClick={handleLinkClick}
          >
            Database Management
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/protected/admin/audit-logs"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            onClick={handleLinkClick}
          >
            Audit Logs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/protected/admin/experimental"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            onClick={handleLinkClick}
          >
            Experimental
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/protected/admin/demos"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            onClick={handleLinkClick}
          >
            Demos
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminNavContent({
  isActive,
  closeMenu,
}: {
  isActive: (path: string) => boolean;
  closeMenu?: () => void;
}) {
  const isAdminActive = isAdminRouteActive(isActive);

  const handleLinkClick = () => {
    if (closeMenu) closeMenu();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center space-x-1 text-base lg:text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
            isAdminActive ? 'text-brand-primary font-semibold' : 'hover:text-brand-primary'
          }`}
          aria-haspopup="menu"
          aria-expanded={isAdminActive}
        >
          <span>Admin</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link
            href="/protected/admin/database"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            onClick={handleLinkClick}
          >
            Database Management
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/protected/admin/audit-logs"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            onClick={handleLinkClick}
          >
            Audit Logs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/protected/admin/experimental"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            onClick={handleLinkClick}
          >
            Experimental
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/protected/admin/demos"
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            onClick={handleLinkClick}
          >
            Demos
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminNav({
  isActive,
  closeMenu,
}: {
  isActive: (path: string) => boolean;
  closeMenu?: () => void;
}) {
  // Use E2E test version for test environments, but only if we're actually in E2E mode
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' &&
    process.env.MOCK_MODE === 'true'
  ) {
    return <AdminNavE2E isActive={isActive} closeMenu={closeMenu} />;
  }
  return <AdminNavContent isActive={isActive} closeMenu={closeMenu} />;
}

// Safe wrapper for AdminNav that handles Clerk context
function AdminNavWithAuthSafe({
  isActive,
  isStacked = false,
  closeMenu,
}: {
  isActive: (path: string) => boolean;
  isStacked?: boolean;
  closeMenu?: () => void;
}) {
  // Always call the hook first to satisfy React's rules
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return null;
  }

  const handleLinkClick = () => {
    if (closeMenu) closeMenu();
  };

  return isStacked ? (
    <div className="mt-12 w-full flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`w-[90vw] sm:w-[70vw] md:w-[400px] max-w-xs h-10 flex items-center justify-center text-sm whitespace-nowrap rounded font-semibold transition-all duration-150 bg-brand-primary text-text-inverse shadow-sm mb-3 mx-auto hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary/40`}
            aria-haspopup="menu"
            aria-expanded={isAdmin}
          >
            <span>Admin</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link
              href="/protected/admin/database"
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              onClick={handleLinkClick}
            >
              Database Management
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/protected/admin/audit-logs"
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              onClick={handleLinkClick}
            >
              Audit Logs
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/protected/admin/experimental"
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              onClick={handleLinkClick}
            >
              Experimental
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/protected/admin/demos"
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              onClick={handleLinkClick}
            >
              Demos
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <AdminNav isActive={isActive} closeMenu={closeMenu} />
  );
}

// Wrapper component that checks for SSO callback before rendering
function AdminNavWithAuthWrapper({
  isActive,
  isStacked = false,
  closeMenu,
}: {
  isActive: (path: string) => boolean;
  isStacked?: boolean;
  closeMenu?: () => void;
}) {
  // Don't render during SSO callbacks to prevent useSession errors
  if (isSSOCallback()) {
    return null;
  }

  return <AdminNavWithAuthSafe isActive={isActive} isStacked={isStacked} closeMenu={closeMenu} />;
}

export function AdminNavWithAuth({
  isActive,
  isStacked = false,
  closeMenu,
}: {
  isActive: (path: string) => boolean;
  isStacked?: boolean;
  closeMenu?: () => void;
}) {
  return (
    <AdminNavWithAuthWrapper isActive={isActive} isStacked={isStacked} closeMenu={closeMenu} />
  );
}
