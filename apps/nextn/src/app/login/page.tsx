'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const dynamic = 'force-dynamic';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';

const formSchema = z.object({
  email: z.string().email({ message: 'И-мэйл хаяг буруу байна.' }),
  password: z.string().min(1, { message: 'Нууц үгээ оруулна уу.' }),
});

export default function LoginPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!auth) {
      toast({
        title: 'Алдаа',
        description: 'Firebase-д холбогдож чадсангүй.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Амжилттай нэвтэрлээ',
        description: 'Таныг нүүр хуудас руу шилжүүлж байна...',
        duration: 3000,
      });
    } catch (error: any) {
      let errorMessage = 'Нэвтрэхэд тодорхойгүй алдаа гарлаа.';
      if (error?.code === 'auth/user-not-found') {
        errorMessage = 'Хэрэглэгч олдсонгүй. Бүртгүүлнэ үү.';
      } else if (error?.code === 'auth/wrong-password') {
        errorMessage = 'Нууц үг буруу байна.';
      } else if (error?.code === 'auth/invalid-credential') {
        errorMessage = 'И-мэйл эсвэл нууц үг буруу байна.';
      } else if (error?.code === 'auth/too-many-requests') {
        errorMessage = 'Хэт олон оролдлого хийсэн байна. Хэсэг хүлээнэ үү.';
      } else if (error?.code === 'auth/network-request-failed') {
        errorMessage = 'Интернэт холболтыг шалгана үү.';
      }
      toast({
        title: 'Нэвтрэхэд алдаа гарлаа',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      title="Нэвтрэх"
      subtitle="Имэйл болон нууц үгээрээ нэвтэрнэ үү."
      switchLabel="Шинэ хэрэглэгч үү?"
      switchHref="/signup"
      switchCta="Бүртгүүлэх"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    И-мэйл
                  </FormLabel>
                  <FormControl>
                    <div className="relative input-group rounded-xl">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="h-12 pl-10 pr-3 rounded-xl bg-muted/30 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/30"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Нууц үг
                  </FormLabel>
                  <FormControl>
                    <div className="relative input-group rounded-xl">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-12 pl-10 pr-11 rounded-xl bg-muted/30 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/30"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <Button
              type="submit"
              disabled={isLoading}
              className="group w-full h-12 rounded-xl bg-linear-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="inline-flex items-center gap-2">
                  Нэвтрэх
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              )}
            </Button>
        </form>
      </Form>
    </AuthShell>
  );
}


