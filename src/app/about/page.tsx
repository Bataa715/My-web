
'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Save, ArrowLeft, PlusCircle, Edit, Trash2, ArrowRight } from 'lucide-react';
import { useState, useEffect, useCallback, type CSSProperties, useMemo, useRef } from 'react';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile, Hobby, PersonalInfoItem as PersonalInfoType } from '@/lib/types';
import { useEditMode } from '@/contexts/EditModeContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHobbies } from '@/contexts/HobbyContext';
import { AddHobbyDialog } from '@/components/AddHobbyDialog';
import { EditHobbyDialog } from '@/components/EditHobbyDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const getIcon = (iconName?: string, className: string = "h-8 w-8 mb-3 text-white") => {
    if (!iconName) return null;
    const LucideIcon = (require('lucide-react') as any)[iconName];
    return LucideIcon ? <LucideIcon className="h-8 w-8 mb-3 text-white" /> : null;
};


export default function AboutPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { isEditMode } = useEditMode();
  const { hobbies, loading: hobbiesLoading, deleteHobby } = useHobbies();
  const { toast } = useToast();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoType[]>([]);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editingInfoItem, setEditingInfoItem] = useState<PersonalInfoType | null>(null);
  const [editingInfoValue, setEditingInfoValue] = useState('');
  const [saving, setSaving] = useState(false);

  const nameRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("Batuka");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!nameRef.current) return;
      const rect = nameRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      nameRef.current.style.setProperty("--mouse-x", `${x}px`);
      nameRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    const currentRef = nameRef.current;
    currentRef?.addEventListener("mousemove", handleMouseMove);

    return () => {
      currentRef?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const displayItems = useMemo(() => {
     if (isEditMode) {
      return [...hobbies, { id: 'add-new-hobby', title: '', description: '', image: '', imageHint: '', createdAt: new Date() }];
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

  const scrollNext = () => setActiveIndex((prev) => (prev + 1) % totalItems);
  const scrollPrev = () => setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);

  useEffect(() => {
    if (isUserLoading) return;

    const fetchUserData = async () => {
      if (user && firestore) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setName(data.name || 'Batuka');
            
            if (data.personalInfo && data.personalInfo.length > 0) {
              setPersonalInfo(data.personalInfo);
            } else {
              const defaultInfo: PersonalInfoType[] = [
                  { value: "21", label: "Нас", icon: 'Cake' },
                  { value: "Мэлхий", label: "Орд", icon: 'Sun' },
                  { value: "INTJ", label: "MBTI", icon: 'User' },
              ];
              await updateDoc(userDocRef, { personalInfo: defaultInfo });
              setPersonalInfo(defaultInfo);
            }

          }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
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
        toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
        return;
    }
    setSaving(true);
    try {
        const updatedInfo = personalInfo.map(info => 
            info.label === editingInfoItem.label ? { ...info, value: editingInfoValue } : info
        );
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { personalInfo: updatedInfo });
        
        setPersonalInfo(updatedInfo);
        setSaving(false);
        setIsEditingInfo(false);
        setEditingInfoItem(null);
        toast({ title: "Амжилттай", description: "Мэдээлэл шинэчлэгдлээ." });

    } catch (error) {
        console.error("Error saving personal info:", error);
        setSaving(false);
        toast({ title: "Алдаа", description: "Мэдээлэл хадгалахад алдаа гарлаа.", variant: "destructive" });
    }
  };
  
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="relative"
    >
      {/* Futuristic Dark Navy Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0a1628] via-[#0d1b2a] to-[#1b263b]" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-cyan-400/3 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between gap-12 lg:gap-20 w-full">
            {/* Personal Info Cards - Stacked Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full lg:w-auto flex justify-center lg:justify-start"
              style={{ perspective: '1000px' }}
            >
              <div className="flex flex-col gap-6 items-start">
                {personalInfo.length > 0 && personalInfo.map((info, index) => {
                  const isHovered = hoveredCard === index;
                  const isOtherHovered = hoveredCard !== null && hoveredCard !== index;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ 
                        opacity: isOtherHovered ? 0.4 : 1,
                        y: 0,
                        scale: isOtherHovered ? 0.95 : 1,
                        filter: isOtherHovered ? 'blur(2px)' : 'blur(0px)',
                        translateZ: isHovered ? 50 : isOtherHovered ? -30 : 0,
                      }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.3 + index * 0.1,
                        ease: 'easeInOut'
                      }}
                      style={{ 
                        zIndex: isHovered ? 50 : 10 - index,
                        transformStyle: 'preserve-3d'
                      }}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="relative group"
                    >
                      {/* Main Card */}
                      <motion.div
                        animate={{
                          width: isHovered ? '500px' : '200px',
                          height: '160px',
                        }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="relative rounded-3xl overflow-hidden cursor-pointer"
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          backdropFilter: 'blur(20px)',
                          border: '2px solid',
                          borderColor: isHovered ? 'rgba(34, 211, 238, 0.6)' : 'rgba(34, 211, 238, 0.3)',
                          boxShadow: isHovered 
                            ? '0 0 40px rgba(34, 211, 238, 0.4), 0 0 80px rgba(34, 211, 238, 0.2)' 
                            : '0 0 20px rgba(34, 211, 238, 0.2)',
                        }}
                      >
                        {/* Animated glow border */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.1), transparent)',
                            animation: isHovered ? 'shimmer 2s infinite' : 'none'
                          }}
                        />

                        <div className="relative z-10 h-full flex items-center p-8">
                          {/* Collapsed State - Label */}
                          <motion.div
                            animate={{
                              opacity: isHovered ? 0 : 1,
                              x: isHovered ? -20 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute left-8 flex items-center gap-4"
                          >
                            <div className="text-cyan-400">
                              {getIcon(info.icon, "h-8 w-8")}
                            </div>
                            <h3 className="text-2xl font-bold uppercase tracking-[0.3em] text-gray-400">
                              {info.label}
                            </h3>
                          </motion.div>

                          {/* Expanded State - Full Content */}
                          <motion.div
                            animate={{
                              opacity: isHovered ? 1 : 0,
                              x: isHovered ? 0 : 30,
                            }}
                            transition={{ duration: 0.4, delay: isHovered ? 0.1 : 0 }}
                            className="w-full flex items-center justify-between gap-8"
                          >
                            {/* Left: Label */}
                            <div className="flex flex-col gap-2">
                              <h3 className="text-xl font-bold uppercase tracking-[0.3em] text-gray-400">
                                {info.label}
                              </h3>
                              <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-400 to-transparent" />
                            </div>

                            {/* Center: 3D Visual */}
                            <div className="flex-1 flex items-center justify-center">
                              {info.label.toLowerCase() === 'mbti' && (
                                <div className="w-24 h-24 relative rounded-xl overflow-hidden border border-cyan-400/30">
                                  <Image 
                                    src="/images/intj.png"
                                    alt="INTJ 3D"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              {info.label.toLowerCase() === 'нас' && (
                                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                  {info.value}
                                </div>
                              )}
                              {info.label.toLowerCase() === 'орд' && (
                                <div className="text-6xl">♊</div>
                              )}
                            </div>

                            {/* Right: Value */}
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-4xl font-bold text-white tracking-tight">
                                {info.value}
                              </span>
                              <div className="h-0.5 w-12 bg-gradient-to-l from-cyan-400 to-transparent" />
                            </div>
                          </motion.div>
                        </div>

                        {/* Edit Button */}
                        {isEditMode && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 z-30 bg-black/80 hover:bg-black rounded-full border border-cyan-400/50" 
                            onClick={() => handleEditInfoClick(info)}
                          >
                            <Edit className="h-3.5 w-3.5 text-cyan-400" />
                          </Button>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Text Content - Right Side */}
            <motion.div 
              className="w-full lg:w-auto lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div>
                <h1 
                  className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white mb-6" 
                >
                  Hello
                </h1>
              </div>

              <h2 
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-300"
              >
                Миний нэрийг <span className="text-cyan-400 font-bold relative inline-block" data-text={name}>
                  {name}
                  <span className="absolute -inset-2 bg-cyan-400/10 blur-xl -z-10" />
                </span> гэдэг
              </h2>
            </motion.div>
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
                        onChange={(e) => setEditingInfoValue(e.target.value)}
                        className="col-span-3"
                    />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary" onClick={() => { setIsEditingInfo(false); setEditingInfoItem(null); }}>Цуцлах</Button>
                </DialogClose>
                <Button type="button" onClick={handleSavePersonalInfo} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Хадгалах
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <section id="hobbies" className="relative py-24 md:py-32 mt-16 md:mt-24 reveal z-10">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 sm:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold">Миний хоббинууд</h2>
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
                        {user && <p className="text-sm text-muted-foreground mt-2">Засварлах горимд шинээр нэмнэ үү.</p>}
                    </div>
                ) : (
                <div className="carousel-container" style={{ width: `${itemWidth}px`}}>
                    <div className="carousel" style={{ transform: `rotateY(${-activeIndex * anglePerItem}deg)` }}>
                        <AnimatePresence>
                           {displayItems.map((hobby, index) => {
                              const angle = index * anglePerItem;
                              const isVisible = Math.abs((activeIndex - index + totalItems) % totalItems) <= 2 || Math.abs((activeIndex - index - totalItems) % totalItems) <= 2;
                              const style: CSSProperties = {
                                  transform: `rotateY(${angle}deg) translateZ(${carouselRadius}px)`,
                                  opacity: isVisible ? 1 : 0.2,
                                  pointerEvents: isVisible ? 'auto' : 'none',
                              };
                              if (hobby.id === 'add-new-hobby') {
                                return (
                                   <div className="carousel-item" style={style} key={hobby.id} onClick={() => setActiveIndex(index)}>
                                      <AddHobbyDialog>
                                        <button className="flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/50 bg-card/50 text-muted-foreground transition-colors hover:border-primary hover:bg-card/80 hover:text-primary">
                                            <PlusCircle size={48} />
                                            <span className="mt-4 font-semibold">Хобби нэмэх</span>
                                        </button>
                                    </AddHobbyDialog>
                                  </div>
                                )
                              }
                              return (
                                  <div className="carousel-item group" key={hobby.id} style={style} onClick={() => setActiveIndex(index)}>
                                       <Card className="relative bg-card border-[3px] border-primary/50 h-full w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
                                          {isEditMode && (
                                            <div className="absolute top-2 right-2 flex gap-1 z-20">
                                              <EditHobbyDialog hobby={hobby}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white bg-black/30 hover:bg-black/50 hover:text-white">
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                              </EditHobbyDialog>
                                              <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white bg-black/30 hover:bg-destructive/80 hover:text-white">
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                    <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                                                    <AlertDialogDescription>"{hobby.title}" хоббиг устгах гэж байна. Энэ үйлдэл буцаагдахгүй.</AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                    <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => hobby.id && deleteHobby(hobby.id)}>Устгах</AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                              </AlertDialog>
                                            </div>
                                          )}
                                          <Image 
                                            src={hobby.image} 
                                            alt={hobby.title} 
                                            fill 
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            data-ai-hint={`3D ${hobby.imageHint || hobby.title}`} 
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                           <div className="absolute bottom-0 left-0 p-4 text-white">
                                              <CardTitle className="text-base md:text-lg font-bold">{hobby.title}</CardTitle>
                                              <p className="text-xs md:text-sm text-white/80 mt-1">{hobby.description}</p>
                                           </div>
                                       </Card>
                                   </div>
                              )
                          })}
                        </AnimatePresence>
                    </div>
                </div>
                )}
                <Button
                    onClick={scrollPrev}
                    className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-10"
                    variant="outline"
                    size="icon"
                    disabled={displayItems.length === 0}
                >
                    <ArrowLeft/>
                </Button>
                <Button
                    onClick={scrollNext}
                    className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-10"
                    variant="outline"
                    size="icon"
                     disabled={displayItems.length === 0}
                >
                    <ArrowRight/>
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
                transition: opacity 0.6s, transform 0.6s;
                cursor: pointer;
            }
      `}</style>
    </motion.div>
  );
}
