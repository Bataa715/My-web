'use client';
import { useSkills } from '@/contexts/SkillsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '../ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AddSkillDialog } from '../AddSkillDialog';
import { EditSkillDialog } from '../EditSkillDialog';

const Skills = () => {
    const { skills, loading, deleteSkillGroup } = useSkills();
    const { isEditMode } = useEditMode();
  return (
    <section id="skills" className="bg-muted/50 py-12 md:py-24">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold font-headline">Миний ур чадварууд</h2>
          <p className="mt-2 text-muted-foreground">Би ямар технологиуд дээр ажилладаг вэ?</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 3 }).map((_, i) => (
             <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                </CardContent>
             </Card>
          ))}

          {!loading && skills.map((group) => (
            <Card key={group.id} className="relative group">
                {isEditMode && (
                    <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <EditSkillDialog skillGroup={group}>
                            <Button variant="secondary" size="icon" >
                               <PlusCircle />
                            </Button>
                        </EditSkillDialog>
                        <Button variant="destructive" size="icon" onClick={() => deleteSkillGroup(group.id)}>
                            <Trash2 />
                        </Button>
                    </div>
                )}
              <CardHeader>
                <CardTitle>{group.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {isEditMode && (
            <AddSkillDialog>
                <button className="flex h-full min-h-[150px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-transparent text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <PlusCircle size={32} />
                    <span className="mt-2 font-semibold">Шинэ бүлэг нэмэх</span>
                </button>
            </AddSkillDialog>
          )}
        </div>
      </div>
    </section>
  );
};

export default Skills;
