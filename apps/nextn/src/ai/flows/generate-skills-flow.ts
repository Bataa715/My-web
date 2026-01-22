'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSkillsInputSchema = z.object({
  category: z
    .string()
    .describe(
      'The category of skills to generate, e.g., "frontend frameworks", "programming languages", "database technologies".'
    ),
});
export type GenerateSkillsInput = z.infer<typeof GenerateSkillsInputSchema>;

const GenerateSkillsOutputSchema = z.object({
  skills: z
    .array(z.string())
    .describe('A list of skills related to the category.'),
});
export type GenerateSkillsOutput = z.infer<typeof GenerateSkillsOutputSchema>;

const generateSkillsPrompt = ai.definePrompt({
  name: 'generateSkillsPrompt',
  input: { schema: GenerateSkillsInputSchema },
  output: { schema: GenerateSkillsOutputSchema },
  prompt: `
    You are a technology expert and career coach.
    Based on the following category, generate a list of relevant skills.
    Category: {{category}}
    
    Return the skills as a simple JSON array of strings.
  `,
});

const generateSkillsFlow = ai.defineFlow(
  {
    name: 'generateSkillsFlow',
    inputSchema: GenerateSkillsInputSchema,
    outputSchema: GenerateSkillsOutputSchema,
  },
  async input => {
    const { output } = await generateSkillsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate skills from the AI model.');
    }
    return output;
  }
);

export async function generateSkills(
  input: GenerateSkillsInput
): Promise<GenerateSkillsOutput> {
  return generateSkillsFlow(input);
}
