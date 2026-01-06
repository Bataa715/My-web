'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ListeningPracticeInputSchema = z.object({
  topic: z.string().describe('The topic for listening practice.'),
  level: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .default('intermediate'),
});
export type ListeningPracticeInput = z.infer<
  typeof ListeningPracticeInputSchema
>;

const ListeningPracticeOutputSchema = z.object({
  script: z.string().describe('The listening script/passage.'),
  scriptMongolian: z.string().describe('Mongolian translation of the script.'),
  keyVocabulary: z
    .array(
      z.object({
        word: z.string(),
        pronunciation: z.string(),
        meaning: z.string(),
      })
    )
    .describe('Vocabulary that appears in the script.'),
  listeningTips: z
    .array(z.string())
    .describe('Tips for understanding the audio.'),
  comprehensionQuestions: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
        questionMongolian: z.string(),
      })
    )
    .describe('Questions to check understanding.'),
  fillInBlanks: z
    .array(
      z.object({
        sentence: z.string().describe('Sentence with blank marked as ___'),
        answer: z.string(),
        hint: z.string().optional(),
      })
    )
    .describe('Fill in the blank exercises.'),
});
export type ListeningPracticeOutput = z.infer<
  typeof ListeningPracticeOutputSchema
>;

const listeningPracticePrompt = ai.definePrompt({
  name: 'listeningPracticePrompt',
  input: { schema: ListeningPracticeInputSchema },
  output: { schema: ListeningPracticeOutputSchema },
  prompt: `
    You are an expert English listening teacher helping a Mongolian student improve their listening skills.
    Create comprehensive listening practice materials for the given topic.

    Topic: {{topic}}
    Student Level: {{level}}

    Please provide:
    1. A listening script/passage (150-250 words for intermediate level)
       - Make it sound natural and conversational
       - Include common expressions and idioms appropriate for the level
    2. Mongolian translation of the script
    3. 6-10 key vocabulary words with pronunciation guides and meanings
    4. 3-5 listening tips specific to this content
    5. 4-6 comprehension questions with answers (in both English and Mongolian)
    6. 4-6 fill-in-the-blank exercises based on the script

    The content should be engaging and practical for everyday situations.
    Include natural speech patterns and common contractions.
  `,
});

const listeningPracticeFlow = ai.defineFlow(
  {
    name: 'listeningPracticeFlow',
    inputSchema: ListeningPracticeInputSchema,
    outputSchema: ListeningPracticeOutputSchema,
  },
  async input => {
    const { output } = await listeningPracticePrompt(input);
    if (!output) {
      throw new Error('Failed to generate listening practice.');
    }
    return output;
  }
);

export async function generateListeningPractice(
  input: ListeningPracticeInput
): Promise<ListeningPracticeOutput> {
  return listeningPracticeFlow(input);
}
