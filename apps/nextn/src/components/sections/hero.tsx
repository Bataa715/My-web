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
  Facebook,
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

// ── Planet color palette — one per orbit node (index-based) ──────────────────
const PLANET_PALETTE = [
  { from: 'hsl(25 95% 55%)',  to: 'hsl(15 90% 35%)', glow: 'hsl(25 95% 53% / 0.8)',  ring: 'hsl(25 95% 53% / 0.4)'  }, // orange
  { from: 'hsl(189 94% 50%)', to: 'hsl(199 80% 30%)', glow: 'hsl(189 94% 43% / 0.8)', ring: 'hsl(189 94% 43% / 0.4)' }, // cyan
  { from: 'hsl(271 81% 62%)', to: 'hsl(265 72% 38%)', glow: 'hsl(271 81% 56% / 0.8)', ring: 'hsl(271 81% 56% / 0.4)' }, // violet
  { from: 'hsl(142 72% 50%)', to: 'hsl(148 68% 28%)', glow: 'hsl(142 76% 36% / 0.8)', ring: 'hsl(142 76% 36% / 0.4)' }, // emerald
  { from: 'hsl(0 84% 65%)',   to: 'hsl(5 80% 38%)',   glow: 'hsl(0 84% 60% / 0.8)',   ring: 'hsl(0 84% 60% / 0.4)'   }, // red
  { from: 'hsl(45 93% 60%)',  to: 'hsl(38 88% 34%)',  glow: 'hsl(45 93% 47% / 0.8)',  ring: 'hsl(45 93% 47% / 0.4)'  }, // amber
  { from: 'hsl(217 91% 65%)', to: 'hsl(220 82% 38%)', glow: 'hsl(217 91% 60% / 0.8)', ring: 'hsl(217 91% 60% / 0.4)' }, // blue
  { from: 'hsl(330 81% 65%)', to: 'hsl(330 74% 38%)', glow: 'hsl(330 81% 60% / 0.8)', ring: 'hsl(330 81% 60% / 0.4)' }, // pink
];

const ORBIT_CONFIG = [
  { tiltX: 72, speed: 22 },
  { tiltX: 68, speed: 28 },
  { tiltX: 75, speed: 20 },
  { tiltX: 70, speed: 32 },
  { tiltX: 65, speed: 26 },
  { tiltX: 73, speed: 24 },
  { tiltX: 78, speed: 30 },
  { tiltX: 67, speed: 18 },
];

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

const OrbitItem: FC<OrbitItemProps> = ({ item, index, total, selectedOrbit, onItemClick, isEditing }) => {
  const config = ORBIT_CONFIG[index % ORBIT_CONFIG.length];
  const isSelected = selectedOrbit?.id === item.id;
  const planet = PLANET_PALETTE[index % PLANET_PALETTE.length];

  const [currentRadius, setCurrentRadius] = useState(110);
  useEffect(() => {
    const update = () => {
      const isMd = window.innerWidth >= 768, isSm = window.innerWidth >= 640;
      setCurrentRadius(isEditing
        ? (isMd ? 230 : isSm ? 170 : 130)
        : (isMd ? 200 : isSm ? 150 : 110)
      );
    };
    window.addEventListener('resize', update);
    update();
    return () => window.removeEventListener('resize', update);
  }, [isEditing]);

  const startFrac = index / Math.max(total, 1);
  const orbitDelay = `-${startFrac * config.speed}s`;

  return (
    <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${config.tiltX}deg)`, pointerEvents: 'none' }}>
      <div
        className="orbit-3d-spin"
        style={{
          position: 'absolute',
          inset: 0,
          ['--orbit-dur' as string]: `${config.speed}s`,
          ['--orbit-start' as string]: orbitDelay,
        }}
      >
        <div style={{ position: 'absolute', top: `calc(50% - ${currentRadius + 22}px)`, left: 'calc(50% - 22px)', width: 44, height: 44, transformStyle: 'preserve-3d' }}>
          <div
            className="orbit-3d-counter"
            style={{
              position: 'absolute',
              inset: 0,
              ['--orbit-dur' as string]: `${config.speed}s`,
              ['--orbit-start' as string]: orbitDelay,
            }}
          >
            <div style={{ transform: `rotateX(-${config.tiltX}deg)`, width: 44, height: 44, position: 'relative', pointerEvents: 'auto' }}>
              <div className="relative group h-full w-full">
                <div className="absolute -inset-2 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${planet.glow} 0%, transparent 70%)`, filter: 'blur(6px)' }}
                />
                {isSelected && (
                  <div className="absolute -inset-2 rounded-full animate-[spin_4s_linear_infinite]"
                    style={{ background: `conic-gradient(from 0deg, transparent 0deg 270deg, ${planet.ring} 270deg 360deg)`, filter: 'blur(2px)' }}
                  />
                )}
                <button
                  onClick={() => onItemClick(item)}
                  className="relative h-full w-full rounded-full transition-all duration-300 overflow-hidden border-2 focus:outline-none"
                  style={{
                    background: `radial-gradient(circle at 38% 35%, hsl(0 0% 100% / 0.3), ${planet.from} 45%, ${planet.to})`,
                    borderColor: isSelected ? planet.from : 'hsl(0 0% 100% / 0.15)',
                    boxShadow: isSelected
                      ? `0 0 18px ${planet.glow}, inset 0 1px 0 hsl(0 0% 100% / 0.25)`
                      : `0 0 8px ${planet.ring}, inset 0 1px 0 hsl(0 0% 100% / 0.12)`,
                  }}
                >
                  <div className="absolute top-0.5 left-1.5 w-3 h-2 rounded-full bg-white/25 blur-[2px]" />
                  <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-sm">
                    {getIcon(item.icon, { className: 'h-4 w-4' })}
                  </div>
                  <span className="sr-only">{item.title}</span>
                </button>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold tracking-wide pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: planet.from, textShadow: `0 0 8px ${planet.glow}` }}>
                  {item.title}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      className="relative w-full flex items-center min-h-[calc(100vh-120px)] py-8 sm:py-12 md:py-16"
    >
      {/* Subtle grid mask only — no colored tint over the hero image */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-32 -z-0 overflow-hidden">
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
      <div className="container mx-auto relative z-10 px-4 sm:px-6 md:px-8">
        <div className="grid items-center justify-center gap-6 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 lg:order-2">
            <div className="relative flex items-center justify-center w-full max-w-[260px] sm:max-w-[400px] md:max-w-[500px] aspect-square mx-auto">
              {/* ═══════════════════════════════════════════════════
                  SOLAR SYSTEM — 3D orbital plane structure
                  Tilted elliptical ring guides + solar corona sun.
                  Planets orbit on compressed ellipses = 3D depth.
                  ═══════════════════════════════════════════════════ */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                {/* Deep-space nebula background glow */}
                <div className="absolute w-full h-full rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(var(--primary)/0.13) 0%, hsl(260 80% 45%/0.07) 50%, transparent 75%)',
                    filter: 'blur(22px)',
                  }}
                />

                {/* Solar corona warm outer glow */}
                <div className="absolute rounded-full"
                  style={{
                    width: '44%', height: '44%',
                    background: 'radial-gradient(circle, hsl(45 100% 62%/0.3) 0%, hsl(var(--primary)/0.28) 52%, transparent 80%)',
                    filter: 'blur(14px)',
                  }}
                />

                {/* Solar pulse — animated breathing corona */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: '40%', height: '40%' }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-full h-full rounded-full"
                    style={{ boxShadow: '0 0 22px 6px hsl(45 100% 58%/0.38), 0 0 44px 16px hsl(var(--primary)/0.2)' }}
                  />
                </motion.div>

                {/* Secondary solar pulse — offset phase */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: '44%', height: '44%' }}
                  animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 1.7 }}
                >
                  <div className="w-full h-full rounded-full"
                    style={{ boxShadow: '0 0 32px 10px hsl(var(--primary)/0.25)' }}
                  />
                </motion.div>

                {/* ── ORBITAL RING 1 — primary plane (main orbit) */}
                <div className="absolute w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] rounded-full"
                  style={{
                    border: '1.5px solid hsl(var(--primary)/0.55)',
                    filter: 'drop-shadow(0 0 5px hsl(var(--primary)/0.4))',
                    transform: 'scaleY(0.38)',
                  }}
                />
                {/* Ring 1 gradient highlight — bright on sides, fading top/bottom */}
                <div className="absolute w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, hsl(var(--primary)/0.6) 0deg 8deg, transparent 8deg 172deg, hsl(var(--primary)/0.6) 172deg 188deg, transparent 188deg 360deg)',
                    WebkitMaskImage: 'radial-gradient(closest-side, transparent calc(100% - 2px), black calc(100% - 2px))',
                    maskImage: 'radial-gradient(closest-side, transparent calc(100% - 2px), black calc(100% - 2px))',
                    transform: 'scaleY(0.38)',
                    filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.7))',
                  }}
                />

                {/* ── ORBITAL RING 2 — inclined 32° (different plane) */}
                <div className="absolute w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] rounded-full"
                  style={{
                    border: '1px solid hsl(var(--accent)/0.4)',
                    filter: 'drop-shadow(0 0 3px hsl(var(--accent)/0.3))',
                    transform: 'rotateZ(32deg) scaleY(0.38)',
                  }}
                />

                {/* ── ORBITAL RING 3 — outer ring, inclined -18° */}
                <div className="absolute w-[258px] h-[258px] sm:w-[348px] sm:h-[348px] md:w-[464px] md:h-[464px] rounded-full"
                  style={{
                    border: '1px solid hsl(var(--primary)/0.18)',
                    transform: 'rotateZ(-18deg) scaleY(0.38)',
                  }}
                />

                {/* ── ASTEROID BELT — faint dashed outer dust ring */}
                <div className="absolute w-[272px] h-[272px] sm:w-[365px] sm:h-[365px] md:w-[486px] md:h-[486px] rounded-full"
                  style={{
                    border: '1px dashed hsl(var(--primary)/0.12)',
                    transform: 'scaleY(0.38)',
                  }}
                />

                {/* ── Outermost boundary — very faint reference circle */}
                <div className="absolute w-[290px] h-[290px] sm:w-[392px] sm:h-[392px] md:w-[522px] md:h-[522px] rounded-full"
                  style={{ border: '1px solid hsl(var(--primary)/0.07)' }}
                />

                {/* ── Solar flare arcs — static decorative halos */}
                <div className="absolute w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] md:w-[290px] md:h-[290px] rounded-full"
                  style={{
                    background: 'conic-gradient(from 15deg, transparent 0deg 60deg, hsl(45 100% 58%/0.12) 60deg 90deg, transparent 90deg 240deg, hsl(var(--primary)/0.1) 240deg 265deg, transparent 265deg 360deg)',
                    WebkitMaskImage: 'radial-gradient(closest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
                    maskImage: 'radial-gradient(closest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
                  }}
                />
              </div>

              <div
                className={cn(
                  'relative transition-all duration-500 z-20',
                  isEditingOrbit
                    ? 'w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px]'
                    : 'w-40 h-40 sm:w-64 sm:h-64 md:w-80 md:h-80'
                )}
                style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
              >
                <AnimatePresence mode="wait">
                  {selectedOrbit ? (
                    <motion.div
                      key={`orbit-content-${selectedOrbit.id}`}
                      initial={{ rotateY: -90 }}
                      animate={{ rotateY: 0 }}
                      exit={{ rotateY: 90 }}
                      transition={{ duration: 0.18, ease: [0.4, 0, 0.6, 1] }}
                      style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
                      className="absolute inset-0 flex flex-col items-center justify-center rounded-full text-center overflow-visible"
                    >
                      {/* Inner content container */}
                      <div
                        className="absolute inset-0 rounded-full bg-linear-to-br from-card via-card/98 to-muted backdrop-blur-xs overflow-hidden border-4 border-background/80 shadow-2xl shadow-primary/20"
                        onClick={handleContentClick}
                      >
                        {selectedOrbit.backgroundImage && !isEditingOrbit && (
                          <>
                            <Image
                              src={selectedOrbit.backgroundImage}
                              alt={selectedOrbit.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 600px"
                              className="object-cover rounded-full z-0 opacity-30"
                              unoptimized={/\.gif(\?|$)/i.test(selectedOrbit.backgroundImage)}
                            />
                            {/* Dark overlay for better text visibility */}
                            <div className="absolute inset-0 z-10 bg-linear-to-b from-background/70 via-background/50 to-background/70" />
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
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      exit={{ rotateY: -90 }}
                      transition={{ duration: 0.18, ease: [0.4, 0, 0.6, 1] }}
                      style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
                      className="relative w-full h-full group"
                    >
                      {/* Solar surface — layered glow rings around avatar */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Outer atmosphere halo */}
                        <div className="absolute -inset-3 sm:-inset-4 rounded-full"
                          style={{
                            background: 'radial-gradient(circle, transparent 60%, hsl(45 100% 60%/0.18) 72%, hsl(var(--primary)/0.25) 82%, transparent 95%)',
                            filter: 'blur(4px)',
                          }}
                        />
                        {/* Inner corona ring */}
                        <div className="absolute -inset-1.5 sm:-inset-2 rounded-full"
                          style={{
                            boxShadow: '0 0 0 1.5px hsl(45 100% 65%/0.3), 0 0 16px 4px hsl(45 100% 60%/0.2), 0 0 30px 8px hsl(var(--primary)/0.15)',
                          }}
                        />
                      </div>

                      <div className="avatar-glow-wrapper w-full h-full rounded-full overflow-hidden relative z-10">
                        <Avatar className="w-full h-full border-4 shadow-2xl"
                          style={{
                            borderColor: 'hsl(45 100% 62%/0.4)',
                            boxShadow: '0 0 0 1px hsl(var(--primary)/0.3), 0 0 24px 6px hsl(45 100% 55%/0.2), 0 0 48px 16px hsl(var(--primary)/0.12)',
                          }}
                        >
                          <AvatarImage
                            src={profileImage}
                            alt={name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-6xl font-bold bg-linear-to-br from-primary/20 to-purple-500/20">
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
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-100"
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
                        className="absolute inset-0 flex items-center justify-center z-100"
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

                {/* Orbiting planets — each on its own CSS 3D tilted ring, depth-sorted by browser */}
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
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-primary/20 via-primary/5 to-primary/20 border border-primary/30">
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
                    <span className="group relative inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/30 bg-primary/8 backdrop-blur-md text-primary text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] overflow-hidden shadow-sm shadow-primary/10">
                      <span className="absolute inset-0 bg-linear-to-r from-transparent via-primary/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center gap-2">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                        </span>
                        <Code2 className="h-3.5 w-3.5" />
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
                        className="text-base sm:text-lg md:text-xl font-light tracking-[0.08em] flex items-center gap-1.5 sm:gap-2"
                        style={{ color: 'hsl(var(--foreground) / 0.55)' }}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
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
                          className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.02] relative"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {/* Ambient glow behind name */}
                          <span
                            aria-hidden
                            className="absolute inset-0 blur-2xl opacity-30 select-none pointer-events-none"
                            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.6), transparent 60%)' }}
                          />
                          <span className="relative bg-clip-text text-transparent"
                            style={{ backgroundImage: 'linear-gradient(135deg, hsl(var(--foreground)) 30%, hsl(var(--foreground)/0.75) 60%, hsl(var(--primary)/0.85) 100%)' }}>
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
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <div className="max-w-[90vw] sm:max-w-[600px] text-sm sm:text-base leading-relaxed text-balance"
                        style={{ color: 'hsl(var(--foreground) / 0.58)' }}>
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
                  <Dialog>
                    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md px-2 py-1.5">
                      {socialButtons.map((social, index) => (
                        <DialogTrigger key={social.type} asChild>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
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
