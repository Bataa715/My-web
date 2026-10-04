'use client';

import Link from 'next/link';
import type { GrammarRule } from '@/lib/types';
import { useEditMode } from '@/providers/EditModeContext';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, ArrowRight } from 'lucide-react';
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
import { EditGrammarRuleDialog } from '@/features/language/components/EditGrammarRuleDialog';
import { usePathname } from 'next/navigation';

interface GrammarListProps {
  rules: GrammarRule[];
  onDeleteRule: (id: string) => void;
  onUpdateRule: (rule: GrammarRule) => void;
  collectionPath: 'englishGrammar' | 'japaneseGrammar';
}

export default function GrammarList({
  rules,
  onDeleteRule,
  onUpdateRule,
  collectionPath,
}: GrammarListProps) {
  const { isEditMode } = useEditMode();
  const pathname = usePathname();

  if (rules.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-[#111]/45">Дүрэм олдсонгүй.</p>
    );
  }

  return (
    <ul className="divide-y divide-[#111]">
      {rules.map(rule => (
        <li key={rule.id} className="group relative">
          <Link
            href={`${pathname}/${rule.id}`}
            className="flex items-center gap-4 py-6 sm:gap-8"
          >
            <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
              {rule.category}
            </span>
            <span className="min-w-0 flex-1 text-lg">{rule.title}</span>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
          {isEditMode && rule.id && (
            <div className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 gap-1 bg-[#f3f1ee] pr-8">
              <EditGrammarRuleDialog
                rule={rule}
                onUpdateRule={onUpdateRule}
                collectionPath={collectionPath}
              >
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </EditGrammarRuleDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#c41212]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Та итгэлтэй байна уу?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Энэ үйлдлийг буцаах боломжгүй. "{rule.title}" дүрэм
                      бүрмөсөн устгагдах болно.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteRule(rule.id!)}
                      className="bg-[#c41212] hover:bg-[#c41212]/90"
                    >
                      Устгах
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
