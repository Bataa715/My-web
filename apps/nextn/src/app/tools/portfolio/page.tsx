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
  Mail,
  Github,
  Instagram,
  Facebook,
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
import ToolPageShell from '@/components/shared/ToolPageShell';

export default function PortfolioToolPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  const portfolioUrl =
    typeof window !== 'undefined' && user
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
        toast({ title: 'Алдаа', description: 'Өгөгдөл татахад алдаа гарлаа.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    if (!isUserLoading) fetchData();
  }, [user, firestore, isUserLoading, toast]);

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({ title: 'Алдаа', description: 'Нэвтэрч орно уу.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { email, github, instagram, facebook });
      toast({ title: 'Амжилттай', description: 'Холбоо барих мэдээлэл хадгалагдлаа.' });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: 'Алдаа', description: 'Хадгалахад алдаа гарлаа.', variant: 'destructive' });
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

  return (
    <ToolPageShell
      title="Portfolio тохиргоо"
      description="Өөрийн portfolio мэдээллийг засах"
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'Portfolio' },
      ]}
    >
      {isUserLoading || loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 pt-2">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild className="bg-card/50 backdrop-blur-xs border-primary/20 hover:border-primary/50">
              <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Portfolio үзэх
              </a>
            </Button>
          </div>

          {/* Portfolio URL & QR Code */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="relative bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/15 rounded-full blur-3xl" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <CardTitle>Portfolio холбоос</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Input value={portfolioUrl} readOnly className="flex-1 font-mono text-sm bg-background/50 border-primary/20" />
                  <Button variant="outline" size="icon" onClick={handleCopyUrl} className="bg-background/50 border-primary/20 hover:border-primary/50 hover:bg-primary/10">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-background/50 border-primary/20 hover:border-primary/50 hover:bg-primary/10">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/20">
                      <DialogHeader>
                        <DialogTitle className="text-center">Portfolio QR код</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center p-6">
                        <div className="p-4 bg-white rounded-2xl shadow-lg">
                          <QRCodeSVG value={portfolioUrl} size={220} level="H" includeMargin />
                        </div>
                      </div>
                      <p className="text-sm text-center text-muted-foreground">QR кодыг scan хийж portfolio руу шууд очно</p>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="relative bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/15 rounded-full blur-3xl" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                    <Mail className="h-5 w-5" />
                  </div>
                  <CardTitle>Холбоо барих мэдээлэл</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 relative z-10">
                {[
                  { id: 'email', label: 'И-мэйл', icon: Mail, value: email, onChange: setEmail, placeholder: 'example@gmail.com', type: 'email' },
                  { id: 'github', label: 'GitHub URL', icon: Github, value: github, onChange: setGithub, placeholder: 'https://github.com/username', type: 'text' },
                  { id: 'instagram', label: 'Instagram URL', icon: Instagram, value: instagram, onChange: setInstagram, placeholder: 'https://instagram.com/username', type: 'text' },
                  { id: 'facebook', label: 'Facebook URL', icon: Facebook, value: facebook, onChange: setFacebook, placeholder: 'https://facebook.com/username', type: 'text' },
                ].map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="flex items-center gap-2">
                      <field.icon className="h-4 w-4 text-muted-foreground" />
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      type={field.type}
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      placeholder={field.placeholder}
                      className="bg-background/50 border-primary/20 focus:border-primary/50"
                    />
                  </div>
                ))}
                <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground border-0 shadow-lg">
                  {saving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Хадгалж байна...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />Хадгалах</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </ToolPageShell>
  );
}
