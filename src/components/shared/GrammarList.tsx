"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { GrammarRule } from "@/lib/types";

interface GrammarListProps {
  rules: GrammarRule[];
}

export default function GrammarList({ rules }: GrammarListProps) {
  return (
    <div className="space-y-4">
      {rules.map((rule, index) => (
        <Card key={index}>
            <CardHeader>
                <CardTitle>{rule.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">{rule.explanation}</p>
                <div>
                  <h4 className="font-semibold mb-2">Жишээ:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {rule.examples.map((example, i) => (
                      <li key={i} className="text-foreground/90">{example}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
        </Card>
      ))}
       {rules.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <p className="text-muted-foreground">Дүрэм олдсонгүй.</p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
