'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuperChartAnalysisInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A screenshot of a financial chart, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuperChartAnalysisInput = z.infer<typeof SuperChartAnalysisInputSchema>;

// Individual method analysis schema
const MethodAnalysisSchema = z.object({
  signal: z.enum(['BUY', 'SELL', 'HOLD']).describe('Энэ аргаар гарсан дохио'),
  entry: z.number().describe('Орох үнэ'),
  confidence: z.number().min(0).max(100).describe('Итгэлцлийн хувь'),
  reasoning: z.string().describe('Тайлбар'),
});

const SuperChartAnalysisOutputSchema = z.object({
  // Individual method analyses
  traditional: MethodAnalysisSchema.describe('Traditional техник шинжилгээ (Support/Resistance, Trendlines, Moving Averages)'),
  ictSmc: MethodAnalysisSchema.describe('ICT/SMC шинжилгээ (Order Blocks, Fair Value Gaps, Liquidity)'),
  wyckoff: MethodAnalysisSchema.describe('Wyckoff шинжилгээ (Accumulation/Distribution, Spring/Upthrust)'),
  elliottWave: MethodAnalysisSchema.describe('Elliott Wave шинжилгээ (Wave Count, Impulse/Corrective)'),
  fibonacci: MethodAnalysisSchema.describe('Fibonacci шинжилгээ (Retracements, Extensions, Key levels)'),
  
  // Unified result
  unified: z.object({
    direction: z.enum(['BUY', 'SELL']).describe('Нэгдсэн чиглэл'),
    consensusRatio: z.string().describe('Санал нийлсэн харьцаа (жишээ нь: 4/5 арга)'),
    entryPrice: z.number().describe('Орох үнэ'),
    stopLoss: z.number().describe('Stop Loss үнэ'),
    takeProfit1: z.number().describe('Take Profit 1'),
    takeProfit2: z.number().describe('Take Profit 2'),
    overallConfidence: z.number().min(0).max(100).describe('Нийт итгэлцэл'),
    summary: z.string().describe('Нэгдсэн дүгнэлт'),
  }),
});
export type SuperChartAnalysisOutput = z.infer<typeof SuperChartAnalysisOutputSchema>;

const superAnalyzeChartPrompt = ai.definePrompt({
  name: 'superAnalyzeChartPrompt',
  input: { schema: SuperChartAnalysisInputSchema },
  output: { schema: SuperChartAnalysisOutputSchema },
  prompt: `Та бол Алтны (XAU/USD) ханшийн техник шинжилгээгээр мэргэшсэн, олон жилийн туршлагатай мэргэжлийн арилжаачин. Таны үүрэг бол оруулсан зургийг 5 өөр аргаар тус тусад нь шинжлээд, нэгдсэн зөвлөмж гаргах.

## 5 Арга:

### 1. Traditional (Уламжлалт)
- Support/Resistance түвшнүүд
- Trendlines (трендийн шугам)
- Moving Averages (MA, EMA)
- Candlestick patterns

### 2. ICT/SMC (Inner Circle Trader / Smart Money Concepts)
- Order Blocks (OB)
- Fair Value Gaps (FVG)
- Liquidity pools
- Market structure shifts

### 3. Wyckoff
- Accumulation/Distribution хэв маяг
- Spring/Upthrust
- Phase A-E
- Composite Man logic

### 4. Elliott Wave
- Wave count (1-2-3-4-5 болон A-B-C)
- Impulse vs Corrective waves
- Wave degree
- Key Fibonacci relationships

### 5. Fibonacci
- Retracement levels (0.236, 0.382, 0.5, 0.618, 0.786)
- Extension levels (1.272, 1.618, 2.618)
- Confluence zones

---

## Даалгавар:

Дараах зургийг 5 аргаар тус тусад нь шинжилж:

1. **Арга бүрээр:** BUY/SELL/HOLD дохио, орох үнэ, итгэлцэл, товч тайлбар
2. **Нэгдсэн дүгнэлт:** 
   - Олонхийн санал (жишээ нь 4/5 арга BUY гэвэл BUY)
   - Орох үнэ, Stop Loss, Take Profit 1, Take Profit 2
   - Нийт итгэлцлийн хувь
   - Товч дүгнэлт

Image to analyze:
{{media url=imageDataUri}}
`,
});

const superAnalyzeChartFlow = ai.defineFlow(
  {
    name: 'superAnalyzeChartFlow',
    inputSchema: SuperChartAnalysisInputSchema,
    outputSchema: SuperChartAnalysisOutputSchema,
  },
  async input => {
    const { output } = await superAnalyzeChartPrompt(input);
    if (!output) {
      throw new Error('Failed to get a super chart analysis from the AI model.');
    }
    return output;
  }
);

export async function superAnalyzeChart(
  input: SuperChartAnalysisInput
): Promise<SuperChartAnalysisOutput> {
  return superAnalyzeChartFlow(input);
}
