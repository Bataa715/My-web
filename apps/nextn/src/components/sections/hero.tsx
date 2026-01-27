'use client';

import Link from 'next/link';
import {
  Github,
  Instagram,
  Mail,
  Edit,
  Save,
  XCircle,
  Loader2,
  AlertTriangle,
  Pencil,
  Upload,
  User,
  Heart,
  Target,
  MessageSquareQuote,
  Film,
  Music,
  Gamepad2,
  MapPin,
  BrainCircuit,
  PlayCircle,
  Download,
  Facebook,
  Sparkles,
  Code2,
  Trash2,
} from 'lucide-react';
import { useState, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { OrbitInfo, UserProfile } from '@/lib/types';
import { useEditMode } from '@/contexts/EditModeContext';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import IconPicker from '../shared/IconPicker';
import { Skeleton } from '../ui/skeleton';

const getIcon = (iconName: string, props = {}) => {
  // Add BrainCircuit as a special case if the user had 'brain'
  if (iconName === 'brain' || iconName === 'Brain')
    return <BrainCircuit className="h-8 w-8" {...props} />;

  const LucideIcon = (require('lucide-react') as any)[iconName];
  return LucideIcon ? (
    <LucideIcon className="h-8 w-8" {...props} />
  ) : (
    <AlertTriangle className="h-8 w-8 text-destructive" {...props} />
  );
};

interface OrbitItemProps {
  item: OrbitInfo;
  index: number;
  total: number;
  selectedOrbit: OrbitInfo | null;
  onItemClick: (item: OrbitInfo) => void;
  isEditing: boolean;
}

const OrbitItem: FC<OrbitItemProps> = ({
  item,
  index,
  total,
  selectedOrbit,
  onItemClick,
  isEditing,
}) => {
  const angle = (index / total) * 2 * Math.PI;

  const baseRadius = 110; // Mobile radius
  const smBaseRadius = 150; // Small tablet
  const mdBaseRadius = 200; // Desktop
  const editingRadius = 130; // Mobile editing
  const smEditingRadius = 170; // Small tablet editing
  const mdEditingRadius = 230; // Desktop editing

  const [currentRadius, setCurrentRadius] = useState(baseRadius);

  useEffect(() => {
    const updateRadius = () => {
      const isMd = window.innerWidth >= 768;
      const isSm = window.innerWidth >= 640;
      if (isEditing) {
        setCurrentRadius(
          isMd ? mdEditingRadius : isSm ? smEditingRadius : editingRadius
        );
      } else {
        setCurrentRadius(
          isMd ? mdBaseRadius : isSm ? smBaseRadius : baseRadius
        );
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
      className="absolute h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 pointer-events-auto"
      style={{
        top: '50%',
        left: '50%',
        zIndex: 30,
      }}
      initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
      animate={{
        opacity: 1,
        scale: 1,
        x: `calc(-50% + ${xPos}px)`,
        y: `calc(-50% + ${yPos}px)`,
        rotate: -360, // Counter-rotate to keep icons upright
      }}
      transition={{
        opacity: { duration: 0.5, delay: 0.5 + index * 0.1 },
        scale: {
          duration: 0.5,
          delay: 0.5 + index * 0.1,
          type: 'spring',
          stiffness: 120,
        },
        x: {
          duration: 0.5,
          delay: 0.5 + index * 0.1,
          type: 'spring',
          stiffness: 120,
        },
        y: {
          duration: 0.5,
          delay: 0.5 + index * 0.1,
          type: 'spring',
          stiffness: 120,
        },
        rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative group">
        {/* Glowing ring on hover */}
        <div
          className={cn(
            'absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 blur-sm transition-opacity duration-300',
            'group-hover:opacity-70',
            selectedOrbit?.id === item.id &&
              'opacity-70 animate-[spin_3s_linear_infinite]'
          )}
        />

        <Button
          variant="outline"
          size="icon"
          className={cn(
            'relative rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 border border-primary/30 bg-background/80 backdrop-blur-md transition-all duration-300',
            'hover:bg-primary/20 hover:text-primary hover:border-primary/60',
            'group-hover:shadow-lg group-hover:shadow-primary/20',
            selectedOrbit?.id === item.id &&
              'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/40'
          )}
          onClick={() => onItemClick(item)}
        >
          {getIcon(item.icon, {
            className: 'h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5',
          })}
          <span className="sr-only">{item.title}</span>
        </Button>
      </div>
    </motion.div>
  );
};

const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  let videoId = null;
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
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

export default function Hero({
  portfolioUserId,
}: { portfolioUserId?: string } = {}) {
  const { isEditMode } = useEditMode();
  const { firestore, storage, user, isUserLoading } = useFirebase();
  const [profileImage, setProfileImage] = useState<string>('');
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [role, setRole] = useState('');
  const [orbitInfo, setOrbitInfo] = useState<OrbitInfo[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    instagram: '',
    email: '',
    cvUrl: '',
    facebook: '',
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [isEditingGreeting, setIsEditingGreeting] = useState(false);
  const [editedGreeting, setEditedGreeting] = useState('');
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editedRole, setEditedRole] = useState('');

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editedImage, setEditedImage] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedOrbit, setSelectedOrbit] = useState<OrbitInfo | null>(null);
  const [isEditingOrbit, setIsEditingOrbit] = useState(false);
  const [editedOrbitTitle, setEditedOrbitTitle] = useState('');
  const [editedOrbitIcon, setEditedOrbitIcon] = useState('');
  const [editedOrbitContent, setEditedOrbitContent] = useState('');
  const [editedOrbitBgImage, setEditedOrbitBgImage] = useState('');
  const [editedYoutubeUrl, setEditedYoutubeUrl] = useState('');
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [editedLinks, setEditedLinks] = useState({
    github: '',
    instagram: '',
    email: '',
    cvUrl: '',
    facebook: '',
  });
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<SocialInfo | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isUserLoading && !portfolioUserId) {
        setLoading(true);
        return;
      }

      // Use portfolioUserId if provided, otherwise use logged-in user
      const targetUserId = portfolioUserId || user?.uid;

      if (!targetUserId || !firestore) {
        setLoading(false);
        return;
      }

      const userInfoDocRef = doc(firestore, 'users', targetUserId);
      setLoading(true);
      try {
        const docSnap = await getDoc(userInfoDocRef);
        if (docSnap.exists() && docSnap.data()?.name) {
          const data = docSnap.data() as UserProfile;
          setBio(data.bio ?? '');
          setEditedBio(data.bio ?? '');
          setName(data.name ?? '');
          setEditedName(data.name ?? '');
          setGreeting(data.greeting ?? '');
          setRole(data.role ?? '');
          const imageUrl = data.profileImage ?? '';
          setProfileImage(imageUrl);
          setEditedImage(imageUrl);

          let orbitData = data.orbitInfo || [];
          if (orbitData.length === 0) {
            orbitData = [
              {
                id: 'location',
                icon: 'MapPin',
                title: 'Байршил',
                content: '',
                type: 'info',
              },
              {
                id: 'hobbies',
                icon: 'Gamepad2',
                title: 'Хобби',
                content: '',
                type: 'info',
              },
              {
                id: 'goals',
                icon: 'Target',
                title: 'Зорилго',
                content: '',
                type: 'info',
              },
              {
                id: 'user',
                icon: 'User',
                title: 'Тухай',
                content: '',
                type: 'info',
              },
              {
                id: 'song',
                icon: 'Music',
                title: 'Дуртай дуу',
                content: '',
                type: 'audio',
                youtubeVideoId: '',
              },
              {
                id: 'movie',
                icon: 'Film',
                title: 'Кино',
                content: '',
                type: 'info',
                backgroundImage: '',
              },
              {
                id: 'quote',
                icon: 'MessageSquareQuote',
                title: 'Ишлэл',
                content: '',
                type: 'info',
              },
              {
                id: 'likes',
                icon: 'Heart',
                title: 'Дуртай зүйлс',
                content: '',
                type: 'info',
              },
            ];
            await updateDoc(userInfoDocRef, { orbitInfo: orbitData });
          }
          setOrbitInfo(orbitData);

          const links = {
            github: data.github || '',
            instagram: data.instagram || '',
            email: data.email || '',
            cvUrl: data.cvUrl || '',
            facebook: data.facebook || '',
          };
          setSocialLinks(links);
          setEditedLinks(links);
        } else {
          const avatarPlaceholder = PlaceHolderImages.find(
            p => p.id === 'avatar'
          );
          const homeHeroPlaceholder = PlaceHolderImages.find(
            p => p.id === 'home-hero-background'
          );
          const aboutHeroPlaceholder = PlaceHolderImages.find(
            p => p.id === 'about-hero-background'
          );
          const toolsHeroPlaceholder = PlaceHolderImages.find(
            p => p.id === 'tools-hero-background'
          );

          const defaultName = '';
          const defaultBio = '';
          const defaultProfileImage =
            avatarPlaceholder?.imageUrl ||
            'https://picsum.photos/seed/avatar/400/400';
          const defaultHomeHeroImage = homeHeroPlaceholder?.imageUrl;
          const defaultAboutHeroImage = aboutHeroPlaceholder?.imageUrl;
          const defaultToolsHeroImage = toolsHeroPlaceholder?.imageUrl;

          const defaultOrbitInfo: OrbitInfo[] = [
            {
              id: 'location',
              icon: 'MapPin',
              title: 'Байршил',
              content: '',
              type: 'info',
            },
            {
              id: 'hobbies',
              icon: 'Gamepad2',
              title: 'Хобби',
              content: '',
              type: 'info',
            },
            {
              id: 'goals',
              icon: 'Target',
              title: 'Зорилго',
              content: '',
              type: 'info',
            },
            {
              id: 'user',
              icon: 'User',
              title: 'Тухай',
              content: '',
              type: 'info',
            },
            {
              id: 'song',
              icon: 'Music',
              title: 'Дуртай дуу',
              content: '',
              type: 'audio',
              youtubeVideoId: '',
            },
            {
              id: 'movie',
              icon: 'Film',
              title: 'Кино',
              content: '',
              type: 'info',
              backgroundImage: '',
            },
            {
              id: 'quote',
              icon: 'MessageSquareQuote',
              title: 'Ишлэл',
              content: '',
              type: 'info',
            },
            {
              id: 'likes',
              icon: 'Heart',
              title: 'Дуртай зүйлс',
              content: '',
              type: 'info',
            },
          ];
          const defaultLinks = {
            github: '',
            instagram: '',
            email: '',
            cvUrl: '',
            facebook: '',
          };
          const defaultGreeting = 'Энд мэндчилгээгээ оруулна уу';
          const defaultRole = 'Энд мэргэжлээ оруулна уу';
          const defaultData: UserProfile = {
            name: defaultName,
            bio: defaultBio,
            profileImage: defaultProfileImage,
            homeHeroImage: defaultHomeHeroImage,
            aboutHeroImage: defaultAboutHeroImage,
            toolsHeroImage: defaultToolsHeroImage,
            orbitInfo: defaultOrbitInfo,
            greeting: defaultGreeting,
            role: defaultRole,
            ...defaultLinks,
          };
          await setDoc(userInfoDocRef, defaultData, { merge: true });

          setBio(defaultBio);
          setEditedBio(defaultBio);
          setName(defaultName);
          setEditedName(defaultName);
          setGreeting(defaultGreeting);
          setRole(defaultRole);
          setProfileImage(defaultProfileImage);
          setEditedImage(defaultProfileImage);
          setOrbitInfo(defaultOrbitInfo);
          setSocialLinks(defaultLinks);
          setEditedLinks(defaultLinks);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        toast({
          title: 'Алдаа',
          description: 'Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading, firestore, portfolioUserId]);

  // PDF Upload handler
  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Алдаа',
        description: 'Зөвхөн PDF файл байршуулах боломжтой.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Алдаа',
        description: 'Файлын хэмжээ 10MB-с бага байх ёстой.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingCv(true);
    try {
      // Create storage reference
      const storageRef = ref(storage, `users/${user.uid}/cv/${file.name}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Update state
      setEditedLinks(prev => ({ ...prev, cvUrl: downloadUrl }));

      toast({
        title: 'Амжилттай',
        description: 'CV файл амжилттай байршуулагдлаа.',
      });
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast({
        title: 'Алдаа',
        description: 'CV файл байршуулахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleSaveLinks = async () => {
    if (!user || !firestore) return;
    const userInfoDocRef = doc(firestore, 'users', user.uid);
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
      toast({ title: 'Амжилттай', description: 'Холбоосууд шинэчлэгдлээ.' });
    } catch (error) {
      console.error('Error updating links:', error);
      toast({
        title: 'Алдаа',
        description: 'Холбоос шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrbitInfo = async () => {
    if (!user || !firestore || !selectedOrbit) return;
    const userInfoDocRef = doc(firestore, 'users', user.uid);

    setSaving(true);

    let updatedItem: OrbitInfo = {
      ...selectedOrbit,
      title: editedOrbitTitle,
      icon: editedOrbitIcon,
      content: editedOrbitContent,
    };

    if (selectedOrbit.type === 'audio') {
      const videoId = getYoutubeVideoId(editedYoutubeUrl);
      if (editedYoutubeUrl && !videoId) {
        toast({
          title: 'Алдаа',
          description: 'YouTube холбоос буруу байна.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
      updatedItem = {
        ...updatedItem,
        youtubeVideoId: videoId || undefined,
        backgroundImage: editedOrbitBgImage,
      };
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
      toast({ title: 'Амжилттай', description: 'Мэдээлэл шинэчлэгдлээ.' });
    } catch (error) {
      console.error('Error updating orbit info:', error);
      toast({
        title: 'Алдаа',
        description: 'Мэдээлэл шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveImage = async () => {
    if (!user || !firestore) return;
    const userInfoDocRef = doc(firestore, 'users', user.uid);
    setSaving(true);
    try {
      await updateDoc(userInfoDocRef, { profileImage: editedImage });
      setProfileImage(editedImage);
      setIsEditingImage(false);
      toast({ title: 'Амжилттай', description: 'Профайл зураг шинэчлэгдлээ.' });
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: 'Алдаа',
        description: 'Зураг шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!user || !firestore) return;
    const userInfoDocRef = doc(firestore, 'users', user.uid);
    setSaving(true);
    try {
      await updateDoc(userInfoDocRef, { name: editedName });
      setName(editedName);
      setIsEditingName(false);
      toast({
        title: 'Амжилттай',
        description: 'Таны нэр шинэчлэгдлээ.',
      });
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: 'Алдаа',
        description: 'Нэр шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBio = async () => {
    if (!user || !firestore) return;
    const userInfoDocRef = doc(firestore, 'users', user.uid);
    setSaving(true);
    try {
      await updateDoc(userInfoDocRef, { bio: editedBio });
      setBio(editedBio);
      setIsEditingBio(false);
      toast({
        title: 'Амжилттай',
        description: 'Таны танилцуулга шинэчлэгдлээ.',
      });
    } catch (error) {
      console.error('Error updating bio:', error);
      toast({
        title: 'Алдаа',
        description: 'Танилцуулга шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGreeting = async () => {
    if (!user || !firestore) return;
    const userInfoDocRef = doc(firestore, 'users', user.uid);
    setSaving(true);
    try {
      await updateDoc(userInfoDocRef, { greeting: editedGreeting });
      setGreeting(editedGreeting);
      setIsEditingGreeting(false);
      toast({
        title: 'Амжилттай',
        description: 'Мэндчилгээ шинэчлэгдлээ.',
      });
    } catch (error) {
      console.error('Error updating greeting:', error);
      toast({
        title: 'Алдаа',
        description: 'Мэндчилгээ шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRole = async () => {
    if (!user || !firestore) return;
    const userInfoDocRef = doc(firestore, 'users', user.uid);
    setSaving(true);
    try {
      await updateDoc(userInfoDocRef, { role: editedRole });
      setRole(editedRole);
      setIsEditingRole(false);
      toast({
        title: 'Амжилттай',
        description: 'Мэргэжил шинэчлэгдлээ.',
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Алдаа',
        description: 'Мэргэжил шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
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

  const handleCancelEditGreeting = () => {
    setEditedGreeting(greeting);
    setIsEditingGreeting(false);
  };

  const handleCancelEditRole = () => {
    setEditedRole(role);
    setIsEditingRole(false);
  };

  if (loading) {
    return (
      <section
        id="home"
        className="w-full min-h-[calc(100vh-57px)] flex items-center justify-center"
      >
        <div className="container px-4 md:px-6 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const handleOrbitItemClick = (item: OrbitInfo) => {
    if (selectedOrbit?.id === item.id && !isEditingOrbit) {
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
    if (item.type === 'audio') {
      setEditedYoutubeUrl(
        item.youtubeVideoId
          ? `https://www.youtube.com/watch?v=${item.youtubeVideoId}`
          : ''
      );
      setEditedOrbitBgImage(item.backgroundImage || '');
    } else {
      setEditedOrbitBgImage(item.backgroundImage || '');
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode) {
      setIsEditingOrbit(true);
    }
  };

  const socialButtons: SocialInfo[] = (
    [
      {
        type: 'github' as SocialLinkType,
        url: socialLinks.github,
        icon: <Github className="h-5 w-5" />,
        name: 'GitHub',
      },
      {
        type: 'instagram' as SocialLinkType,
        url: socialLinks.instagram,
        icon: <Instagram className="h-5 w-5" />,
        name: 'Instagram',
      },
      {
        type: 'facebook' as SocialLinkType,
        url: socialLinks.facebook,
        icon: <Facebook className="h-5 w-5" />,
        name: 'Facebook',
      },
      {
        type: 'email' as SocialLinkType,
        url: socialLinks.email,
        icon: <Mail className="h-5 w-5" />,
        name: 'Email',
      },
    ] as SocialInfo[]
  ).filter(link => link.url);

  return (
    <section
      id="home"
      className="relative w-full flex items-center min-h-[calc(100vh-120px)] py-8 sm:py-12 md:py-16 overflow-hidden"
    >
      <div className="container mx-auto relative z-10 px-4 sm:px-6 md:px-8">
        <div className="grid items-center justify-center gap-6 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 lg:order-2">
            <div className="relative flex items-center justify-center w-full max-w-[260px] sm:max-w-[400px] md:max-w-[500px] aspect-square mx-auto">
              {/* Animated background rings - faster rotation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Inner ring - fastest, dotted */}
                <motion.div
                  className="absolute w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] rounded-full transform-gpu"
                  style={{
                    border: '2px dotted',
                    borderColor: 'hsl(var(--primary) / 0.3)',
                    willChange: 'transform',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Middle ring - simple border */}
                <motion.div
                  className="absolute w-[250px] h-[250px] sm:w-[360px] sm:h-[360px] md:w-[450px] md:h-[450px] rounded-full border border-primary/15 transform-gpu"
                  style={{ willChange: 'transform' }}
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Glowing accent dots on rings */}
                <motion.div
                  className="absolute w-[250px] h-[250px] sm:w-[360px] sm:h-[360px] md:w-[450px] md:h-[450px] transform-gpu"
                  style={{ willChange: 'transform' }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
                </motion.div>

                <motion.div
                  className="absolute w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] transform-gpu"
                  style={{ willChange: 'transform' }}
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/70" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/70" />
                </motion.div>
              </div>

              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 4 + Math.random() * 4,
                      height: 4 + Math.random() * 4,
                      left: `${15 + Math.random() * 70}%`,
                      top: `${15 + Math.random() * 70}%`,
                      background:
                        i % 2 === 0
                          ? 'hsl(var(--primary) / 0.5)'
                          : 'rgb(168, 85, 247, 0.5)',
                    }}
                    animate={{
                      y: [0, -30, 0],
                      x: [0, 15 * (i % 2 === 0 ? 1 : -1), 0],
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 2.5 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>

              <div
                className={cn(
                  'relative transition-all duration-500 [transform-style:preserve-3d] z-20',
                  isEditingOrbit
                    ? 'w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px]'
                    : 'w-40 h-40 sm:w-64 sm:h-64 md:w-80 md:h-80'
                )}
              >
                <AnimatePresence mode="wait">
                  {selectedOrbit ? (
                    <motion.div
                      key={`orbit-content-${selectedOrbit.id}`}
                      initial={{ rotateY: -180, opacity: 0, scale: 0.8 }}
                      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                      exit={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="absolute inset-0 flex flex-col items-center justify-center rounded-full text-center overflow-visible [transform-style:preserve-3d]"
                    >
                      {/* Inner content container */}
                      <div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-card via-card/98 to-muted backdrop-blur-sm overflow-hidden border-4 border-background/80 shadow-2xl shadow-primary/20"
                        onClick={handleContentClick}
                      >
                        {selectedOrbit.backgroundImage && !isEditingOrbit && (
                          <>
                            <Image
                              src={selectedOrbit.backgroundImage}
                              alt={selectedOrbit.title}
                              fill
                              className="object-cover rounded-full z-0 opacity-30"
                            />
                            {/* Dark overlay for better text visibility */}
                            <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/70 via-background/50 to-background/70" />
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
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="w-full max-w-xs mx-auto p-6 space-y-2">
                                <div>
                                  <Label className="text-center text-xs mb-1 block text-foreground">
                                    Нэр
                                  </Label>
                                  <Input
                                    value={editedOrbitTitle}
                                    onChange={e =>
                                      setEditedOrbitTitle(e.target.value)
                                    }
                                    className="h-8 text-sm w-full bg-transparent border-primary/50 focus-visible:ring-primary text-foreground text-center"
                                    placeholder="Нэр..."
                                  />
                                </div>
                                {selectedOrbit.type !== 'audio' && (
                                  <div className="space-y-2">
                                    <Label className="text-center text-xs mb-1 block text-foreground">
                                      Icon
                                    </Label>
                                    <IconPicker
                                      selectedIcon={editedOrbitIcon}
                                      onIconSelect={setEditedOrbitIcon}
                                    >
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-8 text-sm justify-center gap-2 bg-transparent border-primary/50 focus:ring-primary text-foreground"
                                      >
                                        {getIcon(editedOrbitIcon, {
                                          className: 'h-4 w-4',
                                        })}
                                        <span>{editedOrbitIcon}</span>
                                      </Button>
                                    </IconPicker>
                                  </div>
                                )}
                                <div>
                                  <Label className="text-center text-xs mb-1 block text-foreground">
                                    Тайлбар
                                  </Label>
                                  <Textarea
                                    value={editedOrbitContent}
                                    onChange={e =>
                                      setEditedOrbitContent(e.target.value)
                                    }
                                    className="text-sm bg-transparent border-primary/50 focus-visible:ring-primary text-foreground"
                                    rows={2}
                                    placeholder="Тайлбар..."
                                  />
                                </div>

                                <div>
                                  <Label className="text-center text-xs mb-1 block text-foreground">
                                    Арын зураг URL
                                  </Label>
                                  <Input
                                    value={editedOrbitBgImage}
                                    onChange={e =>
                                      setEditedOrbitBgImage(e.target.value)
                                    }
                                    className="h-8 text-sm bg-transparent border-primary/50 focus-visible:ring-primary text-foreground text-center"
                                    placeholder="https://example.com/image.png"
                                  />
                                </div>
                                {selectedOrbit.type === 'audio' && (
                                  <div>
                                    <Label className="text-center text-xs mb-1 block text-foreground">
                                      YouTube холбоос
                                    </Label>
                                    <Input
                                      value={editedYoutubeUrl}
                                      onChange={e =>
                                        setEditedYoutubeUrl(e.target.value)
                                      }
                                      className="h-8 text-sm bg-transparent border-primary/50 focus-visible:ring-primary text-foreground text-center"
                                      placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                  </div>
                                )}
                                <div className="flex gap-2 justify-center pt-1">
                                  <Button
                                    onClick={handleSaveOrbitInfo}
                                    size="icon"
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
                                    onClick={() => setIsEditingOrbit(false)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="view"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute inset-0 z-30 p-6 flex flex-col items-center justify-center text-center"
                            >
                              <div className="w-16 h-1 rounded-full bg-primary mb-4" />

                              <h3 className="text-xl md:text-2xl font-bold mb-2 text-primary">
                                {selectedOrbit.title}
                              </h3>

                              <p className="text-sm md:text-base text-muted-foreground max-w-[80%] leading-relaxed">
                                {selectedOrbit.content}
                              </p>

                              <div className="w-10 h-1 rounded-full bg-primary/50 mt-4" />

                              {selectedOrbit.type === 'audio' &&
                                selectedOrbit.youtubeVideoId && (
                                  <div className="mt-4">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10 rounded-full border-2 border-primary bg-background/90 hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-lg shadow-primary/30"
                                      onClick={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsPlayerOpen(true);
                                      }}
                                    >
                                      <PlayCircle className="h-6 w-6" />
                                    </Button>
                                  </div>
                                )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="avatar"
                      initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                      animate={{
                        rotateY: 0,
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{ rotateY: -180, opacity: 0, scale: 0.8 }}
                      transition={{
                        duration: 0.5,
                        ease: 'easeInOut',
                      }}
                      className="relative w-full h-full group [transform-style:preserve-3d]"
                    >
                      <div className="avatar-glow-wrapper w-full h-full rounded-full overflow-hidden">
                        <Avatar className="w-full h-full border-4 border-background/80 shadow-2xl shadow-primary/20">
                          <AvatarImage
                            src={profileImage}
                            alt={name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-primary/20 to-purple-500/20">
                            {name?.charAt(0) || 'K'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Edit buttons - outside AnimatePresence with high z-index */}
                {isEditMode && (
                  <>
                    {/* Orbit content edit button - positioned at bottom */}
                    {selectedOrbit && !isEditingOrbit && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100]"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <Button
                          variant="default"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110"
                          onClick={e => {
                            e.stopPropagation();
                            setIsEditingOrbit(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Profile upload button - centered */}
                    {!selectedOrbit && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-[100]"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <Button
                          variant="default"
                          size="icon"
                          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110"
                          onClick={() => setIsEditingImage(true)}
                        >
                          <Upload className="h-6 w-6" />
                          <span className="sr-only">Зураг солих</span>
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Orbiting items container - rotates slowly like solar system */}
                <motion.div
                  className={cn('absolute inset-0 z-10 pointer-events-none')}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
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
                </motion.div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-start justify-center space-y-4 sm:space-y-6 text-center lg:text-left lg:order-1">
            <div className="space-y-3 sm:space-y-5">
              {/* Role badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center gap-2"
              >
                {isEditingRole ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 border border-primary/30">
                    <Input
                      value={editedRole}
                      onChange={e => setEditedRole(e.target.value)}
                      className="w-40 sm:w-48 h-7 text-xs sm:text-sm bg-transparent border-0 focus-visible:ring-1 text-primary"
                      placeholder="Мэргэжил..."
                      autoFocus
                    />
                    <Button
                      onClick={handleSaveRole}
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-primary hover:text-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelEditRole}
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-primary hover:text-primary"
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </span>
                ) : (
                  <>
                    <span className="group relative inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 border border-primary/30 text-primary text-xs sm:text-sm font-semibold overflow-hidden shadow-lg shadow-primary/10">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center gap-2.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        <Code2 className="h-4 w-4" />
                        {role || 'Энд мэргэжлээ оруулна уу'}
                      </span>
                    </span>
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditedRole(role);
                          setIsEditingRole(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </>
                )}
              </motion.div>

              {/* Greeting and Name */}
              <div className="relative">
                <div className="flex items-center gap-3">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedName}
                        onChange={e => setEditedName(e.target.value)}
                        className="text-3xl sm:text-4xl font-bold tracking-tighter xl:text-6xl/none h-auto p-0 border-0 focus-visible:ring-0 bg-transparent"
                      />
                      <Button
                        onClick={handleSaveName}
                        size="icon"
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
                        onClick={handleCancelEditName}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <motion.div
                      className="flex flex-col gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.2,
                      }}
                    >
                      <motion.span
                        className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
                        {isEditingGreeting ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editedGreeting}
                              onChange={e => setEditedGreeting(e.target.value)}
                              className="w-48 h-8 text-lg"
                              placeholder="Мэндчилгээ..."
                            />
                            <Button
                              onClick={handleSaveGreeting}
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
                              onClick={handleCancelEditGreeting}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="flex items-center gap-2">
                            {greeting}
                            {isEditMode && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  setEditedGreeting(greeting);
                                  setIsEditingGreeting(true);
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                          </span>
                        )}
                      </motion.span>
                      <div className="flex items-center gap-3">
                        <motion.h1
                          className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl font-bold tracking-tight"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.4,
                            type: 'spring',
                            stiffness: 100,
                          }}
                        >
                          <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent drop-shadow-lg">
                            {name}
                          </span>
                        </motion.h1>
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsEditingName(true)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Bio with pipe separators */}
              <div className="relative">
                <div className="flex items-start gap-2">
                  {isEditingBio ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedBio}
                        onChange={e => setEditedBio(e.target.value)}
                        className="max-w-[600px] text-lg md:text-xl bg-muted/50"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveBio}
                          size="sm"
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}{' '}
                          Хадгалах
                        </Button>
                        <Button
                          onClick={handleCancelEditBio}
                          size="sm"
                          variant="ghost"
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Цуцлах
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      className="flex items-start gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <div className="max-w-[90vw] sm:max-w-[650px] text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                        <span>
                          {bio ||
                            'Өөрийнхөө тухай товч танилцуулга энд бичнэ үү.'}
                        </span>
                      </div>
                      {isEditMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setIsEditingBio(true)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Танилцуулга засах</span>
                        </Button>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative pt-2">
              {isEditingLinks ? (
                <div className="space-y-3 max-w-sm">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      CV файл байршуулах (PDF)
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleCvUpload}
                        className="hidden"
                        id="cv-upload"
                        disabled={isUploadingCv}
                      />
                      <label htmlFor="cv-upload" className="flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full cursor-pointer"
                          disabled={isUploadingCv}
                          asChild
                        >
                          <span>
                            {isUploadingCv ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Байршуулж байна...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                PDF файл сонгох
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                    {editedLinks.cvUrl && (
                      <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <p className="text-xs text-muted-foreground truncate flex-1">
                          ✓ Байршуулсан файл
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditedLinks(prev => ({ ...prev, cvUrl: '' }))
                          }
                          className="h-6 px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="h-6 w-6 text-muted-foreground" />
                    <Input
                      value={editedLinks.github}
                      onChange={e =>
                        setEditedLinks({
                          ...editedLinks,
                          github: e.target.value,
                        })
                      }
                      placeholder="GitHub URL"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Instagram className="h-6 w-6 text-muted-foreground" />
                    <Input
                      value={editedLinks.instagram}
                      onChange={e =>
                        setEditedLinks({
                          ...editedLinks,
                          instagram: e.target.value,
                        })
                      }
                      placeholder="Instagram URL"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook className="h-6 w-6 text-muted-foreground" />
                    <Input
                      value={editedLinks.facebook}
                      onChange={e =>
                        setEditedLinks({
                          ...editedLinks,
                          facebook: e.target.value,
                        })
                      }
                      placeholder="Facebook URL"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-6 w-6 text-muted-foreground" />
                    <Input
                      value={editedLinks.email}
                      onChange={e =>
                        setEditedLinks({
                          ...editedLinks,
                          email: e.target.value,
                        })
                      }
                      placeholder="Email address"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSaveLinks}
                      size="sm"
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}{' '}
                      Хадгалах
                    </Button>
                    <Button
                      onClick={() => setIsEditingLinks(false)}
                      size="sm"
                      variant="ghost"
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Цуцлах
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                  {socialLinks.cvUrl && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        asChild
                        className="relative group bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] hover:bg-[length:100%_auto] text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                      >
                        <Link
                          href={socialLinks.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                          CV татах
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                  <Dialog>
                    <div className="flex items-center gap-2">
                      {socialButtons.map((social, index) => (
                        <DialogTrigger key={social.type} asChild>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                              onClick={() => {
                                setSelectedSocial(social);
                                setIsQrLoading(true);
                              }}
                            >
                              {social.icon}
                            </Button>
                          </motion.div>
                        </DialogTrigger>
                      ))}
                    </div>
                    <DialogContent className="sm:max-w-[425px]">
                      {selectedSocial && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {selectedSocial.icon} {selectedSocial.name}
                            </DialogTitle>
                            <DialogDescription>
                              QR кодыг уншуулж эсвэл "Үзэх" товчийг дарж
                              холбогдоно уу.
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
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${
                                  selectedSocial.type === 'email'
                                    ? `mailto:${selectedSocial.url}`
                                    : selectedSocial.url
                                }`}
                                alt={`${selectedSocial.name} QR Code`}
                                width={200}
                                height={200}
                                onLoad={() => setIsQrLoading(false)}
                                className={cn(isQrLoading && 'opacity-0')}
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
                                <a
                                  href={selectedSocial.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
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
              Шинэ зургийнхаа URL хаягийг энд буулгана уу. Base64 форматтай
              зураг байж болно.
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
                onChange={e => setEditedImage(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com/image.png"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Цуцлах
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveImage} disabled={saving}>
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

      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="sm:max-w-2xl bg-black/50 backdrop-blur-lg border-primary/30 p-1.5">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedOrbit?.title}</DialogTitle>
            <DialogDescription>
              Playing: {selectedOrbit?.content}
            </DialogDescription>
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
