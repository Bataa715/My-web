'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { GrammarRule } from '@/lib/types';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '../ui/button';
import { Trash2, Edit, ChevronRight, BookOpen } from 'lucide-react';
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
import { motion } from 'framer-motion';

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

  // Determine gradient colors based on language
  const isEnglish = collectionPath === 'englishGrammar';
  const gradientFrom = isEnglish ? 'from-blue-500' : 'from-rose-500';
  const gradientTo = isEnglish ? 'to-indigo-500' : 'to-pink-500';
  const textColor = isEnglish ? 'text-blue-400' : 'text-rose-400';
  const shadowColor = isEnglish ? 'shadow-blue-500/10' : 'shadow-rose-500/10';
  const hoverShadow = isEnglish
    ? 'hover:shadow-blue-500/20'
    : 'hover:shadow-rose-500/20';
  const borderColor = isEnglish ? 'border-blue-500/20' : 'border-rose-500/20';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {rules.map((rule, index) => (
        <motion.div key={rule.id || index} variants={itemVariants}>
          <Card
            className={`relative group overflow-hidden bg-card/50 backdrop-blur-xl border-0 rounded-2xl flex flex-col shadow-lg ${shadowColor} ${hoverShadow} transition-all duration-500`}
          >
            {/* Gradient border effect */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradientFrom}/20 via-transparent ${gradientTo}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />

            <Link
              href={`${pathname}/${rule.id}`}
              className="flex-grow relative"
            >
              <CardHeader className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${gradientFrom}/20 ${gradientTo}/20 shrink-0`}
                    >
                      <BookOpen className={`h-4 w-4 ${textColor}`} />
                    </div>
                    <CardTitle className="text-lg font-bold leading-tight">
                      {rule.title}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`bg-gradient-to-r ${gradientFrom}/10 ${gradientTo}/10 border-0 ${textColor}`}
                  >
                    {rule.category}
                  </Badge>
                </div>
              </CardHeader>
            </Link>
            <CardContent className="flex justify-end items-center mt-auto pt-0 relative">
              <Link
                href={`${pathname}/${rule.id}`}
                className={`flex items-center text-sm ${textColor} hover:underline group/link`}
              >
                Дэлгэрэнгүй
                <ChevronRight className="h-4 w-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </CardContent>

            {isEditMode && rule.id && (
              <div className="absolute top-2 right-2 flex gap-1 bg-background/80 backdrop-blur-sm rounded-xl p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditGrammarRuleDialog
                  rule={rule}
                  onUpdateRule={onUpdateRule}
                  collectionPath={collectionPath}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-lg cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </EditGrammarRuleDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg"
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
                      <AlertDialogAction
                        onClick={() => onDeleteRule(rule.id!)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Устгах
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
      {rules.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 lg:col-span-3"
        >
          <Card className="text-center p-12 bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
            <CardContent className="flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-full bg-gradient-to-br ${gradientFrom}/20 ${gradientTo}/20`}
              >
                <BookOpen className={`h-10 w-10 ${textColor}`} />
              </div>
              <p className="text-muted-foreground text-lg">Дүрэм олдсонгүй.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
