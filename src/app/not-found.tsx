import Link from 'next/link';

export function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p className="mt-2">Could not find the requested resource</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Return Home
      </Link>
    </div>
  );
}
