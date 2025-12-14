'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Wrench } from 'lucide-react';

export default function Home() {

  return (
    <div className="relative flex flex-col items-center justify-center text-center h-[calc(100vh-57px-81px)] -m-4 sm:-m-6 lg:-m-8 bg-gradient-to-br from-primary/20 via-background to-accent/20">
       <div className="relative z-20 flex flex-col items-center justify-center space-y-6 px-4">
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
           Энэ бол тасралтгүй хөгжил, суралцах үйл явцыг минь харуулсан хувийн орон зай юм.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/about">
                Миний тухай <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tools">
                <Wrench className="mr-2 h-5 w-5" /> Хэрэгслүүд
              </Link>
            </Button>
          </div>
        </div>
    </div>
  );
}
