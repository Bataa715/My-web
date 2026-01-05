'use client';

import BackButton from '@/components/shared/BackButton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-8">
      <BackButton />
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Card className="w-full max-w-lg text-center bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Construction className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Энэ хуудас одоогоор хийгдэж байна. Удахгүй ашиглалтад орно.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
