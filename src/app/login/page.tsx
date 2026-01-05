'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

const formSchema = z.object({
  email: z.string().email({ message: 'И-мэйл хаяг буруу байна.' }),
  password: z.string().min(1, { message: 'Нууц үгээ оруулна уу.' }),
});

export default function LoginPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
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
      // MainLayout will handle the redirect automatically
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
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Нэвтрэх</CardTitle>
          <CardDescription>
            Бүртгэлтэй и-мэйл хаяг, нууц үгээ ашиглан нэвтэрнэ үү.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>И-мэйл</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
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
                    <FormLabel>Нууц үг</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Шинэ хэрэглэгч үү?{' '}
            <Link href="/signup" className="underline text-primary">
              Бүртгүүлэх
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
