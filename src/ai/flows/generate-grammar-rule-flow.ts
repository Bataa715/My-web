'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Grammar format types
export type GrammarFormat =
  | 'tense'
  | 'conditional'
  | 'modal'
  | 'particle'
  | 'general';

const GrammarUsageSchema = z.object({
  condition: z.string().describe('When to use this grammar rule'),
  example: z.string().describe('Example sentence demonstrating the usage'),
});

const GrammarFormSchema = z.object({
  regular: z.string().describe('Regular form rules in Markdown'),
  irregular: z.string().describe('Irregular form rules in Markdown'),
});

const GrammarStructureItemSchema = z.object({
  formula: z.string().describe('Grammar formula, can include Markdown tables'),
  examples: z.array(z.string()).describe('Example sentences'),
});

const GrammarStructureSchema = z.object({
  positive: GrammarStructureItemSchema,
  negative: GrammarStructureItemSchema,
  question: GrammarStructureItemSchema,
});

const TimeExpressionSchema = z.object({
  word: z.string().describe('Time expression word or phrase'),
  translation: z.string().describe('Mongolian translation'),
});

const PracticeQuestionSchema = z.object({
  question: z.string().describe('Practice question'),
  options: z.array(z.string()).describe('Multiple choice options'),
  correctAnswer: z.string().describe('The correct answer'),
  explanation: z.string().describe('Explanation in Mongolian'),
});

const GenerateGrammarRuleInputSchema = z.object({
  ruleName: z.string().describe('Name of the grammar rule to generate'),
  language: z.enum(['english', 'japanese']).describe('Target language'),
  format: z
    .enum(['tense', 'conditional', 'modal', 'particle', 'general'])
    .describe('Grammar format type'),
});
export type GenerateGrammarRuleInput = z.infer<
  typeof GenerateGrammarRuleInputSchema
>;

const GenerateGrammarRuleOutputSchema = z.object({
  title: z.string().describe('Title of the grammar rule'),
  category: z.string().describe('Category like Tense, Conditional, etc'),
  introduction: z
    .string()
    .describe('Brief introduction in Mongolian explaining when to use this'),
  usage: z
    .array(GrammarUsageSchema)
    .describe('List of usage conditions with examples'),
  form: GrammarFormSchema.describe(
    'Form rules for regular and irregular verbs'
  ),
  structure: GrammarStructureSchema.describe(
    'Structure formulas for positive, negative, and question forms'
  ),
  timeExpressions: z
    .array(TimeExpressionSchema)
    .describe('Common time expressions used with this grammar'),
  practice: z
    .array(PracticeQuestionSchema)
    .describe('Practice questions with multiple choice'),
});
export type GenerateGrammarRuleOutput = z.infer<
  typeof GenerateGrammarRuleOutputSchema
>;

const generateGrammarRulePrompt = ai.definePrompt({
  name: 'generateGrammarRulePrompt',
  input: { schema: GenerateGrammarRuleInputSchema },
  output: { schema: GenerateGrammarRuleOutputSchema },
  prompt: `
You are an expert {{language}} language teacher specialized in creating comprehensive grammar lessons.
Generate a complete grammar rule for "{{ruleName}}" in {{format}} format.

The response should be educational and comprehensive for Mongolian learners.

Guidelines based on format type "{{format}}":

For "tense" format:
- Focus on verb conjugations and time-related usage
- Include clear positive/negative/question structures with tables
- Add relevant time expressions
- Structure formulas should use Markdown tables like:
  | Subject | Verb |
  | --- | --- |
  | I/You | base form |
  | He/She | verb + s/es |

For "conditional" format:
- Focus on condition clauses (if clauses)
- Show the structure of condition and result clauses
- Include examples for real and unreal conditions

For "modal" format:
- Focus on modal verb usage and meanings
- Show how modal affects the main verb
- Include common expressions with this modal

For "particle" format:
- Focus on particle usage in Japanese
- Show position in sentence
- Include common combinations

For "general" format:
- Create a flexible structure suitable for the grammar point
- Adapt formulas to fit the specific rule

Apply only the guidelines that match the format "{{format}}".

Important:
1. All explanations and translations should be in Mongolian
2. All example sentences should be in {{language}}
3. Use Markdown formatting for better readability (tables, bold, code blocks)
4. Generate 3-5 usage conditions
5. Generate 5-8 time expressions
6. Generate 3-4 practice questions with 4 options each
7. Make formulas clear with Markdown tables when appropriate

Generate the complete grammar rule now:
  `,
});

const generateGrammarRuleFlow = ai.defineFlow(
  {
    name: 'generateGrammarRuleFlow',
    inputSchema: GenerateGrammarRuleInputSchema,
    outputSchema: GenerateGrammarRuleOutputSchema,
  },
  async input => {
    const { output } = await generateGrammarRulePrompt(input);
    if (!output) {
      throw new Error(
        'Failed to generate grammar rule. The AI model did not return a valid output.'
      );
    }
    return output;
  }
);

// Export a wrapper function to be used as a server action
export async function generateGrammarRule(
  input: GenerateGrammarRuleInput
): Promise<GenerateGrammarRuleOutput> {
  return generateGrammarRuleFlow(input);
}
