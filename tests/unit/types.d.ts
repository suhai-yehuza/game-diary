declare module '@/app/protected/admin/experimental/hooks' {
  export const useTeamsData: () => any;
  export const useSeasonsData: () => any;
  export const useApiFetch: () => any;
  export const useFormState: () => any;
  export const useTabState: () => any;
}

declare module '@/app/protected/admin/experimental/page' {
  const AdminExperimentalPage: React.ComponentType<any>;
  export default AdminExperimentalPage;
}

declare module '@/lib/utils/api-client' {
  export const createRapidAPIClient: () => any;
}

declare module '@/lib/utils/index' {
  export const cn: (...args: any[]) => string;
  export const formatDate: (date: any) => string;
}
