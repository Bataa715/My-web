
'use client';
import { useSkills } from '@/contexts/SkillsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '../ui/button';
import { PlusCircle, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { AddSkillDialog } from '../AddSkillDialog';
import { EditSkillDialog } from '../EditSkillDialog';
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
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';


const Skills = () => {
    const { skills, loading, deleteSkillGroup } = useSkills();
    const { isEditMode } = useEditMode();

    const getIcon = (iconName: string) => {
        const LucideIcon = (require('lucide-react') as any)[iconName];
        return LucideIcon ? <LucideIcon className="h-8 w-8 text-primary" /> : <AlertTriangle className="h-8 w-8 text-destructive" />;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <section id="skills" className="py-12 md:py-24 lg:py-32">
            <div className="container">
                <div className="text-center">
                    <h2 className="text-4xl font-bold">Ур чадвар &amp; Технологиуд</h2>
                </div>

                {loading && (
                    <div className="mx-auto grid gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-6 w-3/4" />
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
                    </div>
                )}

                {!loading && (
                     <div className="mx-auto grid gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {skills.map((skillGroup) => (
                             <div key={skillGroup.id} className="card-glow rounded-lg h-full" onMouseMove={handleMouseMove}>
                                <Card className="hover:shadow-lg transition-shadow duration-300 relative group bg-muted/30 h-full flex flex-col">
                                    {isEditMode && (
                                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                                            <EditSkillDialog skillGroup={skillGroup}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </EditSkillDialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            "{skillGroup.name}" бүлгийг устгах гэж байна. Энэ үйлдэл буцаагдахгүй.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteSkillGroup(skillGroup.id)}>Устгах</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        {getIcon(skillGroup.icon)}
                                        <CardTitle className="text-lg">{skillGroup.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="flex flex-wrap gap-2">
                                            {skillGroup.items.map((item, index) => (
                                                <Badge key={index} variant="secondary" className="text-sm font-medium">
                                                    {item}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                        {isEditMode && (
                           <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="h-full">
                                <AddSkillDialog>
                                    <button className="flex h-full min-h-[150px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50 hover:text-primary">
                                        <PlusCircle size={40} />
                                        <span className="mt-4 font-semibold">Шинэ ур чадвар нэмэх</span>
                                    </button>
                                </AddSkillDialog>
                           </motion.div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Skills;
