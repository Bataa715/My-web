"use client";

import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ProgressItem } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

interface ProgressTrackerProps {
  initialItems: ProgressItem[];
}

export default function ProgressTracker({ initialItems }: ProgressTrackerProps) {
  const [items, setItems] = useLocalStorage<ProgressItem[]>('programming-progress', initialItems);

  const handleToggle = (id: string, key: 'learned' | 'practicing') => {
    setItems(
      items.map(item =>
        item.id === id ? { ...item, [key]: !item[key] } : item
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracker</CardTitle>
        <CardDescription>Суралцсан болон дадлагажиж буй сэдвүүдээ тэмдэглэх.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`learned-${item.id}`}
                      checked={item.learned}
                      onCheckedChange={() => handleToggle(item.id!, 'learned')}
                    />
                    <Label htmlFor={`learned-${item.id}`} className="text-sm text-muted-foreground">
                      Сурсан
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`practicing-${item.id}`}
                      checked={item.practicing}
                      onCheckedChange={() => handleToggle(item.id!, 'practicing')}
                    />
                    <Label htmlFor={`practicing-${item.id}`} className="text-sm text-muted-foreground">
                      Дадлагажиж буй
                    </Label>
                  </div>
                </div>
              </div>
              {index < items.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
