import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  const avatarImage = PlaceHolderImages.find(p => p.id === 'avatar');

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">🙋‍♂️ Хувийн танилцуулга</h1>
        <p className="text-muted-foreground">Миний тухай болон энэ сайтын зорилго.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 flex flex-col items-center text-center p-6">
          <CardHeader>
            {avatarImage && (
              <Image
                src={avatarImage.imageUrl}
                alt={avatarImage.description}
                width={128}
                height={128}
                className="rounded-full mx-auto mb-4 border-4 border-primary/20 shadow-md"
                data-ai-hint={avatarImage.imageHint}
              />
            )}
            <CardTitle className="text-2xl font-headline">A.I. Engineer</CardTitle>
            <p className="text-muted-foreground">Full-Stack Developer & UI/UX Designer</p>
          </CardHeader>
          <CardContent>
            <p>Технологид дуртай, тасралтгүй суралцагч.</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>🤔 Яагаад энэ сайтыг хийсэн бэ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p>
              Энэхүү вэбсайт нь миний хувийн суралцах үйл явцыг системчлэх, мэдлэгээ бататгах зорилгоор бүтээгдсэн. Англи, япон хэл, программчлалын чиглэлээр сурсан зүйлсээ нэг дор эмх цэгцтэйгээр тэмдэглэж, хянах нь надад илүү үр дүнтэй санагдсан.
            </p>
            <p>
              Мөн энэ төсөл нь миний React, Next.js, TypeScript, Tailwind CSS зэрэг технологиуд дээрх ур чадварыг сайжруулах практик ажил болж байгаа юм.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Миний сурах зорилгууд</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold">Англи хэл</h3>
                <p className="text-muted-foreground">Ярианы болон бичгийн чадвараа ахисан түвшинд хүргэх.</p>
              </div>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold">Япон хэл</h3>
                <p className="text-muted-foreground">JLPT N2 түвшинд хүрэх, өдөр тутмын харилцан ярианд чөлөөтэй оролцох.</p>
              </div>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold">Программчлал</h3>
                <p className="text-muted-foreground">Веб хөгжүүлэлтийн сүүлийн үеийн технологиудыг гүнзгийрүүлэн судлах.</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
