declare module '@/components/ui/use-toast' {
  export function useToast(): {
    toasts: Array<{
      id: string;
      title?: string;
      description?: string;
      action?: React.ReactNode;
      variant?: 'default' | 'destructive';
    }>;
    toast: (props: {
      title?: string;
      description?: string;
      action?: React.ReactNode;
      variant?: 'default' | 'destructive';
    }) => {
      id: string;
      dismiss: () => void;
      update: (props: any) => void;
    };
    dismiss: (toastId?: string) => void;
  };
}
