import Link from 'next/link';
import { Compass, Home, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/50 p-8 text-center backdrop-blur-xl shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-7 w-7" aria-hidden />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-1 text-xl font-bold">Хуудас олдсонгүй</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Таны хайсан хуудас байхгүй эсвэл зөөгдсөн байна.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="ghost">
            <Link href="/#tools">
              <Wrench className="mr-2 h-4 w-4" /> Хэрэгслүүд
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Нүүр хуудас
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
