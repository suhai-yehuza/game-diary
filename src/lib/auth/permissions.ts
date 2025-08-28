import { Permission, Role, type IUser } from '@/lib/types';

// Define base permissions for each role
const USER_PERMISSIONS = [
  Permission.READ_OWN_PROFILE,
  Permission.UPDATE_OWN_PROFILE,
  Permission.DELETE_OWN_PROFILE,
  Permission.READ_OWN_GAME_LOGS,
  Permission.CREATE_GAME_LOGS,
  Permission.UPDATE_OWN_GAME_LOGS,
  Permission.DELETE_OWN_GAME_LOGS,
  Permission.READ_PUBLIC_GAME_LOGS,
  Permission.READ_PROTECTED_GAME_LOGS,
  Permission.CREATE_COMMENTS,
  Permission.UPDATE_OWN_COMMENTS,
  Permission.DELETE_OWN_COMMENTS,
];

const MODERATOR_PERMISSIONS = [
  ...USER_PERMISSIONS,
  Permission.MODERATE_CONTENT,
  Permission.MODERATE_COMMENTS,
  Permission.BAN_USERS,
];

const ADMIN_PERMISSIONS = [
  ...MODERATOR_PERMISSIONS,
  Permission.ADMIN_READ_ALL,
  Permission.ADMIN_UPDATE_ALL,
  Permission.ADMIN_DELETE_ALL,
  Permission.ADMIN_MANAGE_USERS,
  Permission.ADMIN_VIEW_AUDIT_LOGS,
];

// Define what permissions each role has
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.USER]: USER_PERMISSIONS,
  [Role.MODERATOR]: MODERATOR_PERMISSIONS,
  [Role.ADMIN]: ADMIN_PERMISSIONS,
};

export class PermissionChecker {
  private user: IUser | null;

  constructor(user: IUser | null = null) {
    this.user = user;
  }

  setUser(user: IUser | null): void {
    this.user = user;
  }

  hasPermission(permission: Permission): boolean {
    if (!this.user) return false;

    // Check explicit permissions first
    if (this.user.permissions?.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    return this.user.roles?.some(role => ROLE_PERMISSIONS[role]?.includes(permission)) ?? false;
  }

  hasRole(role: Role): boolean {
    return this.user?.roles?.includes(role) ?? false;
  }

  hasAnyRole(roles: Role[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasAllRoles(roles: Role[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  canAccessResource(resourceOwnerId: string, permission: Permission, isPublic?: boolean): boolean {
    if (!this.user) return false;

    // Admins can access everything
    if (this.hasRole(Role.ADMIN)) return true;

    // Public resources
    if (isPublic && permission === Permission.READ_PUBLIC_GAME_LOGS) {
      return true;
    }

    // Own resources
    if (this.user.id === resourceOwnerId) {
      return this.hasPermission(permission);
    }

    // Check if it's a "read protected" permission for friends
    if (permission === Permission.READ_PROTECTED_GAME_LOGS) {
      // This would require friendship check - simplified for now
      return this.hasPermission(permission);
    }

    return false;
  }

  canModerate(): boolean {
    return this.hasAnyRole([Role.MODERATOR, Role.ADMIN]);
  }

  isAdmin(): boolean {
    return this.hasRole(Role.ADMIN);
  }

  getEffectivePermissions(): Permission[] {
    if (!this.user) return [];

    const rolePermissions = this.user.roles?.flatMap(role => ROLE_PERMISSIONS[role] || []) ?? [];

    const explicitPermissions = this.user.permissions || [];

    // Combine and deduplicate
    return Array.from(new Set([...rolePermissions, ...explicitPermissions]));
  }
}

// Helper functions for common permission checks
export function requirePermission(checker: PermissionChecker, permission: Permission): void {
  if (!checker.hasPermission(permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }
}

export function requireRole(checker: PermissionChecker, role: Role): void {
  if (!checker.hasRole(role)) {
    throw new Error(`Missing required role: ${role}`);
  }
}

export function requireAdmin(checker: PermissionChecker): void {
  if (!checker.isAdmin()) {
    throw new Error('Admin access required');
  }
}
