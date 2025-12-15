'use client';

import { useEffect, useState } from 'react';
import { useAuth, useFirebase } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RootPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAnonymousLogin = async () => {
      if (!auth) {
        // Firebase auth is not ready yet, wait.
        return;
      }

      if (auth.currentUser) {
        // If there's already a user (either anonymous or permanent), redirect to home.
        router.push('/home');
        return;
      }

      // If no user, sign in anonymously.
      try {
        await signInAnonymously(auth);
        router.push('/home');
      } catch (error: any) {
        console.error('Anonymous login failed:', error);
        toast({
          title: 'Алдаа гарлаа',
          description: 'Түр нэвтрэлт хийхэд алдаа гарлаа. Хуудсыг дахин ачааллана уу.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    handleAnonymousLogin();
  }, [auth, router, toast]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Уншиж байна...</p>
    </div>
  );
}
