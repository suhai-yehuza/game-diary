// Types file: misc.types.ts

// Types moved from src/lib/utils/encryption.ts
export interface IEncryptedField {
  iv: string;
  content: string;
  tag: string;
}

export interface IMenuContextType {
  isMenuExpanded: boolean;
  setIsMenuExpanded: (expanded: boolean) => void;
}

export interface ISportsPageProps {
  title: string;
  userName?: string;
  children?: React.ReactNode;
}

export interface IUserGreetingProps {
  userName?: string;
}
