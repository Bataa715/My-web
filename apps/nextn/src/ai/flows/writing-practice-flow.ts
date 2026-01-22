'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Writing check flow
const WritingCheckInputSchema = z.object({
  text: z.string().describe('The text written by the student.'),
  taskType: z
    .enum(['essay', 'email', 'story', 'description', 'opinion', 'free'])
    .default('free'),
});
export type WritingCheckInput = z.infer<typeof WritingCheckInputSchema>;

const WritingCheckOutputSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Overall score out of 100.'),
  correctedText: z.string().describe('The corrected version of the text.'),
  categories: z.object({
    grammar: z.object({
      score: z.number(),
      feedback: z.string(),
      feedbackMongolian: z.string(),
    }),
    vocabulary: z.object({
      score: z.number(),
      feedback: z.string(),
      feedbackMongolian: z.string(),
    }),
    coherence: z.object({
      score: z.number(),
      feedback: z.string(),
      feedbackMongolian: z.string(),
    }),
    style: z.object({
      score: z.number(),
      feedback: z.string(),
      feedbackMongolian: z.string(),
    }),
  }),
  mistakes: z
    .array(
      z.object({
        original: z.string(),
        corrected: z.string(),
        explanation: z.string(),
        explanationMongolian: z.string(),
        type: z.enum([
          'grammar',
          'spelling',
          'punctuation',
          'vocabulary',
          'style',
        ]),
      })
    )
    .describe('Specific mistakes found.'),
  suggestions: z
    .array(
      z.object({
        category: z.string(),
        suggestion: z.string(),
        suggestionMongolian: z.string(),
      })
    )
    .describe('Suggestions for improvement.'),
  strongPoints: z.array(z.string()).describe('What the student did well.'),
});
export type WritingCheckOutput = z.infer<typeof WritingCheckOutputSchema>;

const writingCheckPrompt = ai.definePrompt({
  name: 'writingCheckPrompt',
  input: { schema: WritingCheckInputSchema },
  output: { schema: WritingCheckOutputSchema },
  prompt: `
    You are an expert English writing teacher helping a Mongolian student improve their writing skills.
    Analyze the following text and provide detailed feedback.

    Task Type: {{taskType}}
    
    Student's Text:
    ---
    {{text}}
    ---

    Please provide:
    1. An overall score out of 100
    2. The corrected version of the text (preserve the student's intended meaning)
    3. Scores and feedback for each category (0-100):
       - Grammar: Correctness of grammar usage
       - Vocabulary: Word choice and variety
       - Coherence: Flow and organization
       - Style: Appropriate tone and expression
       - Include feedback in both English and Mongolian
    4. List of specific mistakes with:
       - Original text
       - Corrected version
       - Explanation in English and Mongolian
       - Type of error
    5. 3-5 suggestions for improvement (in English and Mongolian)
    6. 2-3 things the student did well (to encourage them)

    Be encouraging but honest. Focus on helping the student learn from their mistakes.
  `,
});

const writingCheckFlow = ai.defineFlow(
  {
    name: 'writingCheckFlow',
    inputSchema: WritingCheckInputSchema,
    outputSchema: WritingCheckOutputSchema,
  },
  async input => {
    const { output } = await writingCheckPrompt(input);
    if (!output) {
      throw new Error('Failed to check writing.');
    }
    return output;
  }
);

export async function checkWriting(
  input: WritingCheckInput
): Promise<WritingCheckOutput> {
  return writingCheckFlow(input);
}

// Writing prompt generator
const WritingPromptInputSchema = z.object({
  topic: z.string().optional().describe('Optional topic preference.'),
  taskType: z.enum(['essay', 'email', 'story', 'description', 'opinion']),
  level: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .default('intermediate'),
});
export type WritingPromptInput = z.infer<typeof WritingPromptInputSchema>;

const WritingPromptOutputSchema = z.object({
  prompt: z.string().describe('The writing prompt/task.'),
  promptMongolian: z.string().describe('Mongolian translation.'),
  wordCount: z.object({
    min: z.number(),
    max: z.number(),
  }),
  tips: z
    .array(
      z.object({
        tip: z.string(),
        tipMongolian: z.string(),
      })
    )
    .describe('Writing tips for this task.'),
  usefulVocabulary: z
    .array(
      z.object({
        word: z.string(),
        meaning: z.string(),
      })
    )
    .describe('Useful vocabulary for this topic.'),
  exampleOpening: z.string().describe('An example opening sentence.'),
});
export type WritingPromptOutput = z.infer<typeof WritingPromptOutputSchema>;

const writingPromptPrompt = ai.definePrompt({
  name: 'writingPromptPrompt',
  input: { schema: WritingPromptInputSchema },
  output: { schema: WritingPromptOutputSchema },
  prompt: `
    You are an English writing teacher. Generate a writing prompt for a Mongolian student.

    Task Type: {{taskType}}
    Level: {{level}}
    {{#if topic}}Topic Preference: {{topic}}{{/if}}

    Provide:
    1. A clear, engaging writing prompt (in English and Mongolian)
    2. Suggested word count range
    3. 4-6 writing tips (bilingual)
    4. 6-10 useful vocabulary words for this topic
    5. An example opening sentence to inspire them

    Make the prompt interesting and relevant to everyday life.
  `,
});

const writingPromptFlow = ai.defineFlow(
  {
    name: 'writingPromptFlow',
    inputSchema: WritingPromptInputSchema,
    outputSchema: WritingPromptOutputSchema,
  },
  async input => {
    const { output } = await writingPromptPrompt(input);
    if (!output) {
      throw new Error('Failed to generate writing prompt.');
    }
    return output;
  }
);

export async function generateWritingPrompt(
  input: WritingPromptInput
): Promise<WritingPromptOutput> {
  return writingPromptFlow(input);
}
