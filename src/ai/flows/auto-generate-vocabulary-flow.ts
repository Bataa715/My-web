'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratedWordSchema = z.object({
  word: z.string().describe('The English word.'),
  translation: z.string().describe('The Mongolian translation of the word.'),
  definition: z
    .string()
    .optional()
    .describe('A simple English definition of the word.'),
});

// Define the schema for the flow's input
const AutoGenerateVocabularyInputSchema = z.object({
  topic: z
    .string()
    .describe(
      'The topic or content area for vocabulary generation (e.g., "business", "travel", "technology")'
    ),
  count: z
    .number()
    .min(1)
    .max(50)
    .describe('Number of words to generate (1-50)'),
  level: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .optional()
    .describe('Difficulty level of the vocabulary'),
});
export type AutoGenerateVocabularyInput = z.infer<
  typeof AutoGenerateVocabularyInputSchema
>;

// Define the schema for the flow's output
const AutoGenerateVocabularyOutputSchema = z.object({
  words: z.array(GeneratedWordSchema),
});
export type AutoGenerateVocabularyOutput = z.infer<
  typeof AutoGenerateVocabularyOutputSchema
>;

const autoGenerateVocabularyPrompt = ai.definePrompt({
  name: 'autoGenerateVocabularyPrompt',
  input: { schema: AutoGenerateVocabularyInputSchema },
  output: { schema: AutoGenerateVocabularyOutputSchema },
  prompt: `
    You are a vocabulary teacher creating a word list for English learners.
    
    Generate exactly {{count}} English vocabulary words related to the topic: "{{topic}}"
    {{#if level}}
    Difficulty level: {{level}}
    - beginner: common, everyday words
    - intermediate: moderately complex words used in various contexts
    - advanced: sophisticated, academic, or specialized vocabulary
    {{/if}}

    Requirements:
    1. Each word must be unique and relevant to the topic.
    2. The 'word' field MUST be in English.
    3. The 'translation' field MUST be in Mongolian (accurate translation).
    4. The 'definition' field should be a concise, simple English definition.
    5. Words should be practical and useful for language learners.
    6. Include a mix of nouns, verbs, adjectives, and adverbs where appropriate.
    7. Avoid overly obscure or rarely used words unless the level is advanced.

    Return exactly {{count}} words as a JSON object following the output schema.
  `,
});

const autoGenerateVocabularyFlow = ai.defineFlow(
  {
    name: 'autoGenerateVocabularyFlow',
    inputSchema: AutoGenerateVocabularyInputSchema,
    outputSchema: AutoGenerateVocabularyOutputSchema,
  },
  async input => {
    const { output } = await autoGenerateVocabularyPrompt(input);
    if (!output) {
      throw new Error(
        'Failed to auto-generate vocabulary. The AI model did not return a valid output.'
      );
    }
    return output;
  }
);

// Export a wrapper function to be used as a server action
export async function autoGenerateVocabulary(
  input: AutoGenerateVocabularyInput
): Promise<AutoGenerateVocabularyOutput> {
  return autoGenerateVocabularyFlow(input);
}
