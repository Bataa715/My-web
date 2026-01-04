

"use client";

import Link from "next/link";
import { Github, Instagram, Mail, Edit, Save, XCircle, Loader2, AlertTriangle, Pencil, Upload, User, Heart, Target, MessageSquareQuote, Film, Music, Gamepad2, MapPin, BrainCircuit, PlayCircle, Download, Facebook } from 'lucide-react';
import { useState, useEffect, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { OrbitInfo, UserProfile } from "@/lib/types";
import { useEditMode } from "@/contexts/EditModeContext";
import Image from "next/image";
import { useFirebase } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import IconPicker from "../shared/IconPicker";
import { Skeleton } from "../ui/skeleton";

const getIcon = (iconName: string, props = {}) => {
    // Add BrainCircuit as a special case if the user had 'brain'
    if (iconName === 'brain' || iconName === 'Brain') return <BrainCircuit className="h-8 w-8" {...props} />;
    
    const LucideIcon = (require('lucide-react') as any)[iconName];
    return LucideIcon ? <LucideIcon className="h-8 w-8" {...props} /> : <AlertTriangle className="h-8 w-8 text-destructive" {...props} />;
};

interface OrbitItemProps {
  item: OrbitInfo;
  index: number;
  total: number;
  selectedOrbit: OrbitInfo | null;
  onItemClick: (item: OrbitInfo) => void;
  isEditing: boolean;
}

const OrbitItem: FC<OrbitItemProps> = ({ item, index, total, selectedOrbit, onItemClick, isEditing }) => {
    const angle = (index / total) * 2 * Math.PI;
    
    const baseRadius = 140; // Reduced for mobile
    const mdBaseRadius = 240;
    const editingRadius = 160; // Reduced for mobile
    const mdEditingRadius = 270;

    const [currentRadius, setCurrentRadius] = useState(baseRadius);

    useEffect(() => {
        const updateRadius = () => {
            const isMd = window.innerWidth >= 768;
            if (isEditing) {
                setCurrentRadius(isMd ? mdEditingRadius : editingRadius);
            } else {
                setCurrentRadius(isMd ? mdBaseRadius : baseRadius);
            }
        };
        window.addEventListener('resize', updateRadius);
        updateRadius();
        return () => window.removeEventListener('resize', updateRadius);
    }, [isEditing]);

    const xPos = Math.cos(angle) * currentRadius;
    const yPos = Math.sin(angle) * currentRadius;

    return (
        <motion.div
            key={item.id}
            className="absolute h-14 w-14 md:h-16 md:w-16"
            style={{
                top: '50%',
                left: '50%',
                zIndex: 20
            }}
            initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
            animate={{
                opacity: 1,
                scale: 1,
                x: `calc(-50% + ${xPos}px)`,
                y: `calc(-50% + ${yPos}px)`,
            }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1, type: "spring", stiffness: 120 }}
        >
            <Button
                variant="outline"
                size="icon"
                className={cn(
                    "rounded-full h-14 w-14 md:h-16 md:w-16 border-2 border-primary/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110",
                    selectedOrbit?.id === item.id && "bg-primary text-primary-foreground scale-110"
                )}
                onClick={() => onItemClick(item)}
            >
                {getIcon(item.icon, { className: "h-6 w-6 md:h-8 md:w-8" })}
                <span className="sr-only">{item.title}</span>
            </Button>
        </motion.div>
    );
};

const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    let videoId = null;
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match) {
        videoId = match[1];
    }
    return videoId;
};

type SocialLinkType = 'github' | 'instagram' | 'facebook' | 'email';

interface SocialInfo {
    type: SocialLinkType;
    url: string;
    icon: React.ReactNode;
    name: string;
}

export default function Hero() {
  const { isEditMode } = useEditMode();
  const { firestore, user, isUserLoading } = useFirebase();
  const [profileImage, setProfileImage] = useState<string>('');
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [orbitInfo, setOrbitInfo] = useState<OrbitInfo[]>([]);
  const [socialLinks, setSocialLinks] = useState({ github: '', instagram: '', email: '', cvUrl: '', facebook: '' });

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editedImage, setEditedImage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitInfo | null>(null);
  const [isEditingOrbit, setIsEditingOrbit] = useState(false);
  const [editedOrbitTitle, setEditedOrbitTitle] = useState("");
  const [editedOrbitIcon, setEditedOrbitIcon] = useState("");
  const [editedOrbitContent, setEditedOrbitContent] = useState("");
  const [editedOrbitBgImage, setEditedOrbitBgImage] = useState("");
  const [editedYoutubeUrl, setEditedYoutubeUrl] = useState("");
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [editedLinks, setEditedLinks] = useState({ github: '', instagram: '', email: '', cvUrl: '', facebook: '' });

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<SocialInfo | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(true);
  
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserInfo = async () => {
        if (isUserLoading) {
            setLoading(true);
            return;
        }

        if (!user || !firestore) {
            setLoading(false);
            return;
        }

        const userInfoDocRef = doc(firestore, "users", user.uid);
        setLoading(true);
      try {
        const docSnap = await getDoc(userInfoDocRef);
        if (docSnap.exists() && docSnap.data()?.name) { 
          const data = docSnap.data() as UserProfile;
          setBio(data.bio ?? '');
          setEditedBio(data.bio ?? '');
          setName(data.name ?? '');
          setEditedName(data.name ?? '');
          const imageUrl = data.profileImage ?? '';
          setProfileImage(imageUrl);
          setEditedImage(imageUrl);
          
          let orbitData = data.orbitInfo || [];
          if (orbitData.length === 0) {
            orbitData = [
              { id: 'location', icon: 'MapPin', title: 'Байршил', content: '', type: 'info' },
              { id: 'hobbies', icon: 'Gamepad2', title: 'Хобби', content: '', type: 'info' },
              { id: 'goals', icon: 'Target', title: 'Зорилго', content: '', type: 'info' },
              { id: 'user', icon: 'User', title: 'Тухай', content: '', type: 'info' },
              { id: 'song', icon: 'Music', title: 'Дуртай дуу', content: '', type: 'audio', youtubeVideoId: '' },
              { id: 'movie', icon: 'Film', title: 'Кино', content: '', type: 'info', backgroundImage: '' },
              { id: 'quote', icon: 'MessageSquareQuote', title: 'Ишлэл', content: '', type: 'info' },
              { id: 'likes', icon: 'Heart', title: 'Дуртай зүйлс', content: '', type: 'info' },
            ];
            await updateDoc(userInfoDocRef, { orbitInfo: orbitData });
          }
          setOrbitInfo(orbitData);
          
          const links = {
            github: data.github || "",
            instagram: data.instagram || "",
            email: data.email || "",
            cvUrl: data.cvUrl || "",
            facebook: data.facebook || ''
          };
          setSocialLinks(links);
          setEditedLinks(links);

        } else {
          const avatarPlaceholder = PlaceHolderImages.find(p => p.id === 'avatar');
          const homeHeroPlaceholder = PlaceHolderImages.find(p => p.id === 'home-hero-background');
          const aboutHeroPlaceholder = PlaceHolderImages.find(p => p.id === 'about-hero-background');
          const toolsHeroPlaceholder = PlaceHolderImages.find(p => p.id === 'tools-hero-background');
          
          const defaultName = "";
          const defaultBio = "";
          const defaultProfileImage = avatarPlaceholder?.imageUrl || "https://picsum.photos/seed/avatar/400/400";
          const defaultHomeHeroImage = homeHeroPlaceholder?.imageUrl;
          const defaultAboutHeroImage = aboutHeroPlaceholder?.imageUrl;
          const defaultToolsHeroImage = toolsHeroPlaceholder?.imageUrl;

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
          const defaultLinks = {
            github: "",
            instagram: "",
            email: "",
            cvUrl: '',
            facebook: "",
          };
          const defaultData: UserProfile = {
            name: defaultName,
            bio: defaultBio,
            profileImage: defaultProfileImage,
            homeHeroImage: defaultHomeHeroImage,
            aboutHeroImage: defaultAboutHeroImage,
            toolsHeroImage: defaultToolsHeroImage,
            orbitInfo: defaultOrbitInfo,
            ...defaultLinks
          };
          await setDoc(userInfoDocRef, defaultData, { merge: true });
          
          setBio(defaultBio);
          setEditedBio(defaultBio);
          setName(defaultName);
          setEditedName(defaultName);
          setProfileImage(defaultProfileImage);
          setEditedImage(defaultProfileImage);
          setOrbitInfo(defaultOrbitInfo);
          setSocialLinks(defaultLinks);
          setEditedLinks(defaultLinks);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast({ title: "Алдаа", description: "Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [user, isUserLoading, firestore, toast]);

    const handleSaveLinks = async () => {
        if (!user || !firestore) return;
        const userInfoDocRef = doc(firestore, "users", user.uid);
        setSaving(true);
        try {
            await updateDoc(userInfoDocRef, { 
                github: editedLinks.github,
                instagram: editedLinks.instagram,
                email: editedLinks.email,
                cvUrl: editedLinks.cvUrl,
                facebook: editedLinks.facebook,
            });
            setSocialLinks(editedLinks);
            setIsEditingLinks(false);
            toast({ title: "Амжилттай", description: "Холбоосууд шинэчлэгдлээ." });
        } catch (error) {
            console.error("Error updating links:", error);
            toast({ title: "Алдаа", description: "Холбоос шинэчлэхэд алдаа гарлаа.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

  const handleSaveOrbitInfo = async () => {
    if (!user || !firestore || !selectedOrbit) return;
    const userInfoDocRef = doc(firestore, "users", user.uid);

    setSaving(true);
    
    let updatedItem: OrbitInfo = { 
        ...selectedOrbit,
        title: editedOrbitTitle,
        icon: editedOrbitIcon,
        content: editedOrbitContent 
    };
    
    if (selectedOrbit.type === 'audio') {
        const videoId = getYoutubeVideoId(editedYoutubeUrl);
        if (editedYoutubeUrl && !videoId) {
            toast({
                title: "Алдаа",
                description: "YouTube холбоос буруу байна.",
                variant: "destructive"
            });
            setSaving(false);
            return;
        }
        updatedItem = { ...updatedItem, youtubeVideoId: videoId || undefined, backgroundImage: editedOrbitBgImage };
    } else {
        updatedItem = { ...updatedItem, backgroundImage: editedOrbitBgImage };
    }

    try {
        const newOrbitInfo = orbitInfo.map(item => 
          item.id === selectedOrbit.id ? updatedItem : item
        );

        await updateDoc(userInfoDocRef, { orbitInfo: newOrbitInfo });
        setOrbitInfo(newOrbitInfo);
        setSelectedOrbit(updatedItem);
        setIsEditingOrbit(false);
        toast({ title: "Амжилттай", description: "Мэдээлэл шинэчлэгдлээ." });
    } catch (error) {
      console.error("Error updating orbit info:", error);
      toast({ title: "Алдаа", description: "Мэдээлэл шинэчлэхэд алдаа гарлаа.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveImage = async () => {
    if (!user || !firestore) return;
    const userInfoDocRef = doc(firestore, "users", user.uid);
    setSaving(true);
    try {
      await updateDoc(userInfoDocRef, { profileImage: editedImage });
      setProfileImage(editedImage);
      setIsEditingImage(false);
      toast({ title: "Амжилттай", description: "Профайл зураг шинэчлэгдлээ." });
    } catch (error) {
      console.error("Error updating image:", error);
      toast({ title: "Алдаа", description: "Зураг шинэчлэхэд алдаа гарлаа.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!user || !firestore) return;
    const userInfoDocRef = doc(firestore, "users", user.uid);
    setSaving(true);
    try {
      await updateDoc(userInfoDocRef, { name: editedName });
      setName(editedName);
      setIsEditingName(false);
      toast({
        title: "Амжилттай",
        description: "Таны нэр шинэчлэгдлээ.",
      });
    } catch (error) {
      console.error("Error updating name:", error);
      toast({ title: "Алдаа", description: "Нэр шинэчлэхэд алдаа гарлаа.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBio = async () => {
    if (!user || !firestore) return;
    const userInfoDocRef = doc(firestore, "users", user.uid);
    setSaving(true);
    try {
      await updateDoc(userInfoDocRef, { bio: editedBio });
      setBio(editedBio);
      setIsEditingBio(false);
      toast({
        title: "Амжилттай",
        description: "Таны танилцуулга шинэчлэгдлээ.",
      });
    } catch (error) {
      console.error("Error updating bio:", error);
      toast({ title: "Алдаа", description: "Танилцуулга шинэчлэхэд алдаа гарлаа.", variant: "destructive" });
    } finally {
        setSaving(false);
    }
  };

  const handleCancelEditBio = () => {
    setEditedBio(bio);
    setIsEditingBio(false);
  };

  const handleCancelEditName = () => {
    setEditedName(name);
    setIsEditingName(false);
  };
  
  if (loading) {
    return (
      <section id="home" className="w-full min-h-[calc(100vh-57px)] flex items-center justify-center">
        <div className="container px-4 md:px-6 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const handleOrbitItemClick = (item: OrbitInfo) => {
    if (selectedOrbit && selectedOrbit.id !== item.id) {
        setSelectedOrbit(null);
        setTimeout(() => {
            setSelectedOrbit(item);
            setEditedOrbitData(item);
        }, 800);
    } else if (selectedOrbit && selectedOrbit.id === item.id) {
        setSelectedOrbit(null);
    } else {
        setSelectedOrbit(item);
        setEditedOrbitData(item);
    }
    setIsEditingOrbit(false);
  };

  const setEditedOrbitData = (item: OrbitInfo) => {
    setEditedOrbitTitle(item.title);
    setEditedOrbitIcon(item.icon);
    setEditedOrbitContent(item.content);
    if(item.type === 'audio') {
        setEditedYoutubeUrl(item.youtubeVideoId ? `https://www.youtube.com/watch?v=${item.youtubeVideoId}` : '');
         setEditedOrbitBgImage(item.backgroundImage || "");
    } else {
        setEditedOrbitBgImage(item.backgroundImage || "");
    }
  }
  
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode) {
      setIsEditingOrbit(true);
    }
  };

  const handleCloseContent = () => {
    if (!isEditingOrbit) {
      setSelectedOrbit(null);
    }
  };

  const socialButtons: SocialInfo[] = ([
    { type: 'github' as SocialLinkType, url: socialLinks.github, icon: <Github className="h-5 w-5" />, name: 'GitHub' },
    { type: 'instagram' as SocialLinkType, url: socialLinks.instagram, icon: <Instagram className="h-5 w-5" />, name: 'Instagram' },
    { type: 'facebook' as SocialLinkType, url: socialLinks.facebook, icon: <Facebook className="h-5 w-5" />, name: 'Facebook' },
    { type: 'email' as SocialLinkType, url: socialLinks.email, icon: <Mail className="h-5 w-5" />, name: 'Email' }
  ] as SocialInfo[]).filter(link => link.url);

  return (
     <section id="home" className="relative w-full flex items-center min-h-[calc(100vh-200px)] py-12 overflow-hidden">
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid items-center justify-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col justify-center space-y-6 lg:order-2">
            <div className="relative flex items-center justify-center w-full max-w-[300px] sm:max-w-[500px] aspect-square mx-auto">
             <div className={cn("relative transition-all duration-500 [transform-style:preserve-3d]", isEditingOrbit ? "w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] md:w-[480px] md:h-[480px]" : "w-56 h-56 sm:w-80 sm:h-80 md:w-96 md:h-96")}>
                <AnimatePresence>
                    {selectedOrbit ? (
                        <motion.div
                            key="orbit-content"
                            initial={{ rotateY: -180, opacity: 0, scale: 0.8 }}
                            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                            exit={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-full border-4 border-primary shadow-lg text-center overflow-hidden [transform-style:preserve-3d]"
                            onClick={handleCloseContent}
                        >
                           {selectedOrbit.backgroundImage && !isEditingOrbit && (
                              <>
                                <Image
                                    src={selectedOrbit.backgroundImage}
                                    alt={selectedOrbit.title}
                                    fill
                                    className="object-cover rounded-full z-0 opacity-50"
                                />
                                 <div className="absolute inset-0 z-10" />
                              </>
                           )}
                           
                            <AnimatePresence mode="wait">
                                {isEditingOrbit ? (
                                    <motion.div
                                        key="edit"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="w-full h-full flex flex-col justify-center items-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="w-full max-w-xs mx-auto p-6 space-y-2">
                                            <div>
                                                <Label className="text-center text-xs mb-1 block text-foreground">Нэр</Label>
                                                <Input
                                                    value={editedOrbitTitle}
                                                    onChange={(e) => setEditedOrbitTitle(e.target.value)}
                                                    className="h-8 text-sm w-full bg-transparent border-primary/50 focus-visible:ring-primary text-foreground text-center"
                                                    placeholder="Нэр..."
                                                />
                                            </div>
                                            {selectedOrbit.type !== 'audio' && (
                                                <div className="space-y-2">
                                                    <Label className="text-center text-xs mb-1 block text-foreground">Icon</Label>
                                                    <IconPicker 
                                                        selectedIcon={editedOrbitIcon} 
                                                        onIconSelect={setEditedOrbitIcon}
                                                    >
                                                        <Button type="button" variant="outline" className="w-full h-8 text-sm justify-center gap-2 bg-transparent border-primary/50 focus:ring-primary text-foreground">
                                                            {getIcon(editedOrbitIcon, {className: "h-4 w-4"})}
                                                            <span>{editedOrbitIcon}</span>
                                                        </Button>
                                                    </IconPicker>
                                                </div>
                                            )}
                                            <div>
                                                <Label className="text-center text-xs mb-1 block text-foreground">Тайлбар</Label>
                                                <Textarea 
                                                    value={editedOrbitContent}
                                                    onChange={(e) => setEditedOrbitContent(e.target.value)}
                                                    className="text-sm bg-transparent border-primary/50 focus-visible:ring-primary text-foreground"
                                                    rows={2}
                                                    placeholder="Тайлбар..."
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label className="text-center text-xs mb-1 block text-foreground">Арын зураг URL</Label>
                                                <Input
                                                    value={editedOrbitBgImage}
                                                    onChange={(e) => setEditedOrbitBgImage(e.target.value)}
                                                    className="h-8 text-sm bg-transparent border-primary/50 focus-visible:ring-primary text-foreground text-center"
                                                    placeholder="https://example.com/image.png"
                                                />
                                            </div>
                                            {selectedOrbit.type === 'audio' && (
                                                <div>
                                                    <Label className="text-center text-xs mb-1 block text-foreground">YouTube холбоос</Label>
                                                    <Input
                                                        value={editedYoutubeUrl}
                                                        onChange={(e) => setEditedYoutubeUrl(e.target.value)}
                                                        className="h-8 text-sm bg-transparent border-primary/50 focus-visible:ring-primary text-foreground text-center"
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                    />
                                                </div>
                                            )}
                                            <div className="flex gap-2 justify-center pt-1">
                                                <Button onClick={handleSaveOrbitInfo} size="icon" className="h-8 w-8" disabled={saving}>
                                                    {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
                                                </Button>
                                                <Button onClick={() => setIsEditingOrbit(false)} size="icon" variant="ghost" className="h-8 w-8">
                                                    <XCircle className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="view" 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative w-full cursor-pointer z-20 p-4 flex flex-col items-center justify-center text-center" onClick={handleContentClick}>
                                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-primary">{selectedOrbit.title}</h3>
                                         <p className="text-sm md:text-lg text-foreground">{selectedOrbit.content}</p>
                                        
                                        {selectedOrbit.type === 'audio' && selectedOrbit.youtubeVideoId && (
                                            <Button variant="ghost" size="icon" className="mt-4 h-12 w-12" onClick={(e) => { e.stopPropagation(); setIsPlayerOpen(true); }}>
                                                <PlayCircle className="h-10 w-10 text-primary" />
                                            </Button>
                                        )}

                                        {isEditMode && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 z-30 text-primary hover:text-primary/80"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="avatar"
                            initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                            exit={{ rotateY: -180, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="relative w-full h-full group [transform-style:preserve-3d]"
                        >
                           <div className="avatar-glow-wrapper w-full h-full">
                                <Avatar className="w-full h-full border-4 border-background">
                                    <AvatarImage src={profileImage} alt={name} />
                                    <AvatarFallback>{name?.charAt(0) || 'K'}</AvatarFallback>
                                </Avatar>
                            </div>
                            {isEditMode && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                     <Button 
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsEditingImage(true)}
                                        className="h-12 w-12 rounded-full z-10 bg-background/50 backdrop-blur-sm"
                                    >
                                        <Upload className="h-5 w-5" />
                                        <span className="sr-only">Зураг солих</span>
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                {orbitInfo.map((item, index) => (
                   <OrbitItem 
                     key={item.id}
                     item={item}
                     index={index}
                     total={orbitInfo.length}
                     selectedOrbit={selectedOrbit}
                     onItemClick={handleOrbitItemClick}
                     isEditing={!!selectedOrbit && isEditingOrbit}
                   />
                ))}
                
            </div>
            </div>
          </div>
           <div className="flex flex-col items-center lg:items-start justify-center space-y-6 text-center lg:text-left lg:order-1">
            <div className="space-y-5">
              {/* Role badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Програм хангамжийн инженер
                </span>
              </motion.div>

              {/* Greeting and Name */}
              <div className="relative">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-3xl sm:text-4xl font-bold tracking-tighter xl:text-6xl/none h-auto p-0 border-0 focus-visible:ring-0 bg-transparent"
                    />
                    <Button onClick={handleSaveName} size="icon" className="h-8 w-8" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4" />}
                    </Button>
                    <Button onClick={handleCancelEditName} size="icon" variant="ghost" className="h-8 w-8">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <motion.div 
                    className="flex flex-col gap-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <span className="text-2xl sm:text-3xl font-medium text-muted-foreground">
                      Сайн уу, Би
                    </span>
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight">
                        <span className="text-primary">
                          {name}
                        </span>
                      </h1>
                      {isEditMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setIsEditingName(true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bio with pipe separators */}
              <div className="relative">
                {isEditingBio ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      className="max-w-[600px] text-lg md:text-xl bg-muted/50"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveBio} size="sm" disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} Хадгалах
                      </Button>
                      <Button onClick={handleCancelEditBio} size="sm" variant="ghost">
                        <XCircle className="mr-2 h-4 w-4" /> Цуцлах
                      </Button>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <p className="max-w-[650px] text-muted-foreground text-base md:text-lg leading-relaxed">
                      <span className="text-foreground font-medium">Fullstack хөгжүүлэгч</span>
                      <span className="mx-2 text-primary">|</span>
                      <span>{bio}</span>
                    </p>
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setIsEditingBio(true)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Танилцуулга засах</span>
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="relative pt-2">
                {isEditingLinks ? (
                    <div className="space-y-3 max-w-sm">
                        <div className="flex items-center gap-2">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <Input 
                                value={editedLinks.cvUrl} 
                                onChange={(e) => setEditedLinks({...editedLinks, cvUrl: e.target.value})}
                                placeholder="CV-ний холбоос оруулах"
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Github className="h-6 w-6 text-muted-foreground" />
                            <Input 
                                value={editedLinks.github} 
                                onChange={(e) => setEditedLinks({...editedLinks, github: e.target.value})}
                                placeholder="GitHub URL"
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Instagram className="h-6 w-6 text-muted-foreground" />
                            <Input 
                                value={editedLinks.instagram} 
                                onChange={(e) => setEditedLinks({...editedLinks, instagram: e.target.value})}
                                placeholder="Instagram URL"
                                className="h-8 text-sm"
                            />
                        </div>
                         <div className="flex items-center gap-2">
                            <Facebook className="h-6 w-6 text-muted-foreground" />
                            <Input 
                                value={editedLinks.facebook} 
                                onChange={(e) => setEditedLinks({...editedLinks, facebook: e.target.value})}
                                placeholder="Facebook URL"
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-6 w-6 text-muted-foreground" />
                            <Input 
                                value={editedLinks.email} 
                                onChange={(e) => setEditedLinks({...editedLinks, email: e.target.value})}
                                placeholder="Email address"
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleSaveLinks} size="sm" disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} Хадгалах
                            </Button>
                            <Button onClick={() => setIsEditingLinks(false)} size="sm" variant="ghost">
                                <XCircle className="mr-2 h-4 w-4" /> Цуцлах
                            </Button>
                        </div>
                    </div>
                ) : (
                   <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                        {socialLinks.cvUrl && (
                        <Button asChild variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-transform hover:scale-105">
                            <Link href={socialLinks.cvUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            CV татах
                            </Link>
                        </Button>
                        )}
                        <Dialog>
                            <div className="flex items-center gap-2">
                                {socialButtons.map((social) => (
                                    <DialogTrigger key={social.type} asChild>
                                        <Button 
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                            onClick={() => { setSelectedSocial(social); setIsQrLoading(true); }}
                                        >
                                            {social.icon}
                                        </Button>
                                    </DialogTrigger>
                                ))}
                            </div>
                            <DialogContent className="sm:max-w-[425px]">
                                {selectedSocial && (
                                <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">{selectedSocial.icon} {selectedSocial.name}</DialogTitle>
                                    <DialogDescription>
                                        QR кодыг уншуулж эсвэл "Үзэх" товчийг дарж холбогдоно уу.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center justify-center py-4">
                                     <div className="p-2 bg-white rounded-lg relative w-[200px] h-[200px]">
                                        {isQrLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                          <Image
                                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedSocial.type === 'email' ? `mailto:${selectedSocial.url}` : selectedSocial.url}`}
                                              alt={`${selectedSocial.name} QR Code`}
                                              width={200}
                                              height={200}
                                              onLoad={() => setIsQrLoading(false)}
                                              className={cn(isQrLoading && "opacity-0")}
                                          />
                                     </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                            Хаах
                                        </Button>
                                    </DialogClose>
                                    {selectedSocial.type !== 'email' && (
                                        <Button asChild>
                                            <a href={selectedSocial.url} target="_blank" rel="noopener noreferrer">
                                            Үзэх
                                            </a>
                                        </Button>
                                    )}
                                </DialogFooter>
                                </>
                                )}
                            </DialogContent>
                        </Dialog>
                         {isEditMode && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setIsEditingLinks(true)}
                            >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Холбоос засах</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditingImage} onOpenChange={setIsEditingImage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Профайл зургийн холбоос</DialogTitle>
            <DialogDescription>
              Шинэ зургийнхаа URL хаягийг энд буулгана уу. Base64 форматтай зураг байж болно.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image-url" className="text-right">
                URL
              </Label>
              <Input
                id="image-url"
                value={editedImage}
                onChange={(e) => setEditedImage(e.target.value)}
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
               {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogContent className="sm:max-w-2xl bg-black/50 backdrop-blur-lg border-primary/30 p-1.5">
             <DialogHeader className="sr-only">
                <DialogTitle>{selectedOrbit?.title}</DialogTitle>
                <DialogDescription>Playing: {selectedOrbit?.content}</DialogDescription>
             </DialogHeader>
             {selectedOrbit?.type === 'audio' && selectedOrbit.youtubeVideoId && (
                 <iframe
                    className="w-full aspect-video rounded-md"
                    src={`https://www.youtube.com/embed/${selectedOrbit.youtubeVideoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            )}
          </DialogContent>
       </Dialog>
    </section>
  );
}
