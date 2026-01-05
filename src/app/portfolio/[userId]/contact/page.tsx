'use client';

import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import type { UserProfile } from '@/lib/types';
import { Suspense, useEffect, useState, use } from 'react';
import {
  Loader2,
  Mail,
  Github,
  Instagram,
  Facebook,
  Copy,
  Check,
} from 'lucide-react';
import { useFirebase } from '@/firebase';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function PortfolioContactPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { firestore } = useFirebase();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getUserProfile = async () => {
      if (!firestore) {
        setLoading(false);
        return;
      }
      try {
        const userDocRef = doc(firestore, 'users', userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setUserProfile(data);
        } else {
          notFound();
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      getUserProfile();
    } else {
      setLoading(false);
      notFound();
    }
  }, [userId, firestore]);

  const handleCopyEmail = () => {
    if (userProfile?.email) {
      navigator.clipboard.writeText(userProfile.email);
      setCopied(true);
      toast({ title: 'И-мэйл хуулагдлаа!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return notFound();
  }

  return (
    <div className="min-h-screen px-4 py-12 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Холбоо барих</h1>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Нэр</label>
              <Input
                placeholder="Таны нууц нэр"
                className="bg-card/50 border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Э-мэйл хаяг</label>
              <Input
                type="email"
                placeholder="Spam хийхгүй зэ. Амлаж байна"
                className="bg-card/50 border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Агуулга</label>
            <Textarea
              placeholder="Мессежэ энд бичнэ үү. Шу ч асуугаарай. Би уншиж болно"
              rows={6}
              className="bg-card/50 border-primary/20 focus:border-primary resize-none"
            />
          </div>

          <Button
            size="lg"
            className="w-full md:w-auto px-8 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300"
          >
            Э-мэйл илгээх →
          </Button>
        </motion.div>

        {/* Email Display with Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-between p-6 rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm md:text-base">
              Э-мэйл: {userProfile.email || 'radnaa2015@gmail.com'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyEmail}
            className="hover:bg-primary/10"
          >
            {copied ? (
              <Check className="h-5 w-5 text-primary" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
