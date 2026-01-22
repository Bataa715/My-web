'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Target,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  BookOpen,
  Code,
  Languages,
  Dumbbell,
  Music,
  Film,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingData {
  bio: string;
  location: string;
  goals: string;
  interests: string[];
  learningGoals: {
    english: boolean;
    japanese: boolean;
    programming: boolean;
    fitness: boolean;
  };
}

interface OnboardingDialogProps {
  open: boolean;
  onComplete: (data: OnboardingData) => void;
  userName: string;
}

const interestOptions = [
  { id: 'music', label: 'Хөгжим', icon: Music },
  { id: 'movies', label: 'Кино', icon: Film },
  { id: 'reading', label: 'Ном унших', icon: BookOpen },
  { id: 'coding', label: 'Код бичих', icon: Code },
  { id: 'languages', label: 'Хэл сурах', icon: Languages },
  { id: 'fitness', label: 'Фитнес', icon: Dumbbell },
];

const learningOptions = [
  {
    id: 'english',
    label: 'Англи хэл',
    description: 'Vocabulary, Grammar, Speaking, Writing',
    icon: '🇬🇧',
  },
  {
    id: 'japanese',
    label: 'Япон хэл',
    description: 'Hiragana, Katakana, Vocabulary, Grammar',
    icon: '🇯🇵',
  },
  {
    id: 'programming',
    label: 'Программчлал',
    description: 'JavaScript, Python, React, гэх мэт',
    icon: '💻',
  },
  {
    id: 'fitness',
    label: 'Фитнес',
    description: 'Дасгал, Workout tracker',
    icon: '💪',
  },
];

export default function OnboardingDialog({
  open,
  onComplete,
  userName,
}: OnboardingDialogProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    bio: '',
    location: '',
    goals: '',
    interests: [],
    learningGoals: {
      english: false,
      japanese: false,
      programming: false,
      fitness: false,
    },
  });

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const toggleInterest = (id: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));
  };

  const toggleLearningGoal = (id: keyof OnboardingData['learningGoals']) => {
    setData(prev => ({
      ...prev,
      learningGoals: {
        ...prev.learningGoals,
        [id]: !prev.learningGoals[id],
      },
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">
                Тавтай морил, {userName}! 👋
              </h3>
              <p className="text-muted-foreground">
                Таны туршлагыг илүү сайн болгохын тулд хэдэн асуулт асууя.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Өөрийнхөө тухай товчхон
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Жишээ: Оюутан, программчлал болон хэл сурахыг сонирхдог..."
                  value={data.bio}
                  onChange={e => setData({ ...data, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Байршил
                </Label>
                <Input
                  id="location"
                  placeholder="Улаанбаатар, Монгол"
                  value={data.location}
                  onChange={e => setData({ ...data, location: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Таны зорилго</h3>
              <p className="text-muted-foreground">
                Энэ апп-аар юу хийхийг хүсэж байна вэ?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Зорилгоо бичнэ үү</Label>
              <Textarea
                id="goals"
                placeholder="Жишээ: Англи хэлний түвшинээ дээшлүүлэх, өдөрт 30 минут программчлал сурах..."
                value={data.goals}
                onChange={e => setData({ ...data, goals: e.target.value })}
                rows={4}
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Сонирхол</h3>
              <p className="text-muted-foreground">
                Юуг сонирхдог вэ? (Олныг сонгож болно)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map(option => {
                const isSelected = data.interests.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleInterest(option.id)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <option.icon
                      className={cn(
                        'w-5 h-5',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'font-medium',
                        isSelected ? 'text-primary' : ''
                      )}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Юу сурах вэ?</h3>
              <p className="text-muted-foreground">
                Ямар чиглэлээр суралцахыг хүсэж байна вэ?
              </p>
            </div>

            <div className="space-y-3">
              {learningOptions.map(option => {
                const isSelected =
                  data.learningGoals[
                    option.id as keyof OnboardingData['learningGoals']
                  ];
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      toggleLearningGoal(
                        option.id as keyof OnboardingData['learningGoals']
                      )
                    }
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <div
                        className={cn(
                          'font-medium',
                          isSelected ? 'text-primary' : ''
                        )}
                      >
                        {option.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    <Checkbox checked={isSelected} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Алхам {step + 1} / {totalSteps}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComplete(data)}
              className="text-muted-foreground hover:text-foreground"
            >
              Алгасах
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </DialogHeader>

        <div className="py-4 min-h-[300px]">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Буцах
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {step === totalSteps - 1 ? (
              <>
                Дуусгах
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Үргэлжлүүлэх
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
