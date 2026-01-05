'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for a single Multiple Choice Question
const MCQSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z
    .array(z.string())
    .min(3)
    .max(4)
    .describe('An array of 3 to 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options.'),
  explanation: z
    .string()
    .describe('A brief explanation of why the answer is correct.'),
});

// Define the schema for a single Writing Task
const WritingTaskSchema = z.object({
  instruction: z
    .string()
    .describe(
      'The instruction for the user (e.g., "Translate this sentence", "Rewrite this sentence in the negative form").'
    ),
  exampleAnswer: z.string().describe('An example of a correct answer.'),
});

// Define the schema for the flow's input
const GenerateExercisesInputSchema = z.object({
  ruleTitle: z.string().describe('The title of the grammar rule.'),
  ruleIntroduction: z
    .string()
    .describe('A brief introduction to the grammar rule.'),
  numMCQ: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe('The number of multiple-choice questions to generate.'),
  numWriting: z
    .number()
    .int()
    .min(0)
    .max(5)
    .describe('The number of writing tasks to generate.'),
});
export type GenerateExercisesInput = z.infer<
  typeof GenerateExercisesInputSchema
>;

// Define the schema for the flow's output
const GenerateExercisesOutputSchema = z.object({
  multipleChoiceQuestions: z.array(MCQSchema),
  writingTasks: z.array(WritingTaskSchema),
});
export type GenerateExercisesOutput = z.infer<
  typeof GenerateExercisesOutputSchema
>;

// Define the prompt for the AI
const generateExercisesPrompt = ai.definePrompt({
  name: 'generateExercisesPrompt',
  input: { schema: GenerateExercisesInputSchema },
  output: { schema: GenerateExercisesOutputSchema },
  prompt: `
    You are an expert English teacher creating exercises for a student.
    Based on the following grammar rule, generate a set of practice questions.

    Grammar Rule Title: {{ruleTitle}}
    Introduction: {{ruleIntroduction}}

    Please generate exactly {{numMCQ}} multiple-choice questions and {{numWriting}} writing tasks.
    
    For multiple-choice questions:
    - The question should be clear and test the specific grammar rule.
    - Provide 3 or 4 distinct options.
    - One option must be clearly correct.
    - The explanation should be simple and directly reference the grammar rule.

    For writing tasks:
    - The instruction should be a simple command, like rewriting a sentence or creating a new one.
    - The example answer should be a correct and natural-sounding sentence.

    Ensure the generated content is in the JSON format specified by the output schema.
  `,
});

// Define the main flow
const generateExercisesFlow = ai.defineFlow(
  {
    name: 'generateExercisesFlow',
    inputSchema: GenerateExercisesInputSchema,
    outputSchema: GenerateExercisesOutputSchema,
  },
  async input => {
    const { output } = await generateExercisesPrompt(input);
    if (!output) {
      throw new Error(
        'Failed to generate exercises. The AI model did not return a valid output.'
      );
    }
    return output;
  }
);

// Export a wrapper function to be used as a server action
export async function generateExercises(
  input: GenerateExercisesInput
): Promise<GenerateExercisesOutput> {
  return generateExercisesFlow(input);
}
