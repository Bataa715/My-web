'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ToolPageShell from '@/components/shared/ToolPageShell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Link,
  Wand2,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LineChart,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeChart } from '@/ai/flows/analyze-chart-flow';
import { superAnalyzeChart } from '@/ai/flows/super-analyze-chart-flow';
import type { ChartAnalysisOutput } from '@/ai/flows/analyze-chart-flow';
import type { SuperChartAnalysisOutput } from '@/ai/flows/super-analyze-chart-flow';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

export default function TraderAiPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ChartAnalysisOutput | null>(null);
  const [superAnalysisResult, setSuperAnalysisResult] = useState<SuperChartAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuperLoading, setIsSuperLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null);
    setPreviewUrl(url);
  };

  const getDataUri = async (): Promise<string | null> => {
    if (imageFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    } else if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch {
        toast({ title: 'Алдаа', description: 'Зургийн холбоосоос зураг татахад алдаа гарлаа.', variant: 'destructive' });
        return null;
      }
    }
    toast({ title: 'Зураг оруулаагүй байна', description: 'Шинжилгээ хийхийн тулд зураг оруулна уу.', variant: 'destructive' });
    return null;
  };

  const handleAnalyze = async () => {
    const dataUri = await getDataUri();
    if (!dataUri) return;
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeChart({ imageDataUri: dataUri });
      setAnalysisResult(result);
    } catch {
      toast({ title: 'Алдаа', description: 'AI шинжилгээ хийхэд алдаа гарлаа.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuperAnalyze = async () => {
    const dataUri = await getDataUri();
    if (!dataUri) return;
    setIsSuperLoading(true);
    setSuperAnalysisResult(null);
    try {
      const result = await superAnalyzeChart({ imageDataUri: dataUri });
      setSuperAnalysisResult(result);
    } catch {
      toast({ title: 'Алдаа', description: 'Super шинжилгээ хийхэд алдаа гарлаа.', variant: 'destructive' });
    } finally {
      setIsSuperLoading(false);
    }
  };

  const SignalCard = ({ signal }: { signal: 'BUY' | 'SELL' | 'HOLD' }) => {
    const config = {
      BUY: { icon: <TrendingUp className="h-6 w-6" />, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', text: 'Авах' },
      SELL: { icon: <TrendingDown className="h-6 w-6" />, color: 'text-destructive', bgColor: 'bg-destructive/10', borderColor: 'border-destructive/30', text: 'Зарах' },
      HOLD: { icon: <ArrowRight className="h-6 w-6" />, color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', text: 'Хүлээх' },
    };
    const { icon, color, bgColor, borderColor, text } = config[signal];
    return (
      <Card className={cn('text-center border-2 backdrop-blur-xs', bgColor, borderColor)}>
        <CardContent className="p-6">
          <div className={cn('mx-auto h-16 w-16 rounded-full flex items-center justify-center', bgColor)}>
            <span className={color}>{icon}</span>
          </div>
          <p className={cn('text-3xl font-bold mt-3', color)}>{text}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <ToolPageShell
      title="TraderAi"
      description="Алтны (XAU/USD) ханшийн зураг оруулаад, AI-аар техник шинжилгээ хийлгээрэй"
      eyebrow="AI Chart Analysis"
      icon={<LineChart className="h-8 w-8" />}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'TraderAi' },
      ]}
    >
      <div className="space-y-8 pt-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="max-w-4xl mx-auto relative bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full opacity-20 blur-3xl" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Зураг оруулах</CardTitle>
                  <CardDescription>Шинжлэх зургаа доорх талбарт оруулна уу.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="relative border-2 border-dashed border-primary/30 hover:border-primary/50 rounded-2xl p-4 h-60 sm:h-80 flex items-center justify-center text-center transition-colors bg-background/30">
                {previewUrl ? (
                  <Image src={previewUrl} alt="Chart preview" fill sizes="(max-width: 640px) 100vw, 600px" className="object-contain rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <p className="font-medium">Зургаа энд чирч оруулна уу</p>
                    <p className="text-xs text-muted-foreground/70">эсвэл дарж сонгоно уу</p>
                  </div>
                )}
                <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <div className="relative flex items-center gap-2">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="image-url" type="text" placeholder="Эсвэл зургийн холбоос (URL) буулгах" value={imageUrl} onChange={handleUrlChange} className="pl-10" />
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-primary mb-2">Нэгтгэсэн үр дүн</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    5 аргын орох/гарах цэгүүдийг харьцуулна<br />
                    Санал нийлсэн хувь тооцоолно<br />
                    Хамгийн сайн нийлсэн түвшнүүдийг гаргана
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {['Traditional', 'ICT / SMC', 'Wyckoff', 'Elliott Wave', 'Fibonacci'].map(m => (
                      <div key={m} className="px-2 py-1 bg-background/50 rounded text-center">{m}</div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-500 mt-3">8 кредит зарцуулна. Pro/Premium багцад.</p>
                </CardContent>
              </Card>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleAnalyze} disabled={isLoading || isSuperLoading || (!imageFile && !imageUrl)} variant="outline" className="flex-1">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Шинжилгээ хийх
                </Button>
                <Button onClick={handleSuperAnalyze} disabled={isLoading || isSuperLoading || (!imageFile && !imageUrl)} className="flex-1 bg-primary text-primary-foreground">
                  {isSuperLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Шинэ шинжилгээ
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isLoading && (
          <div className="text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">AI дүн шинжилгээ хийж байна...</p>
          </div>
        )}

        {analysisResult && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Дүн шинжилгээний үр дүн</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SignalCard signal={analysisResult.signal} />
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <ShieldCheck /> Итгэлцэл
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-center">{analysisResult.confidence}%</p>
                    <Progress value={analysisResult.confidence} className="mt-2 h-2" />
                  </CardContent>
                </Card>
                <div className="grid grid-rows-2 gap-2">
                  <Card className="bg-destructive/10">
                    <CardContent className="p-3 text-center">
                      <p className="text-sm text-destructive">Stop-Loss</p>
                      <p className="text-xl font-bold text-destructive">${analysisResult.suggestedStopLoss}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-emerald-500/10">
                    <CardContent className="p-3 text-center">
                      <p className="text-sm text-emerald-500">Take-Profit</p>
                      <p className="text-xl font-bold text-emerald-400">${analysisResult.suggestedTakeProfit}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Дэлгэрэнгүй шинжилгээ</h3>
                <div className="p-4 bg-muted/50 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                  <p>{analysisResult.analysis}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isSuperLoading && (
          <div className="text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">5 аргаар шинжилгээ хийж байна...</p>
          </div>
        )}

        {superAnalysisResult && (
          <Card className="max-w-4xl mx-auto bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Super шинжилгээний үр дүн</CardTitle>
                  <CardDescription>5 аргаар нэгтгэсэн зөвлөмж</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className={cn('border-2', superAnalysisResult.unified.direction === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-destructive/10 border-destructive/30')}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn('p-3 rounded-full', superAnalysisResult.unified.direction === 'BUY' ? 'bg-emerald-500/20' : 'bg-destructive/20')}>
                        {superAnalysisResult.unified.direction === 'BUY'
                          ? <TrendingUp className="h-8 w-8 text-emerald-500" />
                          : <TrendingDown className="h-8 w-8 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Нэгтгэсэн чиглэл</p>
                        <p className={cn('text-3xl font-bold', superAnalysisResult.unified.direction === 'BUY' ? 'text-emerald-500' : 'text-destructive')}>
                          {superAnalysisResult.unified.direction === 'BUY' ? 'АВАХ (BUY)' : 'ЗАРАХ (SELL)'}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Санал нийлсэн</p>
                      <p className="text-2xl font-bold text-primary">{superAnalysisResult.unified.consensusRatio} арга</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Орох үнэ</p>
                      <p className="text-xl font-bold">{superAnalysisResult.unified.entryPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-3 bg-destructive/10 rounded-lg">
                      <p className="text-xs text-destructive">Stop Loss</p>
                      <p className="text-xl font-bold text-destructive">{superAnalysisResult.unified.stopLoss.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
                      <p className="text-xs text-emerald-500">TP1</p>
                      <p className="text-xl font-bold text-emerald-500">{superAnalysisResult.unified.takeProfit1.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
                      <p className="text-xs text-emerald-500">TP2</p>
                      <p className="text-xl font-bold text-emerald-500">{superAnalysisResult.unified.takeProfit2.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-lg font-semibold mb-4">Арга тус бүрийн үр дүн:</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Traditional', data: superAnalysisResult.traditional },
                    { name: 'ICT/SMC', data: superAnalysisResult.ictSmc },
                    { name: 'Wyckoff', data: superAnalysisResult.wyckoff },
                    { name: 'Elliott', data: superAnalysisResult.elliottWave },
                    { name: 'Fibonacci', data: superAnalysisResult.fibonacci },
                  ].map(method => (
                    <Card key={method.name} className="bg-background/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium min-w-[100px]">{method.name}</span>
                            <Badge
                              variant={method.data.signal === 'BUY' ? 'default' : method.data.signal === 'SELL' ? 'destructive' : 'secondary'}
                              className={cn('min-w-[50px] justify-center', method.data.signal === 'BUY' && 'bg-emerald-500 hover:bg-emerald-600')}
                            >
                              {method.data.signal}
                            </Badge>
                            {method.data.signal === superAnalysisResult.unified.direction && (
                              <Check className="h-4 w-4 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">Entry: <span className="text-foreground font-mono">{method.data.entry.toFixed(2)}</span></span>
                            <span className="text-muted-foreground">Conf: <span className="text-foreground">{method.data.confidence}%</span></span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Нэгдсэн дүгнэлт</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">{superAnalysisResult.unified.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="max-w-4xl mx-auto w-full py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Арилжааны гарын авлага</h2>
            <p className="text-muted-foreground">Техник шинжилгээний үндсэн ойлголтууд.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[
              { value: 'item-1', title: 'Техник шинжилгээний үндэс', content: 'Техник шинжилгээ гэдэг нь ирээдүйн ханшийн хөдөлгөөнийг таамаглахын тулд өнгөрсөн үеийн ханшийн мэдээлэл, арилжааны эзлэхүүн зэргийг судалдаг арга юм.' },
              { value: 'item-2', title: 'Дэмжих ба Эсэргүүцэх түвшин', content: 'Дэмжих түвшин (Support): Эрэлт нийлүүлэлтээсээ ихсэж, ханшийн уналтыг зогсоодог цэгийг хэлнэ. Эсэргүүцэх түвшин (Resistance): Нийлүүлэлт эрэлтээсээ давж, ханшийн өсөлтийг зогсоодог цэгийг хэлнэ.' },
              { value: 'item-3', title: 'Тренд ба Трендийн шугам', content: '"The trend is your friend" буюу "Тренд бол чиний найз" гэдэг зарчмын дагуу трендийн дагуу арилжаа хийх нь эрсдэл багатай байдаг.' },
              { value: 'item-4', title: 'Канделстик патерн', content: 'Канделстик нь тухайн цаг хугацааны ханшийн нээлт, хаалт, оргил, ёроолын цэгийг харуулдаг. Doji, Hammer, Engulfing, Head and Shoulders гэх мэт олон төрлийн патерн байдаг.' },
              { value: 'item-5', title: 'Эрсдэлийн удирдлага', content: 'Stop-Loss: Болзошгүй алдагдлыг хязгаарлахын тулд арилжааг автоматаар хаах үнэ. Take-Profit: Төлөвлөсөн ашгийн хэмжээнд хүрэх үед арилжааг автоматаар хаах үнэ. Арилжаа бүрт нийт хөрөнгийнхөө 1-2%-иас илүүг эрсдэлд оруулахгүй байх.' },
            ].map(item => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </ToolPageShell>
  );
}
