'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CorrectTextInputSchema = z.object({
  text: z.string().describe('The text to be corrected.'),
});
export type CorrectTextInput = z.infer<typeof CorrectTextInputSchema>;

const CorrectTextOutputSchema = z.object({
  correction: z.string().describe('The corrected version of the text.'),
  explanation: z
    .string()
    .describe('A brief explanation of the corrections made.'),
});
export type CorrectTextOutput = z.infer<typeof CorrectTextOutputSchema>;

const correctTextPrompt = ai.definePrompt({
  name: 'correctTextPrompt',
  input: { schema: CorrectTextInputSchema },
  output: { schema: CorrectTextOutputSchema },
  prompt: `
    You are an expert English teacher.
    Please correct the following English text. Provide the corrected version and a simple, clear explanation of the changes you made.
    Focus on grammar, spelling, and punctuation.

    Text to correct:
    ---
    {{text}}
    ---
  `,
});

const correctTextFlow = ai.defineFlow(
  {
    name: 'correctTextFlow',
    inputSchema: CorrectTextInputSchema,
    outputSchema: CorrectTextOutputSchema,
  },
  async input => {
    const { output } = await correctTextPrompt(input);
    if (!output) {
      throw new Error('Failed to get a correction from the AI model.');
    }
    return output;
  }
);

export async function correctText(
  input: CorrectTextInput
): Promise<CorrectTextOutput> {
  return correctTextFlow(input);
}
