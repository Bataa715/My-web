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
export type GeneratedWord = z.infer<typeof GeneratedWordSchema>;

// Define the schema for the flow's input
const GenerateVocabularyInputSchema = z.object({
  text: z
    .string()
    .describe(
      'A block of raw text containing English words, their Mongolian translations, and possibly definitions. The format can be messy, like copied from a PDF or website.'
    ),
});
export type GenerateVocabularyInput = z.infer<
  typeof GenerateVocabularyInputSchema
>;

// Define the schema for the flow's output
const GenerateVocabularyOutputSchema = z.object({
  words: z.array(GeneratedWordSchema),
});
export type GenerateVocabularyOutput = z.infer<
  typeof GenerateVocabularyOutputSchema
>;

const generateVocabularyPrompt = ai.definePrompt({
  name: 'generateVocabularyPrompt',
  input: { schema: GenerateVocabularyInputSchema },
  output: { schema: GenerateVocabularyOutputSchema },
  prompt: `
    You are a linguistic assistant specialized in parsing text to build vocabulary lists.
    The user will provide a block of text containing English words and their Mongolian translations.
    The text might be messy, poorly formatted, or copied from various sources.

    Your task is to analyze the following text, identify each English word, its corresponding Mongolian translation, and a simple English definition if available or inferrable.

    Rules:
    1. Extract every possible word pair.
    2. The 'word' field MUST be in English.
    3. The 'translation' field MUST be in Mongolian.
    4. The 'definition' field should be a concise, simple English definition. If no definition is present in the source text, generate a suitable one.
    5. Return the result as a JSON object that strictly follows the output schema.

    Text to process:
    ---
    {{text}}
    ---
  `,
});

const generateVocabularyFlow = ai.defineFlow(
  {
    name: 'generateVocabularyFlow',
    inputSchema: GenerateVocabularyInputSchema,
    outputSchema: GenerateVocabularyOutputSchema,
  },
  async input => {
    const { output } = await generateVocabularyPrompt(input);
    if (!output) {
      throw new Error(
        'Failed to generate vocabulary. The AI model did not return a valid output.'
      );
    }
    return output;
  }
);

// Export a wrapper function to be used as a server action
export async function generateVocabulary(
  input: GenerateVocabularyInput
): Promise<GenerateVocabularyOutput> {
  return generateVocabularyFlow(input);
}
