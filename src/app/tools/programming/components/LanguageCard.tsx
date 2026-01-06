'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Language } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
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
import { useEditMode } from '@/contexts/EditModeContext';
import * as LucideIcons from 'lucide-react';

interface LanguageCardProps {
  language: Language;
  index: number;
  onDelete: (id: string, name: string) => void;
}

export default function LanguageCard({
  language,
  index,
  onDelete,
}: LanguageCardProps) {
  const { isEditMode } = useEditMode();

  const cardStyle = {
    '--glow-color': language.primaryColor,
    boxShadow: `0 0 15px 1px rgba(var(--glow-color), 0.2), 0 0 20px 2px rgba(var(--glow-color), 0.1)`,
    borderColor: `rgba(var(--glow-color), 0.3)`,
  } as React.CSSProperties;

  const progressStyle = {
    backgroundColor: `rgb(var(--glow-color))`,
  } as React.CSSProperties;

  const getIcon = (iconName: string) => {
    const LucideIcon = (LucideIcons as any)[iconName];
    return LucideIcon ? (
      <LucideIcon className="h-8 w-8" />
    ) : (
      <AlertTriangle className="h-8 w-8 text-destructive" />
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        type: 'spring',
        stiffness: 100,
      }}
      className="group relative"
    >
      <Link href={`/tools/programming/${language.id}`}>
        <div
          className="bg-gray-900/50 backdrop-blur-sm border p-6 rounded-2xl h-full flex flex-col justify-between hover:scale-105 transition-all cursor-pointer"
          style={cardStyle}
        >
          <div>
            <div
              className="w-16 h-16 mb-4 mx-auto relative flex items-center justify-center rounded-xl"
              style={{
                color: `rgb(var(--glow-color))`,
                backgroundColor: `rgba(var(--glow-color), 0.1)`,
                boxShadow: `0 0 10px 2px rgba(var(--glow-color), 0.2)`,
              }}
            >
              {getIcon(language.iconUrl)}
            </div>
            <h3 className="text-white text-xl font-bold text-center mb-2">
              {language.name}
            </h3>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{ ...progressStyle, width: `${language.progress}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-xs mt-2 text-right">
              {language.progress}% completed
            </p>
          </div>
        </div>
      </Link>
      {isEditMode && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-3 -right-3 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
              <AlertDialogDescription>
                "{language.name}" хэлийг устгах гэж байна. Энэ үйлдэл
                буцаагдахгүй.
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
    </motion.div>
  );
}
