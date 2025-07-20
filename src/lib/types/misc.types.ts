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

export interface ISimpleSportsPageProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export interface IDataTableProps<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: unknown, row: T) => React.ReactNode;
  }>;
  onPageChange: (page: number) => void;
  onSearchChange?: (term: string, field: string) => void;
  onSearchClear?: () => void;
  searchTerm?: string;
  searchField?: string;
  searchFields?: Array<{ value: string; label: string }>;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export interface ISimpleSportsPageProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export interface ISportsPageLayoutProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  showLiveGamesButton?: boolean;
  showSportButtons?: boolean;
  sportButtons?: Array<{
    name: string;
    href: string;
    color: string;
  }>;
}

export interface INavigationContainerProps {
  isMenuExpanded: boolean;
  isActive: (path: string) => boolean;
  setIsMenuExpanded: (value: boolean) => void;
  closeMenu: () => void;
  isStacked: boolean;
  onMenuToggle: () => void;
}
