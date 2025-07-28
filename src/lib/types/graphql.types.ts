// GraphQL resolver types

// User resolver types
export interface IUserParent {
  id: string;
  email_address?: string | null;
  phone_number?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
}

export interface IUserArgs {
  id?: string;
}
