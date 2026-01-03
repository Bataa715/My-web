
'use client';

import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2, Save, ArrowLeft, PlusCircle, Edit, Trash2, ArrowRight } from 'lucide-react';
import { useState, useEffect, useCallback, type CSSProperties, useMemo, useRef } from 'react';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile, Hobby, PersonalInfoItem as PersonalInfoType } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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

const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const LucideIcon = (require('lucide-react') as any)[iconName];
    return LucideIcon ? <LucideIcon className="h-6 w-6 md:h-8 md:w-8 mb-3 text-white" /> : null;
};

const PersonalInfoCard = ({ info, onEditClick, isEditMode }: { info: PersonalInfoType, onEditClick: () => void, isEditMode: boolean }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["20deg", "-20deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-20deg", "20deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
    e.currentTarget.style.setProperty("--mouse-x", `${mouseX}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${mouseY}px`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="relative h-full w-full rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950"
    >
      <div
        style={{ transform: "translateZ(30px)" }}
        className="relative group h-full w-full rounded-xl p-4 flex flex-col items-center justify-center text-center text-white"
      >
        {getIcon(info.icon)}
        <p className="text-3xl md:text-4xl font-bold">{info.value}</p>
        <p className="text-xs md:text-sm uppercase font-semibold mt-1">{info.label}</p>
        
        {isEditMode && (
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 z-30" onClick={(e) => { e.stopPropagation(); onEditClick(); }}>
              <Edit className="h-4 w-4 text-white" />
          </Button>
        )}
      </div>

       <div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
            background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.15), transparent 80%)`
        }}
      />
    </motion.div>
  );
};


export default function AboutPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { isEditMode } = useEditMode();
  const { hobbies, loading: hobbiesLoading, deleteHobby } = useHobbies();
  const { toast } = useToast();
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);
  const [isImageEditingOpen, setIsImageEditingOpen] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState('');
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
      let imageUrl;
      if (user && firestore) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            imageUrl = data.aboutHeroImage;
            setEditedImageUrl(data.aboutHeroImage || '');
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
      
      if (!imageUrl) {
        const placeholder = PlaceHolderImages.find(p => p.id === 'about-hero-background');
        imageUrl = placeholder?.imageUrl;
        setEditedImageUrl(placeholder?.imageUrl || '');
      }

      setHeroImage(imageUrl);
    };

    fetchUserData();
  }, [user, firestore, isUserLoading]);
  
  const handleSaveImage = async () => {
      if (!user || !firestore) {
           toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
           return;
      }
      
      setSaving(true);
      try {
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, { aboutHeroImage: editedImageUrl });
          
          setSaving(false);
          setIsImageEditingOpen(false);
          toast({
              title: 'Амжилттай',
              description: 'Арын зураг шинэчлэгдлээ.',
          });
          setHeroImage(editedImageUrl);
      } catch (error) {
          console.error("Error saving hero image:", error);
          setSaving(false);
          toast({
              title: 'Алдаа',
              description: 'Арын зураг хадгалахад алдаа гарлаа.',
              variant: 'destructive',
          });
      }
  };

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
  
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-[calc(100vh-150px)] -z-10">
        {heroImage && (
          <Image
            src={heroImage}
            alt="Welcome background"
            fill
            className="object-cover"
            data-ai-hint="welcome abstract"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

       <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center space-y-8 text-center">
             <h1 className="text-2xl sm:text-3xl font-bold" style={{textShadow: '1px 1px 2px black, 0 0 1em white, 0 0 0.2em white'}}>
                Сайн уу? Миний нэрийг {' '}
                  <div ref={nameRef} className="relative inline-block group">
                    <span className="relative z-10 text-primary transition-colors duration-500 group-hover:text-white">
                      {name}
                    </span>
                    <div className="animated-beam absolute -inset-2 z-0 scale-x-[0.3] scale-y-[0.8] rounded-full bg-primary/20 blur-lg transition-transform duration-500 group-hover:scale-100" />
                  </div>
                {' '} гэдэг
            </h1>
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto px-4 reveal h-[160px] md:h-[180px]"
              style={{ perspective: "1000px" }}
            >
              <AnimatePresence>
                {personalInfo.map((info, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        className="h-full"
                    >
                       <PersonalInfoCard 
                          info={info} 
                          onEditClick={() => handleEditInfoClick(info)} 
                          isEditMode={isEditMode} 
                       />
                    </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
      </div>
      
      

      {isEditMode && (
        <Dialog open={isImageEditingOpen} onOpenChange={setIsImageEditingOpen}>
            <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-28 right-4 z-50">
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">Арын зураг солих</span>
            </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Арын зургийн холбоос</DialogTitle>
                <DialogDescription>
                Шинэ зургийнхаа URL хаягийг энд буулгана уу.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-url" className="text-right">
                    URL
                </Label>
                <Input
                    id="image-url"
                    value={editedImageUrl}
                    onChange={(e) => setEditedImageUrl(e.target.value)}
                    className="col-span-3"
                    placeholder="https://example.com/image.png"
                />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                <Button type="button" variant="secondary">Цуцлах</Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveImage} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Хадгалах
                </Button>
            </DialogFooter>
        </Dialog>
      )}

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
        </Dialog>
      </Dialog>
      
      <section id="hobbies" className="py-16 md:py-24 reveal">
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
                                       <Card className="relative bg-card border-border/20 h-full w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
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
                                            data-ai-hint={hobby.imageHint} 
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
    </>
  );
}
