
"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { GrammarRule } from "@/lib/types";
import { useEditMode } from "@/contexts/EditModeContext";
import { Button } from "../ui/button";
import { Trash2, BookCopy, Edit } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "../ui/badge";
import { EditGrammarRuleDialog } from "./EditGrammarRuleDialog";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import PracticeGenerator from "./PracticeGenerator";

interface GrammarRuleDetailProps {
  rule: GrammarRule;
  onUpdateRule: (rule: GrammarRule) => void;
  onDeleteRule: (id: string) => void;
  collectionPath: 'englishGrammar' | 'japaneseGrammar';
}


export default function GrammarRuleDetail({ rule, onUpdateRule, onDeleteRule, collectionPath }: GrammarRuleDetailProps) {
  const { isEditMode } = useEditMode();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const router = useRouter();

  const handleDelete = async () => {
    if (!firestore || !rule.id || !user) {
        toast({ title: "Алдаа", description: "Дүрэм устгах боломжгүй", variant: "destructive" });
        return;
    }
     try {
      await deleteDoc(doc(firestore, `users/${user.uid}/${collectionPath}`, rule.id));
      toast({ title: "Амжилттай", description: "Дүрэм устгагдлаа." });
      onDeleteRule(rule.id);
      router.back();
    } catch (error) {
      console.error("Error deleting rule: ", error);
      toast({ title: "Алдаа", description: "Дүрэм устгахад алдаа гарлаа.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
        <Card className="relative group overflow-hidden">
           <CardHeader className="bg-muted/30">
            <div className="flex justify-between items-start">
                 <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <BookCopy className="h-8 w-8 text-primary"/>
                        <div>
                            <CardTitle className="text-3xl font-bold">{rule.title}</CardTitle>
                            <Badge variant="secondary">{rule.category}</Badge>
                        </div>
                    </div>
                    <CardDescription className="text-base prose dark:prose-invert max-w-none pt-2">{rule.introduction}</CardDescription>
                </div>
                {isEditMode && rule.id && (
                    <div className="flex gap-1">
                        <EditGrammarRuleDialog rule={rule} onUpdateRule={onUpdateRule} collectionPath={collectionPath}>
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
                                    Энэ үйлдлийг буцаах боломжгүй. "{rule.title}" дүрэм бүрмөсөн устгагдах болно.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Устгах</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
             {/* Usage Section */}
            <div id="usage">
                <h3 className="text-xl font-bold mb-4">2. Хэрэглээ (Usage)</h3>
                <ul className="space-y-3 list-disc pl-5">
                    {rule.usage.map((use, i) =>(
                        <li key={i}>
                            <strong className="font-semibold">{use.condition}</strong>
                            <p className="text-muted-foreground italic">"{use.example}"</p>
                        </li>
                    ))}
                </ul>
            </div>
             
             {/* Form Section */}
            <div id="form">
                <h3 className="text-xl font-bold mb-4">3. Үйл үгний хэлбэр (Form)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader><CardTitle>Regular Verbs</CardTitle></CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{rule.form.regular}</ReactMarkdown>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Irregular Verbs</CardTitle></CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{rule.form.irregular}</ReactMarkdown>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Structure Section */}
            <div id="structure">
                <h3 className="text-xl font-bold mb-4">4. Өгүүлбэрийн бүтэц (Sentence Structure)</h3>
                 <Tabs defaultValue="positive" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="positive">🟢 Positive</TabsTrigger>
                        <TabsTrigger value="negative">🔴 Negative</TabsTrigger>
                        <TabsTrigger value="question">❓ Question</TabsTrigger>
                    </TabsList>
                    <TabsContent value="positive" className="pt-4">
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{rule.structure.positive.formula}</ReactMarkdown>
                        </div>
                        <ul className="list-disc pl-5 mt-4 space-y-1">
                          {rule.structure.positive.examples.map((ex, i) => <li key={i} className="italic">{ex}</li>)}
                        </ul>
                    </TabsContent>
                    <TabsContent value="negative" className="pt-4">
                        <div className="prose dark:prose-invert max-w-none">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>{rule.structure.negative.formula}</ReactMarkdown>
                        </div>
                         <ul className="list-disc pl-5 mt-4 space-y-1">
                          {rule.structure.negative.examples.map((ex, i) => <li key={i} className="italic">{ex}</li>)}
                        </ul>
                    </TabsContent>
                    <TabsContent value="question" className="pt-4">
                         <div className="prose dark:prose-invert max-w-none">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>{rule.structure.question.formula}</ReactMarkdown>
                        </div>
                         <ul className="list-disc pl-5 mt-4 space-y-1">
                          {rule.structure.question.examples.map((ex, i) => <li key={i} className="italic">{ex}</li>)}
                        </ul>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Time Expressions Section */}
            <div id="time-expressions">
                 <h3 className="text-xl font-bold mb-4">5. Цаг хугацааны илэрхийлэл (Time Expressions)</h3>
                 <div className="flex flex-wrap gap-2">
                    {rule.timeExpressions.map((exp, i) => (
                        <Badge key={i} variant="outline" className="text-base py-1 px-3">{exp.word} <span className="text-muted-foreground ml-2">({exp.translation})</span></Badge>
                    ))}
                 </div>
            </div>
          </CardContent>
        </Card>
        
        <PracticeGenerator rule={rule} />
    </div>
  );
}

    