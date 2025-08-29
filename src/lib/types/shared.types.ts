/**
 * Shared Types
 * Common types used across multiple type files to avoid circular dependencies
 */

// ========================================
// SHARED ENUMS
// ========================================

export enum Permission {
  // User permissions
  READ_OWN_PROFILE = 'read_own_profile',
  UPDATE_OWN_PROFILE = 'update_own_profile',
  DELETE_OWN_PROFILE = 'delete_own_profile',
  READ_OWN_GAME_LOGS = 'read_own_game_logs',
  CREATE_GAME_LOGS = 'create_game_logs',
  UPDATE_OWN_GAME_LOGS = 'update_own_game_logs',
  DELETE_OWN_GAME_LOGS = 'delete_own_game_logs',

  // Public content permissions
  READ_PUBLIC_GAME_LOGS = 'read_public_game_logs',
  READ_PROTECTED_GAME_LOGS = 'read_protected_game_logs',

  // Comment permissions
  CREATE_COMMENTS = 'create_comments',
  UPDATE_OWN_COMMENTS = 'update_own_comments',
  DELETE_OWN_COMMENTS = 'delete_own_comments',

  // Moderator permissions
  MODERATE_CONTENT = 'moderate_content',
  MODERATE_COMMENTS = 'moderate_comments',
  BAN_USERS = 'ban_users',

  // Admin permissions
  ADMIN_READ_ALL = 'admin_read_all',
  ADMIN_UPDATE_ALL = 'admin_update_all',
  ADMIN_DELETE_ALL = 'admin_delete_all',
  ADMIN_MANAGE_USERS = 'admin_manage_users',
  ADMIN_VIEW_AUDIT_LOGS = 'admin_view_audit_logs',

  // Legacy permissions (keeping for backward compatibility)
  CREATE_GAME_LOG = 'create_game_log',
  UPDATE_GAME_LOG = 'update_game_log',
  DELETE_GAME_LOG = 'delete_game_log',
  READ_COMMENTS = 'read_comments',
  CREATE_COMMENT = 'create_comment',
  UPDATE_COMMENT = 'update_comment',
  DELETE_COMMENT = 'delete_comment',
  READ_REACTIONS = 'read_reactions',
  CREATE_REACTION = 'create_reaction',
  UPDATE_REACTION = 'update_reaction',
  DELETE_REACTION = 'delete_reaction',
  READ_FRIENDSHIPS = 'read_friendships',
  CREATE_FRIENDSHIP = 'create_friendship',
  UPDATE_FRIENDSHIP = 'update_friendship',
  DELETE_FRIENDSHIP = 'delete_friendship',
  READ_USERS = 'read_users',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  ADMIN_ACCESS = 'admin_access',
  MANAGE_USERS = 'manage_users',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SYSTEM = 'manage_system',
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

// ========================================
// SHARED INTERFACES
// ========================================

export interface IUserSummary {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number?: string;
  image_url?: string;
  created_at?: string;
}

export type ISortDirection = 'asc' | 'desc' | null;

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}
