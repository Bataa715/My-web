
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProgrammingConcept } from '@/lib/types';

interface ConceptCardsProps {
  concepts: ProgrammingConcept[];
}

export default function ConceptCards({ concepts }: ConceptCardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Core Concepts</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        {concepts.map((concept) => (
          <Card key={concept.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">{concept.title}</CardTitle>
              <span className="text-2xl">{concept.emoji}</span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{concept.explanation}</p>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
