'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Save, PlusCircle, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from '@/supabase/db';
import { useSupabase } from '@/supabase';
import type {
  UserProfile,
  PersonalInfoItem as PersonalInfoType,
} from '@/lib/types';
import { useEditMode } from '@/providers/EditModeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useHobbies } from '@/features/portfolio/context/HobbyContext';
import { AddHobbyDialog } from '@/features/portfolio/dialogs/AddHobbyDialog';
import { EditHobbyDialog } from '@/features/portfolio/dialogs/EditHobbyDialog';
import { AddPersonalInfoDialog } from '@/features/portfolio/dialogs/AddPersonalInfoDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const displayLabelMap: Record<string, string> = {
  'Төрсөн өдөр': 'Bday',
};

const getDisplayLabel = (label: string) => displayLabelMap[label] || label;

export default function About() {
  const { firestore, user, isUserLoading } = useSupabase();
  const { isEditMode } = useEditMode();
  const { hobbies, loading: hobbiesLoading, deleteHobby } = useHobbies();
  const { toast } = useToast();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoType[]>([]);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editingInfoItem, setEditingInfoItem] =
    useState<PersonalInfoType | null>(null);
  const [editingInfoValue, setEditingInfoValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [hobbyIndex, setHobbyIndex] = useState(0);

  useEffect(() => {
    if (isUserLoading || !user || !firestore) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setPersonalInfo(data.personalInfo || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, firestore, isUserLoading]);

  const orderedInfo = useMemo(() => {
    if (!personalInfo.length) return [];
    const infoMap = new Map(personalInfo.map(i => [i.label, i]));
    const order = ['Орд', 'Төрсөн өдөр', 'Нас', 'Өндөр', 'MBTI'];
    const mainItems = order
      .map(label => infoMap.get(label))
      .filter(Boolean) as PersonalInfoType[];
    const remaining = personalInfo.filter(i => !order.includes(i.label));
    return [...mainItems, ...remaining];
  }, [personalInfo]);

  useEffect(() => {
    if (hobbyIndex >= hobbies.length) setHobbyIndex(0);
  }, [hobbies.length, hobbyIndex]);

  useEffect(() => {
    if (hobbies.length < 2) return;
    const t = setInterval(
      () => setHobbyIndex(i => (i + 1) % hobbies.length),
      5500
    );
    return () => clearInterval(t);
  }, [hobbies.length]);

  const handleEditInfoClick = (info: PersonalInfoType) => {
    setEditingInfoItem(info);
    setEditingInfoValue(info.value);
    setIsEditingInfo(true);
  };

  const handleSavePersonalInfo = async () => {
    if (!user || !firestore || !editingInfoItem) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const updatedInfo = personalInfo.map(info =>
        info.label === editingInfoItem.label
          ? { ...info, value: editingInfoValue }
          : info
      );
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { personalInfo: updatedInfo });
      setPersonalInfo(updatedInfo);
      setIsEditingInfo(false);
      setEditingInfoItem(null);
      toast({ title: 'Амжилттай', description: 'Мэдээлэл шинэчлэгдлээ.' });
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast({
        title: 'Алдаа',
        description: 'Мэдээлэл хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      id="about"
      data-section="about"
      className="relative scroll-mt-24 bg-[#f3f1ee] py-16 text-[#111] sm:py-20"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2 className="portal-title">About</h2>

        {(orderedInfo.length > 0 || isEditMode) && (
          <div className="mt-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
              Profile
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 md:grid-cols-5">
              {orderedInfo.map(info => (
                <div key={info.label} className="relative min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c41212]">
                    {getDisplayLabel(info.label)}
                  </p>
                  <p className="mt-1.5 break-words text-lg leading-tight">
                    {info.value}
                  </p>
                  {isEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-2 -top-2 h-7 w-7"
                      onClick={() => handleEditInfoClick(info)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {isEditMode && (
              <div className="mt-8 flex justify-center">
                <AddPersonalInfoDialog
                  onAdd={newInfo => setPersonalInfo(prev => [...prev, newInfo])}
                >
                  <button className="inline-flex items-center gap-2 border border-dashed border-[#111]/40 px-5 py-3 text-sm hover:border-[#c41212] hover:text-[#c41212]">
                    <PlusCircle className="h-4 w-4" />
                    Мэдээлэл нэмэх
                  </button>
                </AddPersonalInfoDialog>
              </div>
            )}
          </div>
        )}

        <div id="hobbies" className="mt-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
            Hobbies
          </p>
          <h3 className="mt-2 font-display text-3xl sm:text-4xl">Сонирхол</h3>

          {hobbiesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#c41212]" />
            </div>
          ) : hobbies.length === 0 && !isEditMode ? (
            <p className="mt-8 text-sm text-[#111]/45">Хобби олдсонгүй.</p>
          ) : hobbies.length > 0 ? (
            <div className="relative mx-auto mt-8 max-w-xl">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${hobbyIndex * 100}%)` }}
                >
                  {hobbies.map(hobby => (
                    <div key={hobby.id} className="w-full shrink-0 px-1">
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#111]">
                        {hobby.image ? (
                          <Image
                            src={hobby.image}
                            alt={hobby.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 576px"
                            className="object-cover"
                            unoptimized={/\.gif(\?|$)/i.test(hobby.image)}
                          />
                        ) : null}
                        {isEditMode && (
                          <div className="absolute right-3 top-3 flex gap-1 bg-[#f3f1ee]/90">
                            <EditHobbyDialog hobby={hobby}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </EditHobbyDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Устгахдаа итгэлтэй байна уу?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "{hobby.title}" хоббиг устгах гэж байна.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => hobby.id && deleteHobby(hobby.id)}
                                  >
                                    Устгах
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                      <p className="mt-4 text-center text-xl">{hobby.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {hobbies.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Өмнөх"
                    onClick={() =>
                      setHobbyIndex(i => (i - 1 + hobbies.length) % hobbies.length)
                    }
                    className="absolute left-0 top-[38%] flex h-9 w-9 -translate-x-1/2 items-center justify-center border border-[#111] bg-[#f3f1ee]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Дараах"
                    onClick={() => setHobbyIndex(i => (i + 1) % hobbies.length)}
                    className="absolute right-0 top-[38%] flex h-9 w-9 translate-x-1/2 items-center justify-center border border-[#111] bg-[#f3f1ee]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="mt-5 flex justify-center gap-2">
                    {hobbies.map((hobby, i) => (
                      <button
                        key={hobby.id ?? i}
                        type="button"
                        aria-label={hobby.title}
                        onClick={() => setHobbyIndex(i)}
                        className={cn(
                          'h-1.5 w-6',
                          i === hobbyIndex ? 'bg-[#c41212]' : 'bg-[#111]/20'
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {isEditMode && (
            <div className="mt-8 flex justify-center">
              <AddHobbyDialog>
                <button className="inline-flex items-center gap-2 border border-dashed border-[#111]/40 px-5 py-3 text-sm hover:border-[#c41212] hover:text-[#c41212]">
                  <PlusCircle className="h-4 w-4" />
                  Хобби нэмэх
                </button>
              </AddHobbyDialog>
            </div>
          )}
        </div>
      </div>

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
                onChange={e => setEditingInfoValue(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditingInfo(false);
                  setEditingInfoItem(null);
                }}
              >
                Цуцлах
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSavePersonalInfo} disabled={saving}>
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
    </section>
  );
}
