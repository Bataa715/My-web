
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProgrammingConcept } from '@/lib/types';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
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
import { AddConceptDialog } from './AddConceptDialog';
import { EditConceptDialog } from './EditConceptDialog';

interface ConceptCardsProps {
  concepts: ProgrammingConcept[];
  onAddConcept: (concept: Omit<ProgrammingConcept, 'id'>) => void;
  onUpdateConcept: (id: string, concept: Omit<ProgrammingConcept, 'id'>) => void;
  onDeleteConcept: (id: string) => void;
}

export default function ConceptCards({ concepts, onAddConcept, onUpdateConcept, onDeleteConcept }: ConceptCardsProps) {
  const { isEditMode } = useEditMode();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Core Concepts</CardTitle>
          <CardDescription>Програмчлалын үндсэн ойлголтууд.</CardDescription>
        </div>
        {isEditMode && (
          <AddConceptDialog onAddConcept={onAddConcept}>
            <Button variant="outline" size="icon">
              <PlusCircle />
            </Button>
          </AddConceptDialog>
        )}
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {concepts.map((concept) => (
          <Card key={concept.id} className="flex flex-col relative group">
             {isEditMode && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditConceptDialog concept={concept} onUpdateConcept={onUpdateConcept}>
                   <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4"/></Button>
                </EditConceptDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                      <AlertDialogDescription>"{concept.title}" ойлголтыг устгах гэж байна. Энэ үйлдэл буцаагдахгүй.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteConcept(concept.id!)}>Устгах</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{concept.title}</CardTitle>
              <span className="text-2xl">{concept.emoji}</span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{concept.explanation}</p>
            </CardContent>
          </Card>
        ))}
         {concepts.length === 0 && (
          <div className="text-center text-muted-foreground py-10 md:col-span-2 lg:col-span-3">
             {isEditMode ? "Шинэ ойлголт нэмнэ үү." : "Ойлголт олдсонгүй."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
