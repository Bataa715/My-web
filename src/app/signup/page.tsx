'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
import type { UserProfile, OrbitInfo } from '@/lib/types';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import OnboardingDialog from '@/components/OnboardingDialog';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Нэр дор хаяж 2 тэмдэгттэй байх ёстой.' }),
  email: z.string().email({ message: 'И-мэйл хаяг буруу байна.' }),
  password: z
    .string()
    .min(6, { message: 'Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.' }),
});

interface OnboardingData {
  bio: string;
  location: string;
  goals: string;
  interests: string[];
  learningGoals: {
    english: boolean;
    japanese: boolean;
    programming: boolean;
    fitness: boolean;
  };
}

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<{
    uid: string;
    name: string;
    email: string;
  } | null>(null);

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
      toast({
        title: 'Алдаа',
        description: 'Firebase-д холбогдож чадсангүй.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      // Store user info for onboarding
      setPendingUserData({
        uid: user.uid,
        name: values.name,
        email: values.email,
      });

      // Show onboarding dialog
      setShowOnboarding(true);
      setIsLoading(false);
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
      setIsLoading(false);
    }
  }

  const handleOnboardingComplete = async (onboardingData: OnboardingData) => {
    if (!firestore || !pendingUserData) return;

    setIsLoading(true);

    try {
      const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${pendingUserData.uid}`;
      const homeHeroImage =
        PlaceHolderImages.find(p => p.id === 'home-hero-background')
          ?.imageUrl ||
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17';
      const aboutHeroImage =
        PlaceHolderImages.find(p => p.id === 'about-hero-background')
          ?.imageUrl ||
        'https://images.unsplash.com/photo-1581533676255-4f26a768fc4a';
      const toolsHeroImage =
        PlaceHolderImages.find(p => p.id === 'tools-hero-background')
          ?.imageUrl ||
        'https://images.unsplash.com/photo-1550745165-9bc0b252726a';

      // Build interests string from selected interests
      const interestLabels: Record<string, string> = {
        music: 'Хөгжим',
        movies: 'Кино',
        reading: 'Ном унших',
        coding: 'Код бичих',
        languages: 'Хэл сурах',
        fitness: 'Фитнес',
      };
      const interestsText =
        onboardingData.interests.map(i => interestLabels[i] || i).join(', ') ||
        'Сонирхдог зүйлсээ энд бичнэ үү.';

      const defaultOrbitInfo: OrbitInfo[] = [
        {
          id: 'location',
          icon: 'MapPin',
          title: 'Байршил',
          content: onboardingData.location || 'Таны одоогийн байршил...',
          type: 'info',
        },
        {
          id: 'hobbies',
          icon: 'Gamepad2',
          title: 'Хобби',
          content: interestsText,
          type: 'info',
        },
        {
          id: 'goals',
          icon: 'Target',
          title: 'Зорилго',
          content: onboardingData.goals || 'Таны ирээдүйн зорилго...',
          type: 'info',
        },
        {
          id: 'user',
          icon: 'User',
          title: 'Тухай',
          content: 'Өөрийнхөө тухай сонирхолтой баримт.',
          type: 'info',
        },
        {
          id: 'song',
          icon: 'Music',
          title: 'Дуртай дуу',
          content: 'Сонсох дуртай дуугаа нэмээрэй.',
          type: 'audio',
          youtubeVideoId: '',
        },
        {
          id: 'movie',
          icon: 'Film',
          title: 'Кино',
          content: 'Сэтгэлд хоногшсон киногоо хуваалцаарай.',
          type: 'info',
          backgroundImage: '',
        },
        {
          id: 'quote',
          icon: 'MessageSquareQuote',
          title: 'Ишлэл',
          content: 'Урам зориг өгдөг ишлэлээ бичнэ үү.',
          type: 'info',
        },
        {
          id: 'likes',
          icon: 'Heart',
          title: 'Дуртай зүйлс',
          content: 'Таны дуртай бүх зүйлс...',
          type: 'info',
        },
      ];

      // Build learning goals info
      const learningGoalsText = Object.entries(onboardingData.learningGoals)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => {
          const labels: Record<string, string> = {
            english: 'Англи хэл',
            japanese: 'Япон хэл',
            programming: 'Программчлал',
            fitness: 'Фитнес',
          };
          return labels[key];
        })
        .join(', ');

      const userProfile: UserProfile = {
        appName: 'Kaizen',
        name: pendingUserData.name,
        email: pendingUserData.email,
        bio:
          onboardingData.bio ||
          'Өөрийнхөө тухай товч танилцуулга энд бичнэ үү.',
        profileImage: profileImage,
        personalInfo: [],
        homeHeroImage: homeHeroImage,
        aboutHeroImage: aboutHeroImage,
        toolsHeroImage: toolsHeroImage,
        orbitInfo: defaultOrbitInfo,
        github: '',
        instagram: '',
        cvUrl: '',
        facebook: '',
        learningGoals: onboardingData.learningGoals,
        onboardingCompleted: true,
      };

      await setDoc(doc(firestore, 'users', pendingUserData.uid), userProfile);

      toast({
        title: 'Амжилттай бүртгэгдлээ! 🎉',
        description: learningGoalsText
          ? `${learningGoalsText} сурахад бэлэн боллоо!`
          : 'Таныг нүүр хуудас руу шилжүүлж байна...',
        duration: 4000,
      });

      setShowOnboarding(false);
      router.push('/');
    } catch (error) {
      console.error('Error saving user profile:', error);
      toast({
        title: 'Алдаа гарлаа',
        description: 'Хэрэглэгчийн мэдээллийг хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating Shapes */}
      <motion.div
        className="absolute top-32 right-20 w-4 h-4 bg-purple-500/40 rounded-full"
        animate={{
          y: [0, -20, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-20 left-32 w-3 h-3 bg-cyan-500/40 rounded-full"
        animate={{
          y: [0, 20, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-40 right-1/4 w-5 h-5 bg-pink-500/40 rounded-full"
        animate={{
          y: [0, -15, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-6 h-6 bg-blue-500/30 rounded-full"
        animate={{
          y: [0, 25, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.7 }}
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-70" />

          {/* Card */}
          <div className="relative bg-background/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4 shadow-lg shadow-purple-500/25"
              >
                <UserPlus className="w-8 h-8 text-white" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
              >
                Бүртгүүлэх
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mt-2"
              >
                Шинэ хэрэглэгчийн бүртгэл үүсгэх
              </motion.p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          Нэр
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Таны нэр"
                            className="h-12 bg-white/5 border-white/10 rounded-xl pl-4 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          И-мэйл
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            className="h-12 bg-white/5 border-white/10 rounded-xl pl-4 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          Нууц үг
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-12 bg-white/5 border-white/10 rounded-xl pl-4 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Бүртгүүлэх
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Бүртгэлтэй юу?{' '}
                <Link
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Нэвтрэх
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Onboarding Dialog */}
      {pendingUserData && (
        <OnboardingDialog
          open={showOnboarding}
          onComplete={handleOnboardingComplete}
          userName={pendingUserData.name}
        />
      )}
    </div>
  );
}
