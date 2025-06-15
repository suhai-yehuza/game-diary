export interface IFilterConfig {
  defaultValue: string | number | boolean;
  type?: 'string' | 'number' | 'boolean';
  label?: string;
  options?: Array<{
    value: string | number | boolean;
    label: string;
  }>;
}

export interface IUseSearchFiltersOptions {
  filterConfig: Record<string, IFilterConfig>;
  additionalFilters?: Record<string, string | number | boolean>;
}
