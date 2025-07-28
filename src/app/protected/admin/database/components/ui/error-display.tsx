import type { IErrorDisplayProps } from '@/lib/types';

export function ErrorDisplay({ error }: IErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
      <p className="text-destructive text-sm">
        {typeof error === 'string' ? error : error.message}
      </p>
    </div>
  );
}
