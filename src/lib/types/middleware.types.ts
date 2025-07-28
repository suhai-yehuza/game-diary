// Middleware types

// Admin Auth Types
export interface IAdminAuthContext {
  userId: string;
  isAdmin: boolean;
  userEmail?: string;
}
