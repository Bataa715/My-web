

"use client";

import Link from "next/link";
import { Github, Instagram, Mail, Edit, Save, XCircle, Loader2, AlertTriangle, Pencil, Upload, User, Heart, Target, MessageSquareQuote, Film, Music, Gamepad2, MapPin, BrainCircuit } from 'lucide-react';
import { useState, useEffect, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { OrbitInfo, UserProfile } from "@/lib/types";
import { useEditMode } from "@/contexts/EditModeContext";
import Image from "next/image";
import { useFirebase } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import IconPicker from "../shared/IconPicker";

const getIcon = (iconName: string, props = {}) => {
    // Add BrainCircuit as a special case if the user had 'brain'
    if (iconName === 'brain' || iconName === 'Brain') return <BrainCircuit className="h-6 w-6" {...props} />;
    
    const LucideIcon = (require('lucide-react') as any)[iconName];
    return LucideIcon ? <LucideIcon className="h-6 w-6" {...props} /> : <AlertTriangle className="h-6 w-6 text-destructive" {...props} />;
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
    
    const baseRadius = 160;
    const mdBaseRadius = 180;
    const editingRadius = 190;
    const mdEditingRadius = 210;

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
            className="absolute"
            style={{
                top: '50%',
                left: '50%',
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
                    "rounded-full h-14 w-14 border-2 border-primary/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary hover:bg-accent/50 hover:scale-110",
                    selectedOrbit?.id === item.id && "bg-accent border-accent-foreground scale-110"
                )}
                onClick={() => onItemClick(item)}
            >
                {getIcon(item.icon)}
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

export default function Hero() {
  const { isEditMode } = useEditMode();
  const { firestore, user, isUserLoading } = useFirebase();
  const [profileImage, setProfileImage] = useState<string>('');
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [orbitInfo, setOrbitInfo] = useState<OrbitInfo[]>([]);
  const [socialLinks, setSocialLinks] = useState({ github: '', instagram: '', email: '' });

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
  const [editedLinks, setEditedLinks] = useState({ github: '', instagram: '', email: '' });
  
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
        if (docSnap.exists() && docSnap.data().name) { 
          const data = docSnap.data() as UserProfile;
          setBio(data.bio || '');
          setEditedBio(data.bio || '');
          setName(data.name || '');
          const imageUrl = data.profileImage || '';
          setProfileImage(imageUrl);
          setEditedImage(imageUrl);
          setOrbitInfo(data.orbitInfo || []);
          const links = {
            github: data.github || "https://github.com/Bataa715",
            instagram: data.instagram || "https://www.instagram.com/ka1__zen/",
            email: data.email || "batmyagmar715@gmail.com",
          };
          setSocialLinks(links);
          setEditedLinks(links);

        } else {
          const avatarPlaceholder = PlaceHolderImages.find(p => p.id === 'avatar');
          const defaultName = "Б.Батмягмар";
          const defaultBio = "IT инженерийн чиглэлээр суралцаж буй оюутан, програмчлал, вэб хөгжүүлэлт, машин сургалт сонирхдог. Ирээдүйд програм хангамжийн инженер болно.";
          const defaultProfileImage = avatarPlaceholder?.imageUrl || "https://picsum.photos/seed/avatar/400/400";
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
            email: "batmyagmar715@gmail.com",
          };
          const defaultData: UserProfile = {
            name: defaultName,
            bio: defaultBio,
            profileImage: defaultProfileImage,
            orbitInfo: defaultOrbitInfo,
            ...defaultLinks
          };
          await setDoc(userInfoDocRef, defaultData, { merge: true });
          
          setBio(defaultBio);
          setEditedBio(defaultBio);
          setName(defaultName);
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
        updatedItem = { ...updatedItem, youtubeVideoId: videoId || undefined };
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
  
  if (loading) {
    return (
      <section id="home" className="w-full min-h-[calc(100vh-57px)] flex items-center justify-center">
        <div className="container px-4 md:px-6 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const orbitItemClick = (item: OrbitInfo) => {
    if (selectedOrbit && selectedOrbit.id === item.id) {
        setSelectedOrbit(null);
        setIsEditingOrbit(false); 
    } else {
        setSelectedOrbit(item);
        setEditedOrbitTitle(item.title);
        setEditedOrbitIcon(item.icon);
        setEditedOrbitContent(item.content);
        if(item.type === 'audio') {
            setEditedYoutubeUrl(item.youtubeVideoId ? `https://www.youtube.com/watch?v=${item.youtubeVideoId}` : '');
        } else {
            setEditedOrbitBgImage(item.backgroundImage || "");
        }
        setIsEditingOrbit(false);
    }
  };
  
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


  return (
    <section id="home" className="w-full min-h-[calc(100vh-57px)] flex items-center">
      <div className="container px-4 md:px-6">
        <div className="grid items-center justify-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                {name}
              </h1>
              <div className="relative">
                {isEditingBio ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      className="max-w-[600px] md:text-xl bg-muted/50"
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
                  <div className="flex items-start gap-2">
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                      {bio}
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
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative pt-2">
                {isEditingLinks ? (
                    <div className="space-y-3 max-w-sm">
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
                    <div className="flex items-center gap-4">
                        <Link href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <Github className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                        </Link>
                        <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <Instagram className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                        </Link>
                        <Link href={`mailto:${socialLinks.email}`} aria-label="Email">
                            <Mail className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                        </Link>
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
          <div className="relative flex items-center justify-center w-full max-w-[400px] aspect-square mx-auto">
             <div className={cn("relative transition-all duration-500", isEditingOrbit ? "w-[320px] h-[320px] md:w-[400px] md:h-[400px]" : "w-72 h-72 md:w-72 md:h-72")}>
                <AnimatePresence>
                    {selectedOrbit ? (
                        <motion.div
                            key="orbit-content"
                            initial={{ rotateY: -180, opacity: 0, scale: 0.8 }}
                            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                            exit={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-full border-4 border-primary shadow-lg text-center overflow-hidden"
                            onClick={handleCloseContent}
                        >
                           {selectedOrbit.type !== 'audio' && selectedOrbit.backgroundImage && !isEditingOrbit && (
                              <>
                                <Image
                                    src={selectedOrbit.backgroundImage}
                                    alt={selectedOrbit.title}
                                    fill
                                    objectFit="cover"
                                    className="z-0 opacity-20"
                                />
                                 <div className="absolute inset-0 bg-black/50 z-10" />
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
                                            {selectedOrbit.type === 'audio' ? (
                                                <div>
                                                    <Label className="text-center text-xs mb-1 block text-foreground">YouTube холбоос</Label>
                                                    <Input
                                                        value={editedYoutubeUrl}
                                                        onChange={(e) => setEditedYoutubeUrl(e.target.value)}
                                                        className="h-8 text-sm bg-transparent border-primary/50 focus-visible:ring-primary text-foreground text-center"
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <Label className="text-center text-xs mb-1 block text-foreground">Арын зураг URL</Label>
                                                    <Input
                                                        value={editedOrbitBgImage}
                                                        onChange={(e) => setEditedOrbitBgImage(e.target.value)}
                                                        className="h-8 text-sm bg-transparent border-primary/50 focus-visible:ring-primary text-foreground text-center"
                                                        placeholder="https://example.com/image.png"
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
                                        className="relative w-full cursor-pointer z-20 p-6" onClick={handleContentClick}>
                                        <h3 className="font-headline text-2xl font-bold mb-2 text-primary">{selectedOrbit.title}</h3>
                                        {selectedOrbit.type === 'audio' ? (
                                            selectedOrbit.youtubeVideoId ? (
                                                <div className="w-full aspect-video rounded-lg overflow-hidden">
                                                      <iframe
                                                        className="w-full h-full"
                                                        src={`https://www.youtube.com/embed/${selectedOrbit.youtubeVideoId}`}
                                                        title="YouTube video player"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            ) : (
                                                 <p className="text-lg text-foreground">{selectedOrbit.content}</p>
                                            )
                                        ) : (
                                            <p className="text-lg text-foreground">{selectedOrbit.content}</p>
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
                            className="relative w-full h-full"
                        >
                            <div className="avatar-glow-wrapper w-full h-full relative">
                                <Avatar className="w-full h-full border-4 border-primary/50">
                                    <AvatarImage src={profileImage} alt={name} />
                                    <AvatarFallback>{name?.charAt(0) || 'K'}</AvatarFallback>
                                </Avatar>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {isEditMode && !selectedOrbit && (
                    <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => setIsEditingImage(true)}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full z-30 bg-background/50 backdrop-blur-sm"
                    >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Зураг солих</span>
                    </Button>
                )}
                {orbitInfo.map((item, index) => (
                   <OrbitItem 
                     key={item.id}
                     item={item}
                     index={index}
                     total={orbitInfo.length}
                     selectedOrbit={selectedOrbit}
                     onItemClick={orbitItemClick}
                     isEditing={!!selectedOrbit && isEditingOrbit}
                   />
                ))}
                
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
    </section>
  );
}
