export enum Permission {
  // User permissions
  READ_OWN_PROFILE = 'read:own_profile',
  UPDATE_OWN_PROFILE = 'update:own_profile',
  DELETE_OWN_PROFILE = 'delete:own_profile',

  // Game log permissions
  READ_OWN_GAME_LOGS = 'read:own_game_logs',
  CREATE_GAME_LOGS = 'create:game_logs',
  UPDATE_OWN_GAME_LOGS = 'update:own_game_logs',
  DELETE_OWN_GAME_LOGS = 'delete:own_game_logs',

  // Public content permissions
  READ_PUBLIC_GAME_LOGS = 'read:public_game_logs',
  READ_PROTECTED_GAME_LOGS = 'read:protected_game_logs',

  // Comment permissions
  CREATE_COMMENTS = 'create:comments',
  UPDATE_OWN_COMMENTS = 'update:own_comments',
  DELETE_OWN_COMMENTS = 'delete:own_comments',

  // Admin permissions
  ADMIN_READ_ALL = 'admin:read_all',
  ADMIN_UPDATE_ALL = 'admin:update_all',
  ADMIN_DELETE_ALL = 'admin:delete_all',
  ADMIN_MANAGE_USERS = 'admin:manage_users',
  ADMIN_VIEW_AUDIT_LOGS = 'admin:view_audit_logs',

  // Moderator permissions
  MODERATE_CONTENT = 'moderate:content',
  MODERATE_COMMENTS = 'moderate:comments',
  BAN_USERS = 'moderate:ban_users',
}

export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

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

export interface IUser {
  id: string;
  roles: Role[];
  permissions?: Permission[];
}

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
    return this.user.roles.some(role => ROLE_PERMISSIONS[role]?.includes(permission));
  }

  hasRole(role: Role): boolean {
    return this.user?.roles.includes(role) ?? false;
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

    const rolePermissions = this.user.roles.flatMap(role => ROLE_PERMISSIONS[role] || []);

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
