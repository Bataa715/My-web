'use client';

import Link from 'next/link';
import type { Language } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trash2 } from 'lucide-react';
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
import { useEditMode } from '@/providers/EditModeContext';
import TechIcon from '@/components/common/TechIcon';

interface LanguageCardProps {
  language: Language;
  index: number;
  onDelete: (id: string, name: string) => void;
}

export default function LanguageCard({
  language,
  onDelete,
}: LanguageCardProps) {
  const { isEditMode } = useEditMode();

  return (
    <li className="relative">
      <Link
        href={`/tools/programming/${language.id}`}
        className="group flex items-center gap-4 py-6 sm:gap-8"
      >
        <TechIcon techName={language.iconUrl} className="h-8 w-8 shrink-0" />
        <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
          Code
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg">{language.name}</span>
          <span className="block text-xs text-[#111]/50">
            {language.progress}% дууссан
          </span>
        </span>
        <span className="hidden h-px w-24 bg-[#111]/15 sm:block">
          <span
            className="block h-px bg-[#c41212]"
            style={{ width: `${language.progress}%` }}
          />
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>
      {isEditMode && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
              <AlertDialogDescription>
                "{language.name}" хэлийг устгах гэж байна.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Цуцлах</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(language.id!, language.name)}
              >
                Устгах
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </li>
  );
}
