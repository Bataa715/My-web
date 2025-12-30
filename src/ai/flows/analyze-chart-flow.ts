
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChartAnalysisInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A screenshot of a financial chart, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ChartAnalysisInput = z.infer<typeof ChartAnalysisInputSchema>;

const ChartAnalysisOutputSchema = z.object({
  analysis: z.string().describe("A detailed technical analysis of the chart, including identified patterns, indicators, and key price levels (support/resistance)."),
  signal: z.enum(['BUY', 'SELL', 'HOLD']).describe("The trading signal derived from the analysis."),
  confidence: z.number().min(0).max(100).describe("The confidence level of the signal, from 0 to 100."),
  suggestedStopLoss: z.number().describe("A suggested price level for a stop-loss order."),
  suggestedTakeProfit: z.number().describe("A suggested price level for a take-profit order."),
});
export type ChartAnalysisOutput = z.infer<typeof ChartAnalysisOutputSchema>;


const analyzeChartPrompt = ai.definePrompt({
    name: 'analyzeChartPrompt',
    input: { schema: ChartAnalysisInputSchema },
    output: { schema: ChartAnalysisOutputSchema },
    prompt: `You are an expert financial analyst with years of experience specializing in the technical analysis of Gold (XAU/USD) charts.

Analyze the provided chart image of Gold (XAU/USD). Identify key patterns (e.g., head and shoulders, double top/bottom, triangles), read indicators (like RSI, MACD, Moving Averages if visible), and determine critical support and resistance levels.

Based on your comprehensive analysis, provide a clear trading signal (BUY, SELL, or HOLD), a confidence score (0-100) for this signal, and suggest precise stop-loss and take-profit levels that are highly relevant for Gold trading.

Image to analyze:
{{media url=imageDataUri}}
`,
});

const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: ChartAnalysisInputSchema,
    outputSchema: ChartAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeChartPrompt(input);
    if (!output) {
      throw new Error('Failed to get a chart analysis from the AI model.');
    }
    return output;
  }
);

export async function analyzeChart(input: ChartAnalysisInput): Promise<ChartAnalysisOutput> {
  return analyzeChartFlow(input);
}
