export interface IAuditLog {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  severity: string;
  user_id?: string;
  description?: string;
  success: boolean;
  error_message?: string;
  endpoint?: string;
  method?: string;
  details?: Record<string, unknown>;
}

export interface IFilters {
  category?: string;
  action?: string;
  severity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export type AuditLogSearchField =
  | 'all'
  | 'category'
  | 'action'
  | 'severity'
  | 'user_id'
  | 'description';
