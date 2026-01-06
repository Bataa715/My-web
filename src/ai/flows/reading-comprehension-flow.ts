'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const QuestionSchema = z.object({
  question: z.string().describe('A comprehension question about the text.'),
  options: z.array(z.string()).length(4).describe('Four possible answers.'),
  correctAnswer: z.string().describe('The correct answer.'),
  explanation: z.string().describe('Why this answer is correct.'),
});

const ReadingComprehensionInputSchema = z.object({
  text: z.string().describe('The English text to analyze.'),
  level: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .default('intermediate'),
});
export type ReadingComprehensionInput = z.infer<
  typeof ReadingComprehensionInputSchema
>;

const ReadingComprehensionOutputSchema = z.object({
  summary: z
    .string()
    .describe('A brief summary of the text in simple English.'),
  summaryMongolian: z.string().describe('The summary translated to Mongolian.'),
  keyVocabulary: z
    .array(
      z.object({
        word: z.string(),
        definition: z.string(),
        mongolian: z.string(),
        exampleSentence: z.string(),
      })
    )
    .describe('Important vocabulary words from the text.'),
  questions: z.array(QuestionSchema).describe('Comprehension questions.'),
  grammarPoints: z
    .array(
      z.object({
        pattern: z.string().describe('The grammar pattern found.'),
        explanation: z.string().describe('Explanation in Mongolian.'),
        example: z.string().describe('Example from the text.'),
      })
    )
    .describe('Grammar patterns used in the text.'),
});
export type ReadingComprehensionOutput = z.infer<
  typeof ReadingComprehensionOutputSchema
>;

const readingComprehensionPrompt = ai.definePrompt({
  name: 'readingComprehensionPrompt',
  input: { schema: ReadingComprehensionInputSchema },
  output: { schema: ReadingComprehensionOutputSchema },
  prompt: `
    You are an expert English teacher helping a Mongolian student learn English through reading.
    Analyze the following text and create comprehensive learning materials.

    Student Level: {{level}}
    
    Text to analyze:
    ---
    {{text}}
    ---

    Please provide:
    1. A brief summary in simple English (2-3 sentences)
    2. The same summary translated to Mongolian
    3. 5-8 key vocabulary words with:
       - The English word
       - Simple English definition
       - Mongolian translation
       - Example sentence from or related to the text
    4. 3-5 comprehension questions (multiple choice with 4 options)
    5. 2-3 grammar patterns found in the text with explanations in Mongolian

    Make explanations clear and helpful for a Mongolian learner.
  `,
});

const readingComprehensionFlow = ai.defineFlow(
  {
    name: 'readingComprehensionFlow',
    inputSchema: ReadingComprehensionInputSchema,
    outputSchema: ReadingComprehensionOutputSchema,
  },
  async input => {
    const { output } = await readingComprehensionPrompt(input);
    if (!output) {
      throw new Error('Failed to analyze text.');
    }
    return output;
  }
);

export async function analyzeReadingText(
  input: ReadingComprehensionInput
): Promise<ReadingComprehensionOutput> {
  return readingComprehensionFlow(input);
}
