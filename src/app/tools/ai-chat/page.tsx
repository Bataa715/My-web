'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import BackButton from '@/components/shared/BackButton';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import {
  Bot,
  Send,
  User,
  ImagePlus,
  X,
  Loader2,
  Sparkles,
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    setImageFile(null);
    setIsLoading(true);

    try {
      // Build conversation context from last few messages
      const recentMessages = messages.slice(-4);
      const context = recentMessages
        .map(m => `${m.role === 'user' ? 'Хэрэглэгч' : 'AI'}: ${m.content}`)
        .join('\n');

      // Call actual AI
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-screen"
    >
      <InteractiveParticles className="fixed inset-0 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <BackButton />

        {/* Hero Section */}
        <div className="text-center pt-4 pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-4"
          >
            <Bot className="h-4 w-4" />
            <span className="text-sm font-medium">Хичээлийн туслах</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            AI Хичээлийн Туслах
          </h1>
          <p className="text-muted-foreground">
            Зураг эсвэл текстээр асуултаа илгээнэ үү
          </p>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: 'Анагаах', icon: <Sparkles className="h-3 w-3" /> },
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
            {/* Messages */}
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
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
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
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
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

            {/* Input Area */}
            <div className="border-t border-border/50 p-4">
              {/* Selected Image Preview */}
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
                  className="flex-shrink-0"
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
                  className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
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

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          AI туслах нь хичээлтэй холбоотой асуултуудад хариулах зориулалттай.
          Зураг болон текстээр асуулт илгээх боломжтой.
        </p>
      </div>
    </motion.div>
  );
}
