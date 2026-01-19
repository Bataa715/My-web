'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratedJapaneseWordSchema = z.object({
  word: z.string().describe('The Japanese word (kanji/hiragana/katakana).'),
  romaji: z.string().describe('The romaji (romanized) reading of the word.'),
  meaning: z.string().describe('The Mongolian meaning/translation of the word.'),
});

// Define the schema for the flow's input
const AutoGenerateJapaneseVocabularyInputSchema = z.object({
  topic: z
    .string()
    .describe(
      'The topic or content area for vocabulary generation (e.g., "daily life", "travel", "food")'
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
export type AutoGenerateJapaneseVocabularyInput = z.infer<
  typeof AutoGenerateJapaneseVocabularyInputSchema
>;

// Define the schema for the flow's output
const AutoGenerateJapaneseVocabularyOutputSchema = z.object({
  words: z.array(GeneratedJapaneseWordSchema),
});
export type AutoGenerateJapaneseVocabularyOutput = z.infer<
  typeof AutoGenerateJapaneseVocabularyOutputSchema
>;

const autoGenerateJapaneseVocabularyPrompt = ai.definePrompt({
  name: 'autoGenerateJapaneseVocabularyPrompt',
  input: { schema: AutoGenerateJapaneseVocabularyInputSchema },
  output: { schema: AutoGenerateJapaneseVocabularyOutputSchema },
  prompt: `
    You are a Japanese vocabulary teacher creating a word list for Japanese learners.
    
    Generate exactly {{count}} Japanese vocabulary words related to the topic: "{{topic}}"
    {{#if level}}
    Difficulty level: {{level}}
    - beginner: common, everyday words (JLPT N5-N4 level), mostly hiragana/katakana
    - intermediate: moderately complex words (JLPT N3-N2 level), mix of kanji and kana
    - advanced: sophisticated vocabulary (JLPT N2-N1 level), kanji-heavy words
    {{/if}}

    Requirements:
    1. Each word must be unique and relevant to the topic.
    2. The 'word' field MUST be in Japanese (kanji, hiragana, or katakana as appropriate).
    3. The 'romaji' field MUST be accurate romanization of the word.
    4. The 'meaning' field MUST be in Mongolian (accurate translation).
    5. Words should be practical and useful for Japanese language learners.
    6. Include a mix of nouns (名詞), verbs (動詞), adjectives (形容詞), and adverbs (副詞) where appropriate.
    7. For verbs, use dictionary form (辞書形).
    8. For beginner level, prefer words written in hiragana/katakana.

    Examples:
    - { "word": "食べる", "romaji": "taberu", "meaning": "идэх" }
    - { "word": "おいしい", "romaji": "oishii", "meaning": "амттай" }
    - { "word": "電車", "romaji": "densha", "meaning": "галт тэрэг" }

    Return exactly {{count}} words as a JSON object following the output schema.
  `,
});

const autoGenerateJapaneseVocabularyFlow = ai.defineFlow(
  {
    name: 'autoGenerateJapaneseVocabularyFlow',
    inputSchema: AutoGenerateJapaneseVocabularyInputSchema,
    outputSchema: AutoGenerateJapaneseVocabularyOutputSchema,
  },
  async input => {
    const { output } = await autoGenerateJapaneseVocabularyPrompt(input);
    if (!output) {
      throw new Error(
        'Failed to auto-generate Japanese vocabulary. The AI model did not return a valid output.'
      );
    }
    return output;
  }
);

// Export a wrapper function to be used as a server action
export async function autoGenerateJapaneseVocabulary(
  input: AutoGenerateJapaneseVocabularyInput
): Promise<AutoGenerateJapaneseVocabularyOutput> {
  return autoGenerateJapaneseVocabularyFlow(input);
}
