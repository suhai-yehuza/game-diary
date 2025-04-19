export type AuthUser = {
  id: string;
  username?: string;
  email: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  userId: string;
  isAuthenticated: boolean;
};

export type AuthContext = React.Context<AuthContextType>;
