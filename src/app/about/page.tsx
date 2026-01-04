
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
                  { value: "Ихэр", label: "Орд", icon: 'Gemini' },
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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between gap-12 lg:gap-20 w-full">
            {/* Personal Info Cards */}
            <div className="flex flex-col gap-6 items-center lg:items-start">
                {personalInfo.map((info, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.15, ease: 'easeOut' }}
                    className="w-full max-w-sm"
                >
                    <Card className="bg-slate-900/50 backdrop-blur-lg border-2 border-cyan-400/30 hover:border-cyan-400/60 transition-colors duration-300 group">
                          <CardContent className="p-6 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="text-cyan-400">
                                {getIcon(info.icon, "h-8 w-8")}
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-wider text-gray-300">
                                {info.label}
                                </h3>
                            </div>
                            <span className="text-3xl font-bold text-white tracking-tight">
                                {info.value}
                            </span>
                            {isEditMode && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 z-30 bg-black/80 hover:bg-black rounded-full border border-cyan-400/50" 
                                    onClick={() => handleEditInfoClick(info)}
                                >
                                    <Edit className="h-3.5 w-3.5 text-cyan-400" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
                ))}
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:w-1/2">
                <motion.h1 
                    className="text-4xl md:text-5xl font-bold tracking-tighter text-white/50"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                >
                    Hello
                </motion.h1>
                <motion.h2 
                    className="text-xl md:text-2xl text-gray-300"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
                >
                    Миний нэрийг
                </motion.h2>
                <div className="relative group" ref={nameRef}>
                    <motion.p
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
                        className="spotlight-text text-5xl md:text-7xl lg:text-8xl font-extrabold"
                    >
                        {name}
                    </motion.p>
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
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
    </motion.div>
  );
}

    

    