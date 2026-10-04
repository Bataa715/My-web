'use client';

import { useMemo } from 'react';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { useSkills } from '@/features/portfolio/context/SkillsContext';
import { useEditMode } from '@/providers/EditModeContext';
import { Button } from '@/components/ui/button';
import { AddSkillDialog } from '@/features/portfolio/dialogs/AddSkillDialog';
import { EditSkillDialog } from '@/features/portfolio/dialogs/EditSkillDialog';
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
import type { Skill } from '@/lib/types';
import TechIcon from '@/components/common/TechIcon';
import { Skeleton } from '@/components/ui/skeleton';

function SkillGroupRow({
  group,
  isEditMode,
  onDelete,
}: {
  group: Skill;
  isEditMode: boolean;
  onDelete: () => void;
}) {
  return (
    <li className="relative py-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
            {String(group.items.length).padStart(2, '0')} skills
          </p>
          <h3 className="mt-1 text-xl">{group.name}</h3>
        </div>
        {isEditMode && (
          <div className="flex gap-1">
            <EditSkillDialog skillGroup={group}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </EditSkillDialog>
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
                  <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{group.name}" бүлгийг устгах гэж байна.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Устгах</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {group.items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-1.5 border border-[#111]/20 px-3 py-1.5 text-sm"
          >
            <TechIcon techName={item} className="h-4 w-4" />
            {item}
          </span>
        ))}
      </div>
    </li>
  );
}

export default function Skills() {
  const { skills, loading, deleteSkillGroup } = useSkills();
  const { isEditMode } = useEditMode();

  // Smallest group first (03 → 04 → 05 …); equal sizes keep their original order
  const orderedSkills = useMemo(
    () => [...skills].sort((a, b) => a.items.length - b.items.length),
    [skills]
  );

  const totalSkills = useMemo(
    () => skills.reduce((n, g) => n + g.items.length, 0),
    [skills]
  );

  return (
    <section id="skills" className="bg-[#f3f1ee] py-16 text-[#111] sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2 className="portal-title">Skills</h2>
        {!loading && skills.length > 0 && (
          <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-[#111]/45">
            {skills.length} чиглэл · {totalSkills} технологи
          </p>
        )}

        <div className="mt-16">
          {loading ? (
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-40" />
                  <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-20" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : skills.length === 0 && !isEditMode ? (
            <p className="py-16 text-center text-sm text-[#111]/45">
              Ур чадвар одоогоор нэмэгдээгүй байна.
            </p>
          ) : (
            <ul className="divide-y divide-[#111]">
              {orderedSkills.map(group => (
                <SkillGroupRow
                  key={group.id}
                  group={group}
                  isEditMode={isEditMode}
                  onDelete={() => deleteSkillGroup(group.id)}
                />
              ))}
            </ul>
          )}

          {isEditMode && (
            <div className="mt-8 flex justify-center">
              <AddSkillDialog>
                <button className="inline-flex items-center gap-2 border border-dashed border-[#111]/40 px-5 py-3 text-sm hover:border-[#c41212] hover:text-[#c41212]">
                  <PlusCircle size={18} />
                  Шинэ бүлэг нэмэх
                </button>
              </AddSkillDialog>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
