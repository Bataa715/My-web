"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Kana } from "@/lib/types";

interface KanaGridProps {
  kana: Kana[];
  title: string;
  storageKey: string;
}

export default function KanaGrid({ kana, title, storageKey }: KanaGridProps) {
  const [memorized, setMemorized] = useLocalStorage<string[]>(storageKey, []);

  const toggleMemorized = (character: string) => {
    setMemorized(prev =>
      prev.includes(character)
        ? prev.filter(c => c !== character)
        : [...prev, character]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Үсэг дээр дарж цээжилснээ тэмдэглээрэй.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 text-center">
          {kana.map(k => (
            <Button
              key={k.character}
              variant="outline"
              onClick={() => toggleMemorized(k.character)}
              className={cn(
                "h-20 flex flex-col transition-all duration-200 font-jp",
                memorized.includes(k.character)
                  ? "bg-primary/20 text-primary-foreground border-primary"
                  : "bg-card"
              )}
            >
              <span className="text-3xl">{k.character}</span>
              <span className="text-xs text-muted-foreground">{k.romaji}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
