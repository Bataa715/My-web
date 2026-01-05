'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { GrammarRule } from '@/lib/types';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '../ui/button';
import { Trash2, Edit, ChevronRight } from 'lucide-react';
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
import { Badge } from '../ui/badge';
import { EditGrammarRuleDialog } from './EditGrammarRuleDialog';
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rules.map((rule, index) => (
        <Card
          key={rule.id || index}
          className="relative group overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
        >
          <Link href={`${pathname}/${rule.id}`} className="flex-grow">
            <CardHeader>
              <div className="space-y-2">
                <CardTitle className="text-xl font-bold">
                  {rule.title}
                </CardTitle>
                <Badge variant="secondary">{rule.category}</Badge>
              </div>
            </CardHeader>
          </Link>
          <CardContent className="flex justify-end items-center mt-auto">
            <Link
              href={`${pathname}/${rule.id}`}
              className="flex items-center text-sm text-primary hover:underline"
            >
              Дэлгэрэнгүй
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardContent>

          {isEditMode && rule.id && (
            <div className="absolute top-2 right-2 flex gap-1 bg-background/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <EditGrammarRuleDialog
                rule={rule}
                onUpdateRule={onUpdateRule}
                collectionPath={collectionPath}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </EditGrammarRuleDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
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
                    <AlertDialogAction onClick={() => onDeleteRule(rule.id!)}>
                      Устгах
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </Card>
      ))}
      {rules.length === 0 && (
        <Card className="text-center p-8 md:col-span-2 lg:col-span-3">
          <CardContent>
            <p className="text-muted-foreground">Дүрэм олдсонгүй.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
