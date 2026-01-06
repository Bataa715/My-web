'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SpeakingPracticeInputSchema = z.object({
  topic: z.string().describe('The topic for speaking practice.'),
  level: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .default('intermediate'),
});
export type SpeakingPracticeInput = z.infer<typeof SpeakingPracticeInputSchema>;

const SpeakingPracticeOutputSchema = z.object({
  situation: z
    .string()
    .describe('A realistic situation description for role-play.'),
  situationMongolian: z.string().describe('Situation translated to Mongolian.'),
  dialogue: z
    .array(
      z.object({
        speaker: z.string().describe('Speaker A or Speaker B'),
        english: z.string().describe('The English line'),
        mongolian: z.string().describe('Mongolian translation'),
        pronunciation: z
          .string()
          .optional()
          .describe('Pronunciation tips if needed'),
      })
    )
    .describe('A sample dialogue for practice.'),
  keyPhrases: z
    .array(
      z.object({
        phrase: z.string(),
        meaning: z.string(),
        usage: z.string(),
      })
    )
    .describe('Useful phrases for this topic.'),
  pronunciationTips: z
    .array(
      z.object({
        word: z.string(),
        tip: z.string(),
        ipa: z.string().optional(),
      })
    )
    .describe('Words that might be difficult to pronounce.'),
  practiceQuestions: z
    .array(z.string())
    .describe('Questions the student should try to answer.'),
});
export type SpeakingPracticeOutput = z.infer<
  typeof SpeakingPracticeOutputSchema
>;

const speakingPracticePrompt = ai.definePrompt({
  name: 'speakingPracticePrompt',
  input: { schema: SpeakingPracticeInputSchema },
  output: { schema: SpeakingPracticeOutputSchema },
  prompt: `
    You are an expert English conversation teacher helping a Mongolian student practice speaking.
    Create comprehensive speaking practice materials for the given topic.

    Topic: {{topic}}
    Student Level: {{level}}

    Please provide:
    1. A realistic situation/scenario for role-play (2-3 sentences in English and Mongolian)
    2. A sample dialogue (6-10 exchanges) with:
       - Speaker labels (A/B)
       - English lines
       - Mongolian translations
       - Pronunciation tips for difficult words
    3. 5-8 key phrases useful for this topic with meanings and usage examples
    4. Pronunciation tips for 3-5 challenging words
    5. 4-6 practice questions the student should try answering out loud

    Make it natural, practical, and appropriate for the student's level.
    Focus on real-world usage and common expressions.
  `,
});

const speakingPracticeFlow = ai.defineFlow(
  {
    name: 'speakingPracticeFlow',
    inputSchema: SpeakingPracticeInputSchema,
    outputSchema: SpeakingPracticeOutputSchema,
  },
  async input => {
    const { output } = await speakingPracticePrompt(input);
    if (!output) {
      throw new Error('Failed to generate speaking practice.');
    }
    return output;
  }
);

export async function generateSpeakingPractice(
  input: SpeakingPracticeInput
): Promise<SpeakingPracticeOutput> {
  return speakingPracticeFlow(input);
}
