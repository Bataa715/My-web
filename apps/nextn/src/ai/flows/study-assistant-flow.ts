'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StudyAssistantInputSchema = z.object({
  question: z.string().describe('The question from the student'),
  imageBase64: z.string().optional().describe('Optional base64 encoded image'),
  context: z
    .string()
    .optional()
    .describe('Previous conversation context if any'),
});

const StudyAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the student question'),
});

export async function askStudyAssistant(input: {
  question: string;
  imageBase64?: string;
  context?: string;
}): Promise<{ answer: string }> {
  const systemPrompt = `Та Монгол хэлээр хариулдаг хичээлийн туслах AI байна. 
Таны үүрэг бол оюутнуудад хичээлтэй холбоотой асуултуудад тусалж хариу өгөх.

Онцгой чиглэлүүд:
- Анагаах ухаан (Анатоми, Физиологи, Өвчин судлал, Эмчилгээ)
- Биологи (Эс судлал, Генетик, Экологи)
- Математик
- Физик
- Химич
- Программчлал
- Англи хэл

Хариултын дүрэм:
1. Монгол хэлээр хариулна
2. Тодорхой, ойлгомжтой тайлбар өгнө
3. Жишээ ашиглана
4. Алхам алхмаар тайлбарлана
5. Emoji ашиглаж болно
6. Markdown форматаар бичнэ (bold, list гэх мэт)

Хэрэв зураг илгээсэн бол зургийг нарийвчлан шинжилж, асуултад холбогдуулан хариулна.`;

  try {
    let prompt = input.question;

    if (input.context) {
      prompt = `Өмнөх яриа:\n${input.context}\n\nШинэ асуулт: ${input.question}`;
    }

    // If image is provided, use multimodal
    if (input.imageBase64) {
      const result = await ai.generate({
        system: systemPrompt,
        prompt: [
          {
            media: {
              contentType: 'image/jpeg',
              url: input.imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      });

      return { answer: result.text };
    }

    // Text only
    const result = await ai.generate({
      system: systemPrompt,
      prompt: prompt,
    });

    return { answer: result.text };
  } catch (error) {
    console.error('Study assistant error:', error);

    // More specific error messages
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes('API key') ||
      errorMessage.includes('apiKey') ||
      errorMessage.includes('GOOGLE')
    ) {
      throw new Error(
        'Google AI API key тохируулаагүй байна. .env файлд GOOGLE_GENAI_API_KEY нэмнэ үү.'
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      throw new Error(
        'API хязгаарлалтад хүрсэн. Түр хүлээгээд дахин оролдоно уу.'
      );
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new Error('Сүлжээний алдаа. Интернет холболтоо шалгана уу.');
    }

    throw new Error(`AI хариу авахад алдаа гарлаа: ${errorMessage}`);
  }
}
