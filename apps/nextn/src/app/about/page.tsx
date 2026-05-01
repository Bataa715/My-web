'use client';

import { Button } from '@/components/ui/button';
import {
  Loader2,
  Save,
  ArrowLeft,
  PlusCircle,
  Edit,
  Trash2,
  ArrowRight,
  Calendar,
  Cake,
  Star,
  Ruler,
  Brain,
  User,
  Heart,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Home,
} from 'lucide-react';
import {
  useState,
  useEffect,
  useCallback,
  type CSSProperties,
  useMemo,
  useRef,
} from 'react';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type {
  UserProfile,
  Hobby,
  PersonalInfoItem as PersonalInfoType,
} from '@/lib/types';
import { useEditMode } from '@/contexts/EditModeContext';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHobbies } from '@/contexts/HobbyContext';
import { HobbyProvider } from '@/contexts/HobbyContext';
import { AddHobbyDialog } from '@/components/AddHobbyDialog';
import { EditHobbyDialog } from '@/components/EditHobbyDialog';
import { AddPersonalInfoDialog } from '@/components/AddPersonalInfoDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import PageHeader from '@/components/shared/PageHeader';

// Icon map for personal info icons
const iconMap: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="h-5 w-5" />,
  Cake: <Cake className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
  Ruler: <Ruler className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  User: <User className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  MapPin: <MapPin className="h-5 w-5" />,
  Mail: <Mail className="h-5 w-5" />,
  Phone: <Phone className="h-5 w-5" />,
  Briefcase: <Briefcase className="h-5 w-5" />,
  GraduationCap: <GraduationCap className="h-5 w-5" />,
  Home: <Home className="h-5 w-5" />,
};

const getIcon = (iconName?: string) => {
  if (!iconName) return <User className="h-5 w-5" />;
  return iconMap[iconName] || <User className="h-5 w-5" />;
};

// Display label mapping (Firebase label -> Display label)
const displayLabelMap: Record<string, string> = {
  'Төрсөн өдөр': 'Bday',
};

const getDisplayLabel = (label: string) => displayLabelMap[label] || label;

// InfoCard component - modern glass tile
const InfoCard = ({
  info,
  isEditMode,
  onEditClick,
}: {
  info: PersonalInfoType;
  index: number;
  isEditMode: boolean;
  onEditClick: (info: PersonalInfoType) => void;
  size?: 'small' | 'normal' | 'large';
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35 }}
      className="group relative h-full"
    >
      <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-primary/40 via-accent/15 to-transparent opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl p-4 sm:p-5 transition-colors duration-300 group-hover:border-primary/40">
        {/* Corner accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary/15 blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="relative z-10 flex h-full flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              {getIcon(info.icon)}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {getDisplayLabel(info.label)}
            </span>
          </div>

          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight break-words">
            {info.value}
          </span>
        </div>

        {isEditMode && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 z-30 bg-background/70 hover:bg-primary/15 rounded-full border border-border/70"
            onClick={e => {
              e.stopPropagation();
              onEditClick(info);
            }}
          >
            <Edit className="h-3.5 w-3.5 text-primary" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// InfoCardArrowLayout - modern responsive bento grid
const InfoCardArrowLayout = ({
  infos,
  isEditMode,
  onEditClick,
  onAddClick,
}: {
  infos: PersonalInfoType[];
  isEditMode: boolean;
  onEditClick: (info: PersonalInfoType) => void;
  onAddClick?: (info: PersonalInfoType) => void;
}) => {
  const orderedInfo = useMemo(() => {
    if (!infos || infos.length === 0) return [];
    const infoMap = new Map(infos.map(i => [i.label, i]));
    const order = ['Орд', 'Төрсөн өдөр', 'Нас', 'Өндөр', 'MBTI'];
    const mainItems = order
      .map(label => infoMap.get(label))
      .filter(Boolean) as PersonalInfoType[];
    const remaining = infos.filter(i => !order.includes(i.label));
    return [...mainItems, ...remaining];
  }, [infos]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
      {orderedInfo.map((info, index) => (
        <InfoCard
          key={index}
          info={info}
          index={index}
          isEditMode={isEditMode}
          onEditClick={onEditClick}
        />
      ))}
      {isEditMode && (
        <AddPersonalInfoDialog onAdd={onAddClick}>
          <motion.button
            whileHover={{ y: -4 }}
            className="group relative h-full min-h-[120px] overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-card/30 backdrop-blur-md transition-all duration-300 hover:border-primary/60 hover:bg-primary/5"
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
              <PlusCircle
                size={28}
                className="text-muted-foreground group-hover:text-primary transition-colors duration-300"
              />
              <span className="text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground group-hover:text-primary transition-colors duration-300">
                Мэдээлэл нэмэх
              </span>
            </div>
          </motion.button>
        </AddPersonalInfoDialog>
      )}
    </div>
  );
};

export default function AboutPage() {
  return (
    <HobbyProvider>
      <AboutPageInner />
    </HobbyProvider>
  );
}

function AboutPageInner() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { isEditMode } = useEditMode();
  const { hobbies, loading: hobbiesLoading, deleteHobby } = useHobbies();
  const { toast } = useToast();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoType[]>([]);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editingInfoItem, setEditingInfoItem] =
    useState<PersonalInfoType | null>(null);
  const [editingInfoValue, setEditingInfoValue] = useState('');
  const [saving, setSaving] = useState(false);

  const nameRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('Batuka');
  const [introText, setIntroText] = useState('');
  const [outroText, setOutroText] = useState('');
  const [isEditingIntroText, setIsEditingIntroText] = useState(false);
  const [editedIntroText, setEditedIntroText] = useState('');
  const [isEditingOutroText, setIsEditingOutroText] = useState(false);
  const [editedOutroText, setEditedOutroText] = useState('');

  const greetings = useMemo(
    () => ['Сайн уу', 'こんにちは', 'Hello', '안녕하세요', 'Привет', 'Hallo'],
    []
  );
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex(prevIndex => (prevIndex + 1) % greetings.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [greetings.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!nameRef.current) return;
      const rect = nameRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      nameRef.current.style.setProperty('--mouse-x', `${x}px`);
      nameRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    const currentRef = nameRef.current;
    currentRef?.addEventListener('mousemove', handleMouseMove);

    return () => {
      currentRef?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const displayItems = useMemo(() => {
    if (isEditMode) {
      return [
        ...hobbies,
        {
          id: 'add-new-hobby',
          title: '',
          description: '',
          image: '',
          imageHint: '',
          createdAt: new Date(),
        },
      ];
    }
    return hobbies;
  }, [hobbies, isEditMode]);

  // 3D Carousel State
  const [activeIndex, setActiveIndex] = useState(0);
  const totalItems = displayItems.length > 0 ? displayItems.length : 1;
  const anglePerItem = 360 / totalItems;
  const CIRCLE_RADIUS_DESKTOP = 400; // Controls the circle's radius
  const ITEM_WIDTH_DESKTOP = 250; // Width of a card
  const CIRCLE_RADIUS_MOBILE = 220;
  const ITEM_WIDTH_MOBILE = 180;

  const [carouselRadius, setCarouselRadius] = useState(CIRCLE_RADIUS_DESKTOP);
  const [itemWidth, setItemWidth] = useState(ITEM_WIDTH_DESKTOP);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCarouselRadius(CIRCLE_RADIUS_MOBILE);
        setItemWidth(ITEM_WIDTH_MOBILE);
      } else {
        setCarouselRadius(CIRCLE_RADIUS_DESKTOP);
        setItemWidth(ITEM_WIDTH_DESKTOP);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Unbounded index so rotation always continues forward/backward (no jerky wrap-around spin)
  const scrollNext = () => setActiveIndex(prev => prev + 1);
  const scrollPrev = () => setActiveIndex(prev => prev - 1);
  const goToIndex = (target: number) => {
    setActiveIndex(prev => {
      const currentMod = ((prev % totalItems) + totalItems) % totalItems;
      let delta = target - currentMod;
      if (delta > totalItems / 2) delta -= totalItems;
      else if (delta < -totalItems / 2) delta += totalItems;
      return prev + delta;
    });
  };

  useEffect(() => {
    if (isUserLoading || !user || !firestore) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setName(data.name || 'Batuka');
          setPersonalInfo(data.personalInfo || []);
          setIntroText(data.introText || '');
          setOutroText(data.outroText || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, firestore, isUserLoading]);

  const handleEditInfoClick = (info: PersonalInfoType) => {
    setEditingInfoItem(info);
    setEditingInfoValue(info.value);
    setIsEditingInfo(true);
  };

  const handleSavePersonalInfo = async () => {
    if (!user || !firestore || !editingInfoItem) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const updatedInfo = personalInfo.map(info =>
        info.label === editingInfoItem.label
          ? { ...info, value: editingInfoValue }
          : info
      );
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { personalInfo: updatedInfo });

      setPersonalInfo(updatedInfo);
      setSaving(false);
      setIsEditingInfo(false);
      setEditingInfoItem(null);
      toast({ title: 'Амжилттай', description: 'Мэдээлэл шинэчлэгдлээ.' });
    } catch (error) {
      console.error('Error saving personal info:', error);
      setSaving(false);
      toast({
        title: 'Алдаа',
        description: 'Мэдээлэл хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveIntroText = async () => {
    if (!user || !firestore) return;
    setSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { introText: editedIntroText });
      setIntroText(editedIntroText);
      setIsEditingIntroText(false);
      toast({ title: 'Амжилттай', description: 'Текст шинэчлэгдлээ.' });
    } catch (error) {
      console.error('Error saving intro text:', error);
      toast({
        title: 'Алдаа',
        description: 'Текст хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOutroText = async () => {
    if (!user || !firestore) return;
    setSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { outroText: editedOutroText });
      setOutroText(editedOutroText);
      setIsEditingOutroText(false);
      toast({ title: 'Амжилттай', description: 'Текст шинэчлэгдлээ.' });
    } catch (error) {
      console.error('Error saving outro text:', error);
      toast({
        title: 'Алдаа',
        description: 'Текст хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <InteractiveParticles className="fixed inset-0 z-0 pointer-events-none" />

      {/* Global aurora backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-accent/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-100px)] flex items-center justify-center px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-10">
          {/* Hero spotlight */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 [background:conic-gradient(from_180deg_at_50%_50%,hsl(var(--primary)/0.32),transparent_40%,hsl(var(--primary)/0.22)_70%,transparent)] blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                backgroundSize: '64px 64px',
                maskImage:
                  'radial-gradient(ellipse at center, black 25%, transparent 75%)',
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto w-full relative">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Personal Info Cards */}
              <div className="w-full order-2 lg:order-1">
                {(personalInfo.length > 0 || isEditMode) && (
                  <InfoCardArrowLayout
                    infos={personalInfo}
                    isEditMode={isEditMode}
                    onEditClick={handleEditInfoClick}
                    onAddClick={newInfo => {
                      setPersonalInfo(prev => [...prev, newInfo]);
                    }}
                  />
                )}
              </div>

              {/* Text Content */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-2">
                {/* Greeting eyebrow + animated word */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 backdrop-blur-md px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-primary"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                  </span>
                  Танилцуулга
                </motion.div>

                <div className="relative mt-5 mb-3 h-[3.5rem] sm:h-[5rem] md:h-[6.5rem] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.h1
                      key={greetingIndex}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.45, ease: 'easeInOut' }}
                      className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-linear-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent leading-[1.05]"
                    >
                      {greetings[greetingIndex]}
                    </motion.h1>
                  </AnimatePresence>
                </div>

                {/* Intro - Name - Outro */}
                <div className="relative group w-full" ref={nameRef}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                    className="flex flex-col items-center lg:items-start gap-2"
                  >
                    {isEditingIntroText ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedIntroText}
                          onChange={e => setEditedIntroText(e.target.value)}
                          className="w-40 h-8 text-lg"
                          placeholder="Текст..."
                        />
                        <Button
                          onClick={handleSaveIntroText}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditedIntroText(introText);
                            setIsEditingIntroText(false);
                          }}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <h2 className="text-sm sm:text-base md:text-lg text-muted-foreground font-mono uppercase tracking-[0.18em] flex items-center gap-2">
                        {introText}
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditedIntroText(introText);
                              setIsEditingIntroText(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </h2>
                    )}

                    {/* Name with mouse-tracked spotlight gradient */}
                    <div className="relative py-1 sm:py-2">
                      <p className="spotlight-text text-5xl sm:text-7xl md:text-8xl xl:text-[7.5rem] font-black tracking-tighter leading-[0.95]">
                        {name}
                      </p>
                    </div>

                    {isEditingOutroText ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedOutroText}
                          onChange={e => setEditedOutroText(e.target.value)}
                          className="w-32 h-8 text-lg"
                          placeholder="Текст..."
                        />
                        <Button
                          onClick={handleSaveOutroText}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditedOutroText(outroText);
                            setIsEditingOutroText(false);
                          }}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <h2 className="text-sm sm:text-base md:text-lg text-muted-foreground font-mono uppercase tracking-[0.18em] flex items-center gap-2">
                        {outroText}
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditedOutroText(outroText);
                              setIsEditingOutroText(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </h2>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Dialog open={isEditingInfo} onOpenChange={setIsEditingInfo}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>"{editingInfoItem?.label}"-г засах</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="info-value" className="text-right">
                  Утга
                </Label>
                <Input
                  id="info-value"
                  value={editingInfoValue}
                  onChange={e => setEditingInfoValue(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditingInfo(false);
                    setEditingInfoItem(null);
                  }}
                >
                  Цуцлах
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleSavePersonalInfo}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}{' '}
                Хадгалах
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <section
          id="hobbies"
          className="relative py-12 sm:py-16 md:py-20 lg:py-24 mt-12 sm:mt-16 md:mt-20 reveal z-10"
        >
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <PageHeader
              eyebrow="Сонирхол"
              icon={<Heart className="h-3.5 w-3.5" />}
              title="Миний хоббинууд"
              description="Чөлөөт цагаар хийдэг, урам зориг өгдөг зүйлүүд."
            />
            <div className="mb-10" />

            {hobbiesLoading ? (
              <div className="flex justify-center items-center h-[350px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <div className="relative flex items-center justify-center h-[350px]">
                {displayItems.length === 0 && !isEditMode ? (
                  <div className="text-center">
                    <p className="text-muted-foreground">Хобби олдсонгүй.</p>
                    {user && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Засварлах горимд шинээр нэмнэ үү.
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className="carousel-container"
                    style={{ width: `${itemWidth}px` }}
                  >
                    <div
                      className="carousel"
                      style={{
                        transform: `rotateY(${-activeIndex * anglePerItem}deg)`,
                      }}
                    >
                      <AnimatePresence>
                        {displayItems.map((hobby, index) => {
                          const angle = index * anglePerItem;
                          const activeMod =
                            ((activeIndex % totalItems) + totalItems) %
                            totalItems;
                          let diff = Math.abs(index - activeMod);
                          if (diff > totalItems / 2) diff = totalItems - diff;
                          const isFront = diff === 0;
                          // Smooth opacity & blur falloff for natural depth
                          const opacity = Math.max(0.15, 1 - diff * 0.32);
                          const blurAmount = Math.min(diff * 1.2, 4);
                          const isInteractive = diff <= 1;
                          const style: CSSProperties = {
                            transform: `rotateY(${angle}deg) translateZ(${carouselRadius}px)`,
                            opacity,
                            filter: isFront ? 'none' : `blur(${blurAmount}px)`,
                            pointerEvents: isInteractive ? 'auto' : 'none',
                          };
                          if (hobby.id === 'add-new-hobby') {
                            return (
                              <div
                                className="carousel-item"
                                style={style}
                                key={hobby.id}
                                onClick={() => goToIndex(index)}
                              >
                                <AddHobbyDialog>
                                  <button className="relative h-full w-full rounded-2xl p-[2px] bg-linear-to-br from-primary/30 via-accent/20 to-primary/20 hover:from-primary/60 hover:via-accent/40 hover:to-primary/40 transition-all duration-500 group/add">
                                    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-card/80 backdrop-blur-xs border border-dashed border-primary/30 group-hover/add:border-primary/60 transition-all duration-500">
                                      <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover/add:bg-primary/40 transition-all duration-500"></div>
                                        <PlusCircle
                                          size={56}
                                          className="relative text-primary/60 group-hover/add:text-primary group-hover/add:scale-110 transition-all duration-300"
                                        />
                                      </div>
                                      <span className="mt-4 font-semibold text-muted-foreground group-hover/add:text-primary transition-colors duration-300">
                                        Хобби нэмэх
                                      </span>
                                    </div>
                                  </button>
                                </AddHobbyDialog>
                              </div>
                            );
                          }
                          return (
                            <div
                              className="carousel-item group"
                              key={hobby.id}
                              style={style}
                              onClick={() => goToIndex(index)}
                            >
                              <div className="relative h-full w-full rounded-2xl p-[2px] bg-linear-to-br from-primary via-accent/60 to-primary/70 shadow-[0_0_30px_hsl(var(--primary)/0.3)] group-hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)] transition-all duration-500">
                                <Card className="relative bg-card/90 backdrop-blur-xs h-full w-full overflow-hidden rounded-2xl transition-all duration-500 group-hover:-translate-y-1">
                                  {isEditMode && (
                                    <div className="absolute top-3 right-3 flex gap-2 z-20">
                                      <EditHobbyDialog hobby={hobby}>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-9 w-9 rounded-full text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:text-white hover:scale-110 transition-all"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </EditHobbyDialog>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-500/50 hover:text-white hover:scale-110 transition-all"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Устгахдаа итгэлтэй байна уу?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              "{hobby.title}" хоббиг устгах гэж
                                              байна. Энэ үйлдэл буцаагдахгүй.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Цуцлах
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                hobby.id &&
                                                deleteHobby(hobby.id)
                                              }
                                            >
                                              Устгах
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  )}
                                  <Image
                                    src={hobby.image}
                                    alt={hobby.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    data-ai-hint={`3D ${hobby.imageHint || hobby.title}`}
                                    unoptimized={/\.gif(\?|$)/i.test(hobby.image)}
                                  />
                                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                                  {/* Shimmer overlay effect */}
                                  <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full"
                                    style={{
                                      transition:
                                        'transform 1s ease-in-out, opacity 0.5s',
                                    }}
                                  ></div>

                                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="h-1 w-8 bg-linear-to-r from-primary to-accent rounded-full"></div>
                                    </div>
                                    <CardTitle className="text-lg md:text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
                                      {hobby.title}
                                    </CardTitle>
                                    <p className="text-sm text-white/70 mt-2 line-clamp-3 group-hover:text-white/90 transition-colors duration-300">
                                      {hobby.description}
                                    </p>
                                  </div>

                                  {/* Corner decorations */}
                                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/50 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/50 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </Card>
                              </div>
                            </div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                <Button
                  onClick={scrollPrev}
                  className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-card/60 backdrop-blur-xl border border-border/60 text-foreground/80 hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-300"
                  variant="ghost"
                  size="icon"
                  disabled={displayItems.length === 0}
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  onClick={scrollNext}
                  className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-card/60 backdrop-blur-xl border border-border/60 text-foreground/80 hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-300"
                  variant="ghost"
                  size="icon"
                  disabled={displayItems.length === 0}
                >
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            )}
          </div>
        </section>

        <style jsx>{`
          .carousel-container {
            perspective: 2000px;
            height: 350px;
            position: relative;
          }
          .carousel {
            width: 100%;
            height: 100%;
            position: absolute;
            transform-style: preserve-3d;
            transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
            will-change: transform;
            backface-visibility: hidden;
          }
          .carousel-item {
            position: absolute;
            width: ${itemWidth}px;
            height: 320px;
            top: 15px;
            left: 0;
            background: transparent;
            transition:
              opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              filter 0.7s cubic-bezier(0.22, 1, 0.36, 1);
            cursor: pointer;
            will-change: transform, opacity, filter;
            backface-visibility: hidden;
            transform-style: preserve-3d;
          }
        `}</style>
      </div>
    </>
  );
}
