"use client";

import Link from "next/link";
import * as Icons from 'lucide-react';
import { useState, useEffect, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { OrbitInfo } from "@/lib/types";
import { useEditMode } from "@/contexts/EditModeContext";
import Image from "next/image";
import { useFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { initialOrbitInfo as dataOrbitInfo } from "@/lib/data";

const { Github, Instagram, Mail, Edit, Save, XCircle, Loader2, LinkIcon, AlertTriangle, Pencil, Upload } = Icons;

const staticPersonalInfo = {
    name: "Б.Батмягмар",
    bio: "IT инженерийн чиглэлээр суралцаж буй оюутан, програмчлал, вэб хөгжүүлэлт, машин сургалт сонирхдог. Ирээдүйд програм хангамжийн инженер болно.",
    github: "https://github.com/batmyagmar",
    instagram: "https://instagram.com/batmyagmar",
    email: "batmyagmar.b@gmail.com",
};

const defaultProfileImage = "https://images.unsplash.com/photo-1607878111648-75872a0a0736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxwb3J0cmFpdCUyMHBlcnNvbnxlbnwwfHx8fDE3NjU1Mjc1NTN8MA&ixlib=rb-4.1.0&q=80&w=1080";

const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6 text-destructive" />;
};

interface OrbitItemProps {
  item: OrbitInfo;
  index: number;
  total: number;
  selectedOrbit: OrbitInfo | null;
  onItemClick: (item: OrbitInfo) => void;
}

const OrbitItem: FC<OrbitItemProps> = ({ item, index, total, selectedOrbit, onItemClick }) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 150;
    const mdRadius = 190;
    const [currentRadius, setCurrentRadius] = useState(radius);

    useEffect(() => {
        const updateRadius = () => {
            setCurrentRadius(window.innerWidth < 768 ? radius : mdRadius);
        };
        window.addEventListener('resize', updateRadius);
        updateRadius();
        return () => window.removeEventListener('resize', updateRadius);
    }, []);

    const xPos = Math.cos(angle) * currentRadius;
    const yPos = Math.sin(angle) * currentRadius;

    return (
        <motion.div
            key={item.id}
            className="absolute"
            style={{
                top: '50%',
                left: '50%',
                x: `${xPos}px`,
                y: `${yPos}px`,
                translateX: '-50%',
                translateY: '-50%',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: 1,
                scale: 1,
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
  const { firestore, user } = useFirebase();
  const [profileImage, setProfileImage] = useState<string>('');
  const [bio, setBio] = useState(staticPersonalInfo.bio);
  const [name, setName] = useState(staticPersonalInfo.name);
  const [orbitInfo, setOrbitInfo] = useState<OrbitInfo[]>(dataOrbitInfo);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(bio);
  
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editedImage, setEditedImage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitInfo | null>(null);
  const [isEditingOrbit, setIsEditingOrbit] = useState(false);
  const [editedOrbitContent, setEditedOrbitContent] = useState("");
  const [editedOrbitBgImage, setEditedOrbitBgImage] = useState("");
  const [editedYoutubeUrl, setEditedYoutubeUrl] = useState("");
  
  const { toast } = useToast();
  
  const userInfoDocRef = user ? doc(firestore, "userInfo", user.uid) : null;

  useEffect(() => {
    if (!userInfoDocRef) {
        if (!user) { // Not logged in, use static data
            setBio(staticPersonalInfo.bio);
            setEditedBio(staticPersonalInfo.bio);
            setName(staticPersonalInfo.name);
            setProfileImage(defaultProfileImage);
            setEditedImage(defaultProfileImage);
            setOrbitInfo(dataOrbitInfo);
            setLoading(false);
        }
        return;
    };
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(userInfoDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBio(data.bio || staticPersonalInfo.bio);
          setEditedBio(data.bio || staticPersonalInfo.bio);
          setName(data.name || staticPersonalInfo.name);
          const imageUrl = data.profileImage || defaultProfileImage;
          setProfileImage(imageUrl);
          setEditedImage(imageUrl);
          
          const fetchedOrbitInfo = (data.orbitInfo || dataOrbitInfo).map((item: any) => {
            if (item.id === 'song' && !item.type) {
              return { ...item, type: 'audio' };
            }
            if (!item.type) {
              return { ...item, type: 'info' };
            }
            return item;
          });

          setOrbitInfo(fetchedOrbitInfo);
        } else {
          setDocumentNonBlocking(userInfoDocRef, {
            name: staticPersonalInfo.name,
            bio: staticPersonalInfo.bio,
            profileImage: defaultProfileImage,
            orbitInfo: dataOrbitInfo
          }, { merge: false });
          setBio(staticPersonalInfo.bio);
          setEditedBio(staticPersonalInfo.bio);
          setName(staticPersonalInfo.name);
          setProfileImage(defaultProfileImage);
          setEditedImage(defaultProfileImage);
          setOrbitInfo(dataOrbitInfo);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast({ title: "Алдаа", description: "Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа. Офлайн горимд ажиллаж байна.", variant: "destructive" });
        setBio(staticPersonalInfo.bio);
        setEditedBio(staticPersonalInfo.bio);
        setName(staticPersonalInfo.name);
        setProfileImage(defaultProfileImage);
        setEditedImage(defaultProfileImage);
        setOrbitInfo(dataOrbitInfo);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore]);

  const handleSaveOrbitInfo = async () => {
    if (!selectedOrbit || !userInfoDocRef) return;
    setSaving(true);
    
    let updatedItem: OrbitInfo = { ...selectedOrbit, content: editedOrbitContent };
    
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

        updateDocumentNonBlocking(userInfoDocRef, { orbitInfo: newOrbitInfo });
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
    if (!userInfoDocRef) return;
    setSaving(true);
    try {
      updateDocumentNonBlocking(userInfoDocRef, { profileImage: editedImage });
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
    if (!userInfoDocRef) return;
    setSaving(true);
    try {
      updateDocumentNonBlocking(userInfoDocRef, { bio: editedBio });
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
    } else {
        setSelectedOrbit(item);
        setEditedOrbitContent(item.content);
        if(item.type === 'audio') {
            setEditedYoutubeUrl(item.youtubeVideoId ? `https://www.youtube.com/watch?v=${'item.youtubeVideoId'}` : '');
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
                  <>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                      {bio}
                    </p>
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-12 h-8 w-8"
                        onClick={() => setIsEditingBio(true)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Танилцуулга засах</span>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <Link href={staticPersonalInfo.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
              <Link href={staticPersonalInfo.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
              <Link href={`mailto:${'staticPersonalInfo.email'}`} aria-label="Email">
                <Mail className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
            </div>
          </div>
          <div className="relative flex items-center justify-center w-full max-w-[400px] aspect-square mx-auto">
             <div className="relative w-64 h-64 md:w-80 md:h-80">
                <AnimatePresence>
                    {selectedOrbit ? (
                        <motion.div
                            key="orbit-content"
                            initial={{ rotateY: -180, opacity: 0, scale: 0.8 }}
                            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                            exit={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-full border-4 border-primary shadow-lg p-6 text-center overflow-hidden"
                            onClick={handleCloseContent}
                        >
                           {selectedOrbit.type !== 'audio' && selectedOrbit.backgroundImage && (
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
                                    <motion.div key="edit" className="w-full z-20 space-y-2" onClick={(e) => e.stopPropagation()}>
                                        <h3 className="font-headline text-2xl font-bold text-primary">{selectedOrbit.title}</h3>
                                        <Textarea 
                                            value={editedOrbitContent}
                                            onChange={(e) => setEditedOrbitContent(e.target.value)}
                                            className={cn("text-base bg-transparent border-primary/50 focus-visible:ring-primary", selectedOrbit.type !== 'audio' && "text-white")}
                                            rows={2}
                                            placeholder="Тайлбар..."
                                        />
                                        {selectedOrbit.type === 'audio' ? (
                                             <div>
                                                <Label className={cn(selectedOrbit.type === 'audio' && 'text-foreground')}>YouTube холбоос</Label>
                                                <Input
                                                  value={editedYoutubeUrl}
                                                  onChange={(e) => setEditedYoutubeUrl(e.target.value)}
                                                  className={cn("text-base bg-transparent border-primary/50 focus-visible:ring-primary mt-1 text-foreground")}
                                                  placeholder="https://www.youtube.com/watch?v=..."
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <Label className={cn(selectedOrbit.type !== 'audio' && 'text-white')}>Арын зураг URL</Label>
                                                <Input
                                                  value={editedOrbitBgImage}
                                                  onChange={(e) => setEditedOrbitBgImage(e.target.value)}
                                                  className={cn("text-base bg-transparent border-primary/50 focus-visible:ring-primary mt-1", selectedOrbit.type !== 'audio' && 'text-white')}
                                                  placeholder="https://example.com/image.png"
                                                />
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-2 justify-center">
                                            <Button onClick={handleSaveOrbitInfo} size="sm" disabled={saving}>
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
                                            </Button>
                                            <Button onClick={() => setIsEditingOrbit(false)} size="sm" variant="ghost">
                                                <XCircle className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="view" className="relative w-full cursor-pointer z-20" onClick={handleContentClick}>
                                        <h3 className="font-headline text-2xl font-bold mb-2 text-primary">{selectedOrbit.title}</h3>
                                        {selectedOrbit.type === 'audio' ? (
                                            selectedOrbit.youtubeVideoId ? (
                                                <div className="w-full aspect-video rounded-lg overflow-hidden">
                                                      <iframe
                                                        className="w-full h-full"
                                                        src={`https://www.youtube.com/embed/${'selectedOrbit.youtubeVideoId'}`}
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
                                                className={cn("absolute -top-2 -right-2 h-8 w-8 text-muted-foreground", selectedOrbit.type !== 'audio' && "hover:text-white")}
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
                            className="absolute inset-0 flex items-center justify-center"
                        >
                             <div className="avatar-glow-wrapper w-48 h-48 md:w-56 md:h-56">
                                <Avatar className="w-full h-full border-4 border-primary/50 relative">
                                    <AvatarImage src={profileImage} alt={name} />
                                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                     {isEditMode && (
                                        <button 
                                            onClick={() => setIsEditingImage(true)}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                                        >
                                            <Upload className="h-8 w-8" />
                                        </button>
                                    )}
                                </Avatar>
                            </div>
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
                     onItemClick={orbitItemClick}
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
