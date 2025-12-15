'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { OrbitInfo } from '@/lib/types';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Нэр дор хаяж 2 тэмдэгттэй байх ёстой.' }),
  email: z.string().email({ message: 'И-мэйл хаяг буруу байна.' }),
  password: z.string().min(6, { message: 'Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.' }),
});

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const avatarPlaceholder = PlaceHolderImages.find(p => p.id === 'avatar');
      const homeHeroPlaceholder = PlaceHolderImages.find(p => p.id === 'home-hero-background');
      const aboutHeroPlaceholder = PlaceHolderImages.find(p => p.id === 'about-hero-background');
      const toolsHeroPlaceholder = PlaceHolderImages.find(p => p.id === 'tools-hero-background');
      
      const defaultProfileImage = avatarPlaceholder?.imageUrl || "https://picsum.photos/seed/avatar/400/400";
      const defaultHomeHeroImage = homeHeroPlaceholder?.imageUrl;
      const defaultAboutHeroImage = aboutHeroPlaceholder?.imageUrl;
      const defaultToolsHeroImage = toolsHeroPlaceholder?.imageUrl;

      const defaultOrbitInfo: OrbitInfo[] = [
          { id: 'location', icon: 'MapPin', title: 'Байршил', content: 'Улаанбаатар, Монгол', type: 'info' },
          { id: 'hobbies', icon: 'Gamepad2', title: 'Хобби', content: 'Чөлөөт цагаараа код бичих, ном унших, хөгжим сонсох дуртай.', type: 'info' },
          { id: 'goals', icon: 'Target', title: 'Зорилго', content: 'Дэлхийн хэмжээний програм хангамжийн компанид ажиллах.', type: 'info' },
          { id: 'user', icon: 'User', title: 'Тухай', content: 'Би програмчлалд дуртай.', type: 'info' },
          { id: 'song', icon: 'Music', title: 'Дуртай дуу', content: 'Дуртай дууг сонсох.', type: 'audio', youtubeVideoId: 'dQw4w9WgXcQ' },
          { id: 'movie', icon: 'Film', title: 'Кино', content: 'Дуртай кино бол The Matrix. Маш олон удаа үзсэн.', type: 'info', backgroundImage: 'https://i.pinimg.com/1200x/81/31/c3/8131c3dccfe8cd2f38ff3798745fbd03.jpg' },
          { id: 'quote', icon: 'MessageSquareQuote', title: 'Ишлэл', content: '"The best way to predict the future is to invent it." - Alan Kay', type: 'info' },
          { id: 'likes', icon: 'Heart', title: 'Дуртай зүйлс', content: 'Кофе, технологи, аялал.', type: 'info' },
      ];
      const defaultLinks = {
        github: "https://github.com/Bataa715",
        instagram: "https://www.instagram.com/ka1__zen/",
      };
      
      const userProfile: UserProfile = {
        name: values.name,
        email: values.email,
        bio: "IT инженерийн чиглэлээр суралцаж буй оюутан, програмчлал, вэб хөгжүүлэлт, машин сургалт сонирхдог. Ирээдүйд програм хангамжийн инженер болно.",
        profileImage: defaultProfileImage,
        homeHeroImage: defaultHomeHeroImage,
        aboutHeroImage: defaultAboutHeroImage,
        toolsHeroImage: defaultToolsHeroImage,
        orbitInfo: defaultOrbitInfo,
        ...defaultLinks
      };

      await setDoc(doc(firestore, 'users', user.uid), userProfile);

      toast({ title: 'Амжилттай бүртгүүллээ.' });
      router.push('/home');

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Бүртгүүлэхэд алдаа гарлаа',
        description: error.code === 'auth/email-already-in-use' ? 'Энэ и-мэйл хаяг бүртгэлтэй байна.' : error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
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
         <CardFooter className="flex-col items-start text-sm">
            <p className="text-muted-foreground">
                Бүртгэлтэй юу?{' '}
                <Link href="/" className="underline text-primary">
                Нэвтрэх
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
