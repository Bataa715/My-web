"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { GrammarRule } from "@/lib/types";

interface GrammarListProps {
  rules: GrammarRule[];
}

export default function GrammarList({ rules }: GrammarListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Дүрэм цээжлэх</CardTitle>
        <CardDescription>Түгээмэл дүрмүүд, тайлбар, жишээ өгүүлбэрүүд.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {rules.map((rule, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{rule.title}</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">{rule.explanation}</p>
                <div>
                  <h4 className="font-semibold mb-2">Жишээ:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {rule.examples.map((example, i) => (
                      <li key={i} className="text-foreground/90">{example}</li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
