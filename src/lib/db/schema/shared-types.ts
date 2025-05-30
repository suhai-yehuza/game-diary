// Define JsonValue locally to avoid circular dependency
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Define a type for tables that have soft delete capability
export type SoftDeletableTable = {
  id: { data: string; driverData: string };
  deletedAt: { data: Date | null; driverData: Date | null };
};
