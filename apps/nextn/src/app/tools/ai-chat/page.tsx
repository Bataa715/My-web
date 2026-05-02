'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ToolPageShell from '@/components/shared/ToolPageShell';
import {
  Bot,
  Send,
  User,
  ImagePlus,
  X,
  Loader2,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { askStudyAssistant } from '@/ai/flows/study-assistant-flow';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Сайн байна уу! 👋 Би таны хичээлийн туслах AI байна. Анагаах ухаан, биологи, математик болон бусад хичээлүүдтэй холбоотой асуултуудад хариулж өгөх болно. Зураг (жишээ нь: анатомийн зураг, бодлого) эсвэл текстээр асуултаа илгээнэ үү! 🏥🧬',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      image: selectedImage || undefined,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const recentMessages = messages.slice(-4);
      const context = recentMessages
        .map(m => `${m.role === 'user' ? 'Хэрэглэгч' : 'AI'}: ${m.content}`)
        .join('\n');

      const response = await askStudyAssistant({
        question: currentInput || 'Энэ зургийг тайлбарлана уу',
        imageBase64: currentImage || undefined,
        context: context || undefined,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Уучлаарай, алдаа гарлаа. Дахин оролдоно уу. 🙏',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <ToolPageShell
      title="AI Хичээлийн Туслах"
      description="Зураг эсвэл текстээр асуултаа илгээнэ үү"
      eyebrow="Хичээлийн туслах"
      icon={<Bot className="h-8 w-8" />}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'AI Chat' },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-4 pt-2">
        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Анагаах', icon: null },
            { label: 'Биологи', icon: <BookOpen className="h-3 w-3" /> },
            { label: 'Математик', icon: <GraduationCap className="h-3 w-3" /> },
            { label: 'Программчлал', icon: <BookOpen className="h-3 w-3" /> },
            { label: 'Англи хэл', icon: <GraduationCap className="h-3 w-3" /> },
          ].map(chip => (
            <Button
              key={chip.label}
              variant="outline"
              size="sm"
              className="rounded-full text-xs gap-1.5 hover:bg-primary/10 hover:border-primary/50"
              onClick={() => setInput(`${chip.label}ийн талаар тайлбарлана уу`)}
            >
              {chip.icon}
              {chip.label}
            </Button>
          ))}
        </div>

        {/* Chat Container */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-0">
            <ScrollArea
              className="h-[calc(100vh-380px)] min-h-[400px] p-4"
              ref={scrollAreaRef}
            >
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}

                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-3',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 border border-border/50'
                        )}
                      >
                        {message.image && (
                          <div className="mb-2 rounded-lg overflow-hidden">
                            <Image
                              src={message.image}
                              alt="Uploaded"
                              width={300}
                              height={200}
                              className="object-cover"
                            />
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <span className="text-[10px] opacity-50 mt-1 block">
                          {message.timestamp.toLocaleTimeString('mn-MN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {message.role === 'user' && (
                        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted/50 border border-border/50 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Бодож байна...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border/50 p-4">
              {selectedImage && (
                <div className="mb-3 relative inline-block">
                  <Image
                    src={selectedImage}
                    alt="Selected"
                    width={100}
                    height={100}
                    className="rounded-lg object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-5 w-5" />
                </Button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Асуултаа бичнэ үү..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className="shrink-0 bg-linear-to-r from-primary to-accent hover:opacity-90"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          AI туслах нь хичээлтэй холбоотой асуултуудад хариулах зориулалттай.
          Зураг болон текстээр асуулт илгээх боломжтой.
        </p>
      </div>
    </ToolPageShell>
  );
}
