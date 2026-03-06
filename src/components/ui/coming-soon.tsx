import { Construction } from 'lucide-react';

export function ComingSoon({ title }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
        <Construction className="h-8 w-8 text-zinc-400" />
      </div>
      {title && <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>}
      <p className="text-sm text-zinc-500">This feature is coming soon. Stay tuned!</p>
    </div>
  );
}
