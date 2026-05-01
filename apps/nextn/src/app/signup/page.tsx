'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
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
import type {
  UserProfile,
  OrbitInfo,
  Education,
  Project,
  Skill,
  Hobby,
} from '@/lib/types';
import type { ExperienceItem } from '@/contexts/ExperienceContext';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
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
  const [showPassword, setShowPassword] = useState(false);
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
        // Default personal info with sample data (matches InfoCardArrowLayout order)
        personalInfo: [
          { label: 'Орд', value: 'Энд ордоо оруулна уу', icon: 'Star' },
          {
            label: 'Төрсөн өдөр',
            value: 'Энд төрсөн өдрөө оруулна уу',
            icon: 'Cake',
          },
          { label: 'Нас', value: 'Энд насаа оруулна уу', icon: 'Calendar' },
          { label: 'Өндөр', value: 'Энд өндрөө оруулна уу', icon: 'Ruler' },
          { label: 'MBTI', value: 'Энд MBTI-ээ оруулна уу', icon: 'User' },
        ],
        // Default greeting and role for hero section
        greeting: 'Энд мэндчилгээгээ оруулна уу',
        role: 'Энд мэргэжлээ оруулна уу',
        // Default intro/outro for about page
        introText: 'Энд танилцуулга эхлэл',
        outroText: 'Энд танилцуулга төгсгөл',
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

      // Create default sample data for new user
      const userId = pendingUserData.uid;

      // Default Education (1-2 samples)
      const defaultEducation: Omit<Education, 'id'>[] = [
        {
          degree: 'Бакалавр - Жишээ мэргэжил',
          school: 'Энд сургуулийнхаа нэрийг оруулна уу',
          startDate: new Date(2020, 8, 1),
          endDate: new Date(2024, 5, 1),
          score: '3.5 GPA',
          createdAt: serverTimestamp() as any,
        },
      ];

      // Default Projects (2 samples)
      const defaultProjects: Omit<Project, 'id'>[] = [
        {
          name: 'Жишээ төсөл 1',
          description:
            'Энд таны хийсэн төслийн тайлбарыг оруулна. Юу хийсэн, ямар технологи ашигласан гэх мэт.',
          technologies: ['React', 'TypeScript', 'Tailwind'],
          link: 'https://github.com/yourusername/project',
          live: 'https://your-project.vercel.app',
          category: 'Веб',
          image:
            'https://i.pinimg.com/1200x/70/4b/79/704b799a7822e81adb26e81bf64e50c7.jpg',
          createdAt: serverTimestamp() as any,
        },
        {
          name: 'Жишээ төсөл 2',
          description:
            'Өөр нэг төслийн тайлбар. Та энд өөрийн бодит төслүүдийг нэмж болно.',
          technologies: ['Next.js', 'Firebase'],
          category: 'Апп',
          image:
            'https://i.pinimg.com/1200x/70/4b/79/704b799a7822e81adb26e81bf64e50c7.jpg',
          createdAt: serverTimestamp() as any,
        },
      ];

      // Default Skills (2 samples)
      const defaultSkills: Omit<Skill, 'id'>[] = [
        {
          name: 'Frontend хөгжүүлэлт',
          icon: 'Code',
          items: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
          createdAt: serverTimestamp() as any,
        },
        {
          name: 'Backend хөгжүүлэлт',
          icon: 'Server',
          items: ['Node.js', 'Firebase', 'PostgreSQL'],
          createdAt: serverTimestamp() as any,
        },
      ];

      // Default Hobbies (2 samples)
      const defaultHobbies: Omit<Hobby, 'id'>[] = [
        {
          title: 'Жишээ хобби 1',
          description:
            'Энд таны хоббигийн тайлбарыг оруулна. Юу хийх дуртай, яагаад сонирхдог гэх мэт.',
          image:
            'https://i.pinimg.com/1200x/70/4b/79/704b799a7822e81adb26e81bf64e50c7.jpg',
          imageHint: 'hobby image',
          emoji: '🎮',
          createdAt: serverTimestamp() as any,
        },
        {
          title: 'Жишээ хобби 2',
          description:
            'Өөр нэг хоббигийн тайлбар. Та энд өөрийн бодит хоббиудыг нэмж болно.',
          image:
            'https://i.pinimg.com/1200x/70/4b/79/704b799a7822e81adb26e81bf64e50c7.jpg',
          imageHint: 'hobby image',
          emoji: '📚',
          createdAt: serverTimestamp() as any,
        },
      ];

      // Default Experiences (1-2 samples)
      const defaultExperiences: Omit<ExperienceItem, 'id'>[] = [
        {
          title: 'Жишээ туршлага 1',
          description:
            'Энд таны ажлын туршлагыг оруулна. Ямар компанид, ямар албан тушаалд ажилласан гэх мэт.',
          icon: 'Briefcase',
          image:
            'https://i.pinimg.com/1200x/70/4b/79/704b799a7822e81adb26e81bf64e50c7.jpg',
        },
        {
          title: 'Жишээ туршлага 2',
          description:
            'Өөр нэг туршлагын тайлбар. Та энд өөрийн бодит туршлагуудыг нэмж болно.',
          icon: 'Building',
          image:
            'https://i.pinimg.com/1200x/70/4b/79/704b799a7822e81adb26e81bf64e50c7.jpg',
        },
      ];

      // Add default education
      for (const edu of defaultEducation) {
        await addDoc(collection(firestore, `users/${userId}/education`), edu);
      }

      // Add default projects
      for (const project of defaultProjects) {
        await addDoc(
          collection(firestore, `users/${userId}/projects`),
          project
        );
      }

      // Add default skills
      for (const skill of defaultSkills) {
        await addDoc(collection(firestore, `users/${userId}/skills`), skill);
      }

      // Add default hobbies
      for (const hobby of defaultHobbies) {
        await addDoc(collection(firestore, `users/${userId}/hobbies`), hobby);
      }

      // Add default experiences
      for (const exp of defaultExperiences) {
        await addDoc(collection(firestore, `users/${userId}/experiences`), exp);
      }

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
    <>
      <AuthShell
        title="Бүртгүүлэх"
        subtitle="Шинэ хэрэглэгчийн бүртгэл хэдхэн секундэд."
        showcaseEyebrow="PersonalWeb"
        showcaseTitle="Бүх хэрэгслээ нэг бүртгэлээр."
        showcaseDescription="Бүртгүүлээд портфолио, хэл сурах, програмчлал болон бүтээмжийн хэрэгслүүдийг шууд эхлүүл."
        showcaseBullets={[
          'Хувийн портфолио — QR + хуваалцах линк',
          'Англи · Япон хэлний дасгал, үг сурах',
          'AI туслах + Trader AI зургийн анализ',
          'Pomodoro, Todo, Fitness — өдрийн төлөвлөгөө',
        ]}
        switchLabel="Бүртгэлтэй юу?"
        switchHref="/login"
        switchCta="Нэвтрэх"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Нэр
                    </FormLabel>
                    <FormControl>
                      <div className="relative input-group rounded-xl">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                          autoComplete="name"
                          placeholder="Таны нэр"
                          className="h-12 pl-10 pr-3 rounded-xl bg-muted/30 border-border/60 focus-visible:border-primary/60 focus-visible:ring-primary/30"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4 }}
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.39, duration: 0.4 }}
            >
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
                          autoComplete="new-password"
                          placeholder="Дор хаяж 6 тэмдэгт"
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.4 }}
              className="pt-1"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="group w-full h-12 rounded-xl bg-linear-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Бүртгүүлэх
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </motion.div>

            <p className="text-[11px] text-center text-muted-foreground/80 leading-relaxed">
              Бүртгүүлснээр та манай{' '}
              <Link href="/" className="underline hover:text-foreground">
                үйлчилгээний нөхцөл
              </Link>{' '}
              болон{' '}
              <Link href="/" className="underline hover:text-foreground">
                нууцлалын бодлого
              </Link>
              -г зөвшөөрч байна.
            </p>
          </form>
        </Form>
      </AuthShell>

      {pendingUserData && (
        <OnboardingDialog
          open={showOnboarding}
          onComplete={handleOnboardingComplete}
          userName={pendingUserData.name}
        />
      )}
    </>
  );
}
