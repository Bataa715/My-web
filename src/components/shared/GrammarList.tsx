"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { GrammarRule } from "@/lib/types";
import { useEditMode } from "@/contexts/EditModeContext";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface GrammarListProps {
  rules: GrammarRule[];
  onDeleteRule: (id: string) => void;
}

export default function GrammarList({ rules, onDeleteRule }: GrammarListProps) {
  const { isEditMode } = useEditMode();

  return (
    <div className="space-y-4">
      {rules.map((rule, index) => (
        <Card key={rule.id || index} className="relative group">
          <CardHeader className="flex flex-row justify-between items-start">
            <CardTitle>{rule.title}</CardTitle>
            {isEditMode && rule.id && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Та итгэлтэй байна уу?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Энэ үйлдлийг буцаах боломжгүй. "{rule.title}" дүрэм бүрмөсөн устгагдах болно.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteRule(rule.id!)}>Устгах</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{rule.explanation}</ReactMarkdown>
            </div>
             {rule.examples && rule.examples.length > 0 && (
                 <div>
                    <h4 className="font-semibold mb-2">Жишээ:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        {rule.examples.map((example, i) => (
                        <li key={i} className="text-foreground/90">{example}</li>
                        ))}
                    </ul>
                </div>
            )}
          </CardContent>
        </Card>
      ))}
       {rules.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <p className="text-muted-foreground">Дүрэм олдсонгүй.</p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
