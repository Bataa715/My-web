'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Save,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  User,
  Mail,
  Github,
  Instagram,
  Facebook,
  Sparkles,
  Link2,
} from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import BackButton from '@/components/shared/BackButton';

export default function PortfolioToolPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Contact information
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  const portfolioUrl = user
    ? `${window.location.origin}/portfolio/${user.uid}`
    : '';

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !firestore) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setEmail(data.email || '');
          setGithub(data.github || '');
          setInstagram(data.instagram || '');
          setFacebook(data.facebook || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Алдаа',
          description: 'Өгөгдөл татахад алдаа гарлаа.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (!isUserLoading) {
      fetchData();
    }
  }, [user, firestore, isUserLoading, toast]);

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        email,
        github,
        instagram,
        facebook,
      });

      toast({
        title: 'Амжилттай',
        description: 'Холбоо барих мэдээлэл хадгалагдлаа.',
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: 'Алдаа',
        description: 'Хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = () => {
    if (portfolioUrl) {
      navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast({ title: 'Хуулагдлаа!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isUserLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-lg">
              Portfolio tool ашиглахын тулд нэвтэрч орно уу.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-screen"
    >
      <InteractiveParticles quantity={40} />
      <div className="container mx-auto p-6 max-w-4xl space-y-8 relative z-10">
        <BackButton />

        {/* Hero Header */}
        <div className="text-center pt-4 pb-6">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Portfolio тохиргоо
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Өөрийн portfolio мэдээллийг засах
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50"
          >
            <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Portfolio үзэх
            </a>
          </Button>
        </div>

        {/* Portfolio URL & QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-500 to-purple-400 rounded-full opacity-20 blur-3xl" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 text-white">
                  <Link2 className="h-5 w-5" />
                </div>
                <CardTitle>Portfolio холбоос</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <Input
                  value={portfolioUrl}
                  readOnly
                  className="flex-1 font-mono text-sm bg-background/50 border-primary/20"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                  className="bg-background/50 border-primary/20 hover:border-primary/50 hover:bg-primary/10"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-background/50 border-primary/20 hover:border-primary/50 hover:bg-primary/10"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/20">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Portfolio QR код
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center p-6">
                      <div className="p-4 bg-white rounded-2xl shadow-lg">
                        <QRCodeSVG
                          value={portfolioUrl}
                          size={220}
                          level="H"
                          includeMargin
                        />
                      </div>
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      QR кодыг scan хийж portfolio руу шууд очно
                    </p>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-500 to-rose-400 rounded-full opacity-20 blur-3xl" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <CardTitle>Холбоо барих мэдээлэл</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  И-мэйл
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="bg-background/50 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  GitHub URL
                </Label>
                <Input
                  id="github"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="bg-background/50 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  Instagram URL
                </Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="bg-background/50 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-muted-foreground" />
                  Facebook URL
                </Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={e => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/username"
                  className="bg-background/50 border-primary/20 focus:border-primary/50"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-violet-500/25"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Хадгалж байна...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Хадгалах
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
