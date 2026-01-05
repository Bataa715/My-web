'use client';

import { useState } from 'react';
import BackButton from '@/components/shared/BackButton';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeChart } from '@/ai/flows/analyze-chart-flow';
import type { ChartAnalysisOutput } from '@/ai/flows/analyze-chart-flow';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function TraderAiPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<ChartAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(''); // Clear URL input if a file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null); // Clear file input if a URL is entered
    setPreviewUrl(url);
  };

  const handleAnalyze = async () => {
    let dataUri = '';
    if (imageFile) {
      dataUri = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    } else if (imageUrl) {
      // Simple proxy to fetch image and convert to data URI
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        dataUri = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error fetching image from URL:', error);
        toast({
          title: 'Алдаа',
          description: 'Зургийн холбоосоос зураг татахад алдаа гарлаа.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      toast({
        title: 'Зураг оруулаагүй байна',
        description: 'Шинжилгээ хийхийн тулд зураг оруулна уу.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeChart({ imageDataUri: dataUri });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing chart:', error);
      toast({
        title: 'Алдаа',
        description: 'AI шинжилгээ хийхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SignalCard = ({ signal }: { signal: 'BUY' | 'SELL' | 'HOLD' }) => {
    const config = {
      BUY: {
        icon: <TrendingUp />,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        text: 'Авах',
      },
      SELL: {
        icon: <TrendingDown />,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        text: 'Зарах',
      },
      HOLD: {
        icon: <ArrowRight />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        text: 'Хүлээх',
      },
    };
    const { icon, color, bgColor, text } = config[signal];
    return (
      <Card className={cn('text-center', bgColor)}>
        <CardContent className="p-4">
          <div
            className={cn(
              'mx-auto h-12 w-12 rounded-full flex items-center justify-center',
              bgColor
            )}
          >
            <span className={color}>{icon}</span>
          </div>
          <p className={cn('text-2xl font-bold mt-2', color)}>{text}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold">TraderAi</h1>
        <p className="mt-2 text-muted-foreground">
          Алтны (XAU/USD) ханшийн зураг оруулаад, AI-аар техник шинжилгээ
          хийлгээрэй.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Зураг оруулах</CardTitle>
          <CardDescription>
            Шинжлэх зургаа доорх талбарт оруулна уу.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 h-60 sm:h-80 flex items-center justify-center text-center">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Chart preview"
                fill
                className="object-contain rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-10 w-10" />
                <p>Зургаа энд чирч оруулна уу</p>
                <p className="text-xs">эсвэл дарж сонгоно уу</p>
              </div>
            )}
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="relative flex items-center gap-2">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="image-url"
              type="text"
              placeholder="Эсвэл зургийн холбоос (URL) буулгах"
              value={imageUrl}
              onChange={handleUrlChange}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || (!imageFile && !imageUrl)}
            className="w-full mt-4"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Шинжилгээ хийх
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">
            AI дүн шинжилгээ хийж байна...
          </p>
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
                  <p className="text-4xl font-bold text-center">
                    {analysisResult.confidence}%
                  </p>
                  <Progress
                    value={analysisResult.confidence}
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>
              <div className="grid grid-rows-2 gap-2">
                <Card className="bg-red-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-red-400">Stop-Loss</p>
                    <p className="text-xl font-bold text-red-300">
                      ${analysisResult.suggestedStopLoss}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-green-400">Take-Profit</p>
                    <p className="text-xl font-bold text-green-300">
                      ${analysisResult.suggestedTakeProfit}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Дэлгэрэнгүй шинжилгээ
              </h3>
              <div className="p-4 bg-muted/50 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                <p>{analysisResult.analysis}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="max-w-4xl mx-auto w-full py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Арилжааны гарын авлага
          </h2>
          <p className="text-muted-foreground">
            Техник шинжилгээний үндсэн ойлголтууд.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Техник шинжилгээний үндэс</AccordionTrigger>
            <AccordionContent>
              Техник шинжилгээ гэдэг нь ирээдүйн ханшийн хөдөлгөөнийг
              таамаглахын тулд өнгөрсөн үеийн ханшийн мэдээлэл, арилжааны
              эзлэхүүн зэргийг судалдаг арга юм. Энэ нь "түүх давтагддаг" гэсэн
              зарчимд үндэслэдэг. Гол хэрэгслүүд нь трендийн шугам, дэмжих ба
              эсэргүүцэх түвшин, канделстик патерн, мөн төрөл бүрийн
              индикаторууд юм.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              Дэмжих ба Эсэргүүцэх түвшин (Support & Resistance)
            </AccordionTrigger>
            <AccordionContent>
              <p>
                <strong>Дэмжих түвшин (Support):</strong> Эрэлт нийлүүлэлтээсээ
                ихсэж, ханшийн уналтыг зогсоодог цэгийг хэлнэ. Энэ түвшинд
                худалдан авах сонирхол ихэсдэг.
              </p>
              <p className="mt-2">
                <strong>Эсэргүүцэх түвшин (Resistance):</strong> Нийлүүлэлт
                эрэлтээсээ давж, ханшийн өсөлтийг зогсоодог цэгийг хэлнэ. Энэ
                түвшинд худалдах сонирхол ихэсдэг.
              </p>
              <p className="mt-2">
                Эдгээр түвшнүүд эвдэгдэх үед ханш ихэвчлэн хүчтэй хөдөлгөөн
                хийдэг. Жишээ нь, эсэргүүцэх түвшинг эвдэж дээшилбэл энэ нь
                цаашид өсөх дохио болдог.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              Тренд ба Трендийн шугам (Trend & Trendlines)
            </AccordionTrigger>
            <AccordionContent>
              <p>
                <strong>Тренд:</strong> Зах зээлийн ерөнхий чиглэлийг тренд
                гэнэ. Өсөх (Uptrend), унах (Downtrend), хэвтээ (Sideways/Range)
                гэсэн 3 төрөлтэй.
              </p>
              <p className="mt-2">
                <strong>Өсөх тренд:</strong> Ханшийн оргилууд (highs) болон
                ёроолууд (lows) нь тасралтгүй дээшилж байвал. Трендийн шугамыг
                ёроолуудыг холбож зурна.
              </p>
              <p className="mt-2">
                <strong>Унах тренд:</strong> Ханшийн оргилууд болон ёроолууд нь
                тасралтгүй доошилж байвал. Трендийн шугамыг оргилуудыг холбож
                зурна.
              </p>
              <p className="mt-2">
                "The trend is your friend" буюу "Тренд бол чиний найз" гэдэг
                зарчмын дагуу трендийн дагуу арилжаа хийх нь эрсдэл багатай
                байдаг.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>
              Канделстик патерн (Candlestick Patterns)
            </AccordionTrigger>
            <AccordionContent>
              Канделстик (лаа) нь тухайн цаг хугацааны ханшийн нээлт, хаалт,
              оргил, ёроолын цэгийг харуулдаг. Ганц болон хэд хэдэн лаа нийлж
              үүсгэсэн хэлбэрүүд (патерн) нь ирээдүйн ханшийн хөдөлгөөнийг
              таамаглах дохио болдог. Жишээ нь: Doji, Hammer, Engulfing, Head
              and Shoulders гэх мэт олон төрлийн патерн байдаг.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>
              Эрсдэлийн удирдлага (Risk Management)
            </AccordionTrigger>
            <AccordionContent>
              <p>
                Амжилттай арилжааны хамгийн чухал хэсэг бол эрсдэлийн удирдлага
                юм.
              </p>
              <p className="mt-2">
                <strong>Stop-Loss (SL):</strong> Болзошгүй алдагдлыг
                хязгаарлахын тулд арилжааг автоматаар хаах үнэ. Энэ нь таны
                таамаглал буруу байсан тохиолдолд их хэмжээний алдагдал
                хүлээхээс сэргийлнэ.
              </p>
              <p className="mt-2">
                <strong>Take-Profit (TP):</strong> Төлөвлөсөн ашгийн хэмжээнд
                хүрэх үед арилжааг автоматаар хаах үнэ. Энэ нь зах зээл буцаж
                эргэхээс өмнө ашгаа баталгаажуулахад тусална.
              </p>
              <p className="mt-2">
                Ерөнхий дүрэм бол арилжаа бүрт нийт хөрөнгийнхөө 1-2%-иас илүүг
                эрсдэлд оруулахгүй байх явдал юм.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
