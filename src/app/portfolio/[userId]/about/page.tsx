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
import { AddHobbyDialog } from '@/components/AddHobbyDialog';
import { EditHobbyDialog } from '@/components/EditHobbyDialog';
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

// InfoCard component - clean minimal design without icons
const InfoCard = ({
  info,
  index,
  isEditMode,
  onEditClick,
  size = 'normal',
}: {
  info: PersonalInfoType;
  index: number;
  isEditMode: boolean;
  onEditClick: (info: PersonalInfoType) => void;
  size?: 'small' | 'normal' | 'large';
}) => {
  const sizeClasses = {
    small: 'py-4 px-5',
    normal: 'py-5 px-6',
    large: 'py-6 px-7',
  };

  const textSizeClasses = {
    small: 'text-2xl md:text-3xl',
    normal: 'text-3xl md:text-4xl',
    large: 'text-4xl md:text-5xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: 0.1 + index * 0.1,
      }}
      whileHover={{ scale: 1.03, x: 8 }}
      className="group w-full"
    >
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden transition-all duration-500',
          'bg-gradient-to-r from-card/90 via-card/70 to-transparent backdrop-blur-xl',
          'border-l-4 border-primary/60 group-hover:border-primary',
          'group-hover:shadow-xl group-hover:shadow-primary/20',
          sizeClasses[size]
        )}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Glow effect on left border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Label */}
          <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors duration-300">
            {getDisplayLabel(info.label)}
          </span>

          {/* Value */}
          <span
            className={cn(
              'font-black text-foreground tracking-tight',
              'bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text',
              'group-hover:from-primary group-hover:to-foreground group-hover:text-transparent',
              'transition-all duration-300',
              textSizeClasses[size]
            )}
          >
            {info.value}
          </span>
        </div>

        {isEditMode && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 z-30 bg-background/80 hover:bg-primary/20 rounded-full border border-primary/50"
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

// InfoCardArrowLayout - Diagonal staircase pattern (top-right to bottom-left)
const InfoCardArrowLayout = ({
  infos,
  isEditMode,
  onEditClick,
}: {
  infos: PersonalInfoType[];
  isEditMode: boolean;
  onEditClick: (info: PersonalInfoType) => void;
}) => {
  const orderedInfo = useMemo(() => {
    if (!infos || infos.length === 0) return [];
    const infoMap = new Map(infos.map(i => [i.label, i]));
    // Order: Орд (top) -> Төрсөн өдөр -> Нас (center) -> Өндөр -> MBTI (bottom)
    const order = ['Орд', 'Төрсөн өдөр', 'Нас', 'Өндөр', 'MBTI'];

    const mainItems = order
      .map(label => infoMap.get(label))
      .filter(Boolean) as PersonalInfoType[];
    if (mainItems.length >= 5) {
      return mainItems.slice(0, 5);
    }

    const remaining = infos.filter(i => !order.includes(i.label));
    return [...mainItems, ...remaining].slice(0, 5);
  }, [infos]);

  if (!orderedInfo || orderedInfo.length < 5) {
    return (
      <div className="flex flex-col gap-3 w-full max-w-md">
        {orderedInfo.map((info, index) => (
          <InfoCard
            key={index}
            info={info}
            index={index}
            isEditMode={isEditMode}
            onEditClick={onEditClick}
          />
        ))}
      </div>
    );
  }

  // Diagonal staircase: top-right to bottom-left
  // Each card has same width, just different margin-left
  const offsets = ['ml-[0%]', 'ml-[15%]', 'ml-[30%]', 'ml-[15%]', 'ml-0'];

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {orderedInfo.map((info, index) => (
        <div key={index} className={`w-[45%] min-w-[280px] ${offsets[index]}`}>
          <InfoCard
            info={info}
            index={index}
            isEditMode={isEditMode}
            onEditClick={onEditClick}
          />
        </div>
      ))}
    </div>
  );
};

export default function AboutPage() {
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

  const scrollNext = () => setActiveIndex(prev => (prev + 1) % totalItems);
  const scrollPrev = () =>
    setActiveIndex(prev => (prev - 1 + totalItems) % totalItems);

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

  return (
    <>
      <InteractiveParticles className="fixed inset-0 z-0 pointer-events-none" />
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-100px)] flex items-start justify-center px-4 pt-24 md:pt-28">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between gap-8 lg:gap-16 w-full">
              {/* Personal Info Cards */}
              <div className="w-full lg:w-1/2">
                {personalInfo.length > 0 && (
                  <InfoCardArrowLayout
                    infos={personalInfo}
                    isEditMode={isEditMode}
                    onEditClick={handleEditInfoClick}
                  />
                )}
              </div>

              {/* Text Content - Enhanced Design */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-1/2">
                {/* Greeting with glowing effect */}
                <div className="relative mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={greetingIndex}
                      className="relative"
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      {/* Glowing background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-2xl rounded-full transform scale-150" />
                      <h1 className="relative text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
                        {greetings[greetingIndex]}
                      </h1>
                    </motion.div>
                  </AnimatePresence>
                  {/* Animated underline */}
                  <motion.div
                    className="h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full mt-2"
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>

                {/* Name section with enhanced styling */}
                <div className="relative group" ref={nameRef}>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.4,
                      ease: [0.2, 0.65, 0.3, 0.9],
                    }}
                    className="flex flex-col items-center lg:items-start gap-2"
                  >
                    <div className="flex items-baseline gap-3 flex-wrap justify-center lg:justify-start">
                      <h2 className="text-xl md:text-2xl text-muted-foreground font-light">
                        Миний нэрийг
                      </h2>
                    </div>

                    {/* Name with spotlight effect */}
                    <div className="relative py-2">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent blur-3xl" />
                      <p className="spotlight-text text-6xl md:text-8xl font-black tracking-tighter relative">
                        {name}
                      </p>
                    </div>

                    <h2 className="text-xl md:text-2xl text-muted-foreground font-light">
                      гэдэг
                    </h2>
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
          className="relative py-24 md:py-32 mt-16 md:mt-24 reveal z-10"
        >
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12 sm:mb-24">
              <h2 className="text-3xl md:text-5xl font-bold">
                Миний хоббинууд
              </h2>
            </div>

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
                          const isVisible =
                            Math.abs(
                              (activeIndex - index + totalItems) % totalItems
                            ) <= 2 ||
                            Math.abs(
                              (activeIndex - index - totalItems) % totalItems
                            ) <= 2;
                          const style: CSSProperties = {
                            transform: `rotateY(${angle}deg) translateZ(${carouselRadius}px)`,
                            opacity: isVisible ? 1 : 0.2,
                            pointerEvents: isVisible ? 'auto' : 'none',
                          };
                          if (hobby.id === 'add-new-hobby') {
                            return (
                              <div
                                className="carousel-item"
                                style={style}
                                key={hobby.id}
                                onClick={() => setActiveIndex(index)}
                              >
                                <AddHobbyDialog>
                                  <button className="relative h-full w-full rounded-2xl p-[2px] bg-gradient-to-br from-primary/30 via-purple-500/20 to-cyan-500/30 hover:from-primary/60 hover:via-purple-500/40 hover:to-cyan-500/60 transition-all duration-500 group/add">
                                    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-card/80 backdrop-blur-sm border border-dashed border-primary/30 group-hover/add:border-primary/60 transition-all duration-500">
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
                              onClick={() => setActiveIndex(index)}
                            >
                              <div className="relative h-full w-full rounded-2xl p-[2px] bg-gradient-to-br from-primary/80 via-purple-500/50 to-cyan-500/80 shadow-[0_0_30px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all duration-500">
                                <Card className="relative bg-card/90 backdrop-blur-sm h-full w-full overflow-hidden rounded-2xl transition-all duration-500 group-hover:-translate-y-1">
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
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    data-ai-hint={`3D ${hobby.imageHint || hobby.title}`}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                                  {/* Shimmer overlay effect */}
                                  <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full"
                                    style={{
                                      transition:
                                        'transform 1s ease-in-out, opacity 0.5s',
                                    }}
                                  ></div>

                                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="h-1 w-8 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
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
                  className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-card/80 backdrop-blur-md border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:bg-primary/20 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300"
                  variant="ghost"
                  size="icon"
                  disabled={displayItems.length === 0}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={scrollNext}
                  className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-card/80 backdrop-blur-md border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:bg-primary/20 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300"
                  variant="ghost"
                  size="icon"
                  disabled={displayItems.length === 0}
                >
                  <ArrowRight className="h-5 w-5" />
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
            transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1);
          }
          .carousel-item {
            position: absolute;
            width: ${itemWidth}px;
            height: 320px;
            top: 15px;
            left: 0;
            background: transparent;
            transition:
              opacity 0.6s,
              transform 0.6s;
            cursor: pointer;
          }
          .spotlight-text {
            color: transparent;
            background-clip: text;
            -webkit-background-clip: text;
            background-image: radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              hsl(var(--primary)) 20%,
              white 80%
            );
            transition: background-image 0.3s;
          }
        `}</style>
      </div>
    </>
  );
}
