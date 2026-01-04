
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Нэр дор хаяж 2 тэмдэгттэй байх ёстой.' }),
  email: z.string().email({ message: 'И-мэйл хаяг буруу байна.' }),
  password: z.string().min(6, { message: 'Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.' }),
});

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!firestore || !auth) {
        toast({ title: 'Алдаа', description: 'Firebase-д холбогдож чадсангүй.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const defaultImage = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
      
      const defaultOrbitInfo: OrbitInfo[] = [
        { id: 'location', icon: 'MapPin', title: 'Байршил', content: '', type: 'info' },
        { id: 'hobbies', icon: 'Gamepad2', title: 'Хобби', content: '', type: 'info' },
        { id: 'goals', icon: 'Target', title: 'Зорилго', content: '', type: 'info' },
        { id: 'user', icon: 'User', title: 'Тухай', content: '', type: 'info' },
        { id: 'song', icon: 'Music', title: 'Дуртай дуу', content: '', type: 'audio', youtubeVideoId: '' },
        { id: 'movie', icon: 'Film', title: 'Кино', content: '', type: 'info', backgroundImage: '' },
        { id: 'quote', icon: 'MessageSquareQuote', title: 'Ишлэл', content: '', type: 'info' },
        { id: 'likes', icon: 'Heart', title: 'Дуртай зүйлс', content: '', type: 'info' },
      ];
      
      const userProfile: UserProfile = {
        appName: "Kaizen",
        name: values.name,
        email: values.email,
        bio: "",
        profileImage: defaultImage,
        personalInfo: [],
        homeHeroImage: defaultImage,
        aboutHeroImage: defaultImage,
        toolsHeroImage: defaultImage,
        orbitInfo: defaultOrbitInfo,
        github: "",
        instagram: "",
        cvUrl: "",
        facebook: "",
      };

      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      toast({
        title: 'Амжилттай бүртгэгдлээ',
        description: 'Таныг нүүр хуудас руу шилжүүлж байна...',
        duration: 3000,
      });
      // MainLayout will handle the redirect automatically
    } catch (error: any) {
      const errorCode = error?.code;
      let errorMessage = error?.message || 'Бүртгүүлэхэд алдаа гарлаа.';
      
      if (errorCode === 'auth/email-already-in-use') {
        errorMessage = 'Энэ и-мэйл хаяг бүртгэлтэй байна.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'И-мэйл хаяг буруу байна.';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'Нууц үг хэтэрхий сул байна.';
      } else if (errorCode === 'auth/network-request-failed') {
        errorMessage = 'Интернэт холболтыг шалгана үү.';
      }
      
      toast({
        title: 'Бүртгүүлэхэд алдаа гарлаа',
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
          <CardTitle className="text-2xl">Бүртгүүлэх</CardTitle>
          <CardDescription>
            Шинэ хэрэглэгч үүсгэхийн тулд доорх мэдээллийг бөглөнө үү.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Нэр</FormLabel>
                    <FormControl>
                      <Input placeholder="Таны нэр" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Бүртгүүлж байна...' : 'Бүртгүүлэх'}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="flex-col items-center text-sm">
            <p className="text-muted-foreground">
                Бүртгэлтэй юу?{' '}
                <Link href="/login" className="underline text-primary">
                Нэвтрэх
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
