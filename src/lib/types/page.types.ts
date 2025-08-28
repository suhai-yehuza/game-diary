/**
 * Page Component Types
 * Types for page components and their props
 */

// ========================================
// SPORTS PAGE TYPES
// ========================================

export interface ITeamDetailPageProps {
  params: Promise<{ teamId: string }>;
}

export interface IGameDetailPageProps {
  params: Promise<{ gameId: string }>;
}

export interface IPlayerDetailPageProps {
  params: Promise<{ playerId: string }>;
}

export interface IGameLogDetailPageProps {
  params: Promise<{ gameLogId: string }>;
}

// ========================================
// USER PROFILE TYPES
// ========================================

export interface IUserProfile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  phone_number?: string;
  image_url?: string;
  created_at?: string;
  is_own_profile?: boolean;
  is_friend?: boolean;
  can_view_details?: boolean;
}

export interface IUserProfilePageProps {
  params: Promise<{ userId: string }>;
}
