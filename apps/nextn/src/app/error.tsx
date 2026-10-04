'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/50 p-8 text-center backdrop-blur-xl shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-xl font-bold">Алдаа гарлаа</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Хуудсыг ачаалахад асуудал гарлаа. Дахин оролдоно уу.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="ghost">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Нүүр хуудас
            </Link>
          </Button>
          <Button onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Дахин оролдох
          </Button>
        </div>
      </div>
    </div>
  );
}
