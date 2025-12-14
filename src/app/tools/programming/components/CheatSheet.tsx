"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cheatSheetItems } from '@/lib/data';
import { Copy, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function CheatSheet() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    toast({ title: "Copied to clipboard!" });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cheat Sheet</CardTitle>
        <CardDescription>Хэрэгтэй кодны хэсгүүд болон syntax.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cheatSheetItems.map((item) => (
          <div key={item.id} className="rounded-md border bg-muted/50">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="font-semibold text-sm font-code">{item.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(item.snippet, item.id)}
              >
                {copiedId === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto font-code">
              <code>{item.snippet}</code>
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
