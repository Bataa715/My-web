
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { GrammarRule } from "@/lib/types";
import { useEditMode } from "@/contexts/EditModeContext";
import { Button } from "../ui/button";
import { Trash2, AlertTriangle, BookCopy, CheckCircle2, XCircle, Edit } from "lucide-react";
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

interface GrammarListProps {
  rules: GrammarRule[];
  onDeleteRule: (id: string) => void;
  onUpdateRule: (rule: GrammarRule) => void;
  collectionPath: 'englishGrammar' | 'japaneseGrammar';
}

const PracticeQuestion = ({ question, index }: { question: any, index: number }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleAnswer = (option: string) => {
        setSelectedOption(option);
        setIsAnswered(true);
    };

    return (
        <Card key={index} className="mb-4">
            <CardHeader>
                <CardTitle className="text-lg">Дасгал {index + 1}:</CardTitle>
                <CardDescription className="text-base">{question.question}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {question.options.map((option: string, i: number) => (
                    <Button
                        key={i}
                        variant={isAnswered ? (option === question.correctAnswer ? "default" : (selectedOption === option ? "destructive" : "outline")) : "outline"}
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => !isAnswered && handleAnswer(option)}
                        disabled={isAnswered}
                    >
                        {option}
                    </Button>
                ))}
                {isAnswered && (
                    <div className={`mt-4 p-4 rounded-md flex items-start gap-3 ${selectedOption === question.correctAnswer ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                        {selectedOption === question.correctAnswer ? <CheckCircle2 className="h-5 w-5 mt-1" /> : <XCircle className="h-5 w-5 mt-1" />}
                        <div>
                            <h4 className="font-bold">{selectedOption === question.correctAnswer ? 'Зөв!' : 'Буруу!'}</h4>
                            <p className="text-sm">{question.explanation}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


export default function GrammarList({ rules, onDeleteRule, onUpdateRule, collectionPath }: GrammarListProps) {
  const { isEditMode } = useEditMode();

  return (
    <div className="space-y-6">
      {rules.map((rule, index) => (
        <Card key={rule.id || index} className="relative group overflow-hidden">
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
                                className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </EditGrammarRuleDialog>
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
            
            {/* Practice Section */}
            <div id="practice">
                 <h3 className="text-xl font-bold mb-4">6. Дасгал (Practice)</h3>
                 <div className="space-y-4">
                    {rule.practice.map((q, i) => (
                        <PracticeQuestion key={i} question={q} index={i} />
                    ))}
                 </div>
            </div>

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
