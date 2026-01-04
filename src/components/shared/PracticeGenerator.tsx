
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Loader2, Wand2, CheckCircle2, XCircle } from 'lucide-react';
import type { GrammarRule, GeneratedExercises, GeneratedMCQ, GeneratedWritingTask } from '@/lib/types';
import { generateExercises } from '@/ai/flows/generate-exercises-flow';
import { useToast } from '@/hooks/use-toast';

const MCQCard = ({ mcq, index }: { mcq: GeneratedMCQ; index: number }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    setIsAnswered(true);
  };

  return (
    <Card key={index} className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Сонгох тест {index + 1}:</CardTitle>
        <CardDescription className="text-base">{mcq.question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {mcq.options.map((option: string, i: number) => (
          <Button
            key={i}
            variant={isAnswered ? (option === mcq.correctAnswer ? 'default' : (selectedOption === option ? 'destructive' : 'outline')) : 'outline'}
            className="w-full justify-start text-left h-auto py-2"
            onClick={() => !isAnswered && handleAnswer(option)}
            disabled={isAnswered}
          >
            {option}
          </Button>
        ))}
        {isAnswered && (
          <div className={`mt-4 p-4 rounded-md flex items-start gap-3 ${selectedOption === mcq.correctAnswer ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
            {selectedOption === mcq.correctAnswer ? <CheckCircle2 className="h-5 w-5 mt-1" /> : <XCircle className="h-5 w-5 mt-1" />}
            <div>
              <h4 className="font-bold">{selectedOption === mcq.correctAnswer ? 'Зөв!' : 'Буруу!'}</h4>
              <p className="text-sm">{mcq.explanation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const WritingTaskCard = ({ task, index }: { task: GeneratedWritingTask; index: number }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <Card key={index} className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Бичих даалгавар {index + 1}:</CardTitle>
        <CardDescription className="text-base">{task.instruction}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={() => setShowAnswer(!showAnswer)}>
          {showAnswer ? 'Хариуг нуух' : 'Жишээ хариу харах'}
        </Button>
        {showAnswer && (
          <div className="mt-4 p-4 rounded-md bg-muted">
            <p className="text-sm italic">{task.exampleAnswer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export default function PracticeGenerator({ rule }: { rule: GrammarRule }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mcqCount, setMcqCount] = useState(3);
  const [writingCount, setWritingCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<GeneratedExercises | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setExercises(null);
    setIsDialogOpen(false);
    try {
      const result = await generateExercises({
        ruleTitle: rule.title,
        ruleIntroduction: rule.introduction,
        numMCQ: mcqCount,
        numWriting: writingCount,
      });
      setExercises(result);
    } catch (error) {
      console.error("Error generating exercises:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Дасгал үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div id="practice" className="space-y-6">
      <h2 className="text-2xl font-bold text-center">AI Дасгал Үүсгэгч</h2>
      <div className="flex justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Wand2 className="mr-2 h-5 w-5" />
              Дасгал ажиллах
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Дасгал үүсгэх тохиргоо</DialogTitle>
              <DialogDescription>
                AI ашиглан тухайн дүрэмд тохирсон дасгалуудыг үүсгээрэй.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Сонгох тест (MCQ)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[mcqCount]}
                    onValueChange={(value) => setMcqCount(value[0])}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <span className="font-bold text-lg w-10 text-center">{mcqCount}</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Бичих даалгавар</Label>
                <div className="flex items-center gap-4">
                   <Slider
                    value={[writingCount]}
                    onValueChange={(value) => setWritingCount(value[0])}
                    min={0}
                    max={5}
                    step={1}
                  />
                  <span className="font-bold text-lg w-10 text-center">{writingCount}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Цуцлах</Button></DialogClose>
                <Button onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Үүсгэх
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

       {isLoading && (
         <div className="flex justify-center items-center py-10">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">AI дасгал үүсгэж байна...</p>
            </div>
        </div>
       )}

      {exercises && (
        <div className="pt-6">
            {exercises.multipleChoiceQuestions.length > 0 && (
                 <div className="space-y-4">
                    {exercises.multipleChoiceQuestions.map((mcq, index) => (
                        <MCQCard mcq={mcq} index={index} key={`mcq-${index}`} />
                    ))}
                </div>
            )}
             {exercises.writingTasks.length > 0 && (
                 <div className="mt-8 space-y-4">
                    {exercises.writingTasks.map((task, index) => (
                        <WritingTaskCard task={task} index={index} key={`writing-${index}`} />
                    ))}
                </div>
            )}
        </div>
      )}

    </div>
  );
}
