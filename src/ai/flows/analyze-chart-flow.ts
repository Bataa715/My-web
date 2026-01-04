
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
  analysis: z.string().describe("Графикийн техник шинжилгээний дэлгэрэнгүй тайлбар. Ямар патерн, индикатор ашигласан, дэмжих болон эсэргүүцэх гол түвшнүүд, мөн яагаад ийм дохио гарсныг болон stop-loss/take-profit цэгүүдийг яагаад тэнд тавих нь зүйтэйг тайлбарлана."),
  signal: z.enum(['BUY', 'SELL', 'HOLD']).describe("Шинжилгээнээс гарсан арилжааны дохио (АВАХ, ЗАРАХ, ХҮЛЭЭХ)."),
  confidence: z.number().min(0).max(100).describe("Дохионы итгэлцлийн хувь (0-100)."),
  suggestedStopLoss: z.number().describe("Санал болгож буй алдагдлыг зогсоох (stop-loss) цэгийн ханш."),
  suggestedTakeProfit: z.number().describe("Санал болгож буй ашгийг авах (take-profit) цэгийн ханш."),
});
export type ChartAnalysisOutput = z.infer<typeof ChartAnalysisOutputSchema>;


const analyzeChartPrompt = ai.definePrompt({
    name: 'analyzeChartPrompt',
    input: { schema: ChartAnalysisInputSchema },
    output: { schema: ChartAnalysisOutputSchema },
    prompt: `Та бол зөвхөн Алтны (XAU/USD) ханшийн техник шинжилгээгээр мэргэшсэн, олон жилийн туршлагатай мэргэжлийн арилжаачин. Таны үүрэг бол оруулсан зургийг шинжлээд, МОНГОЛ хэл дээр, маш дэлгэрэнгүй, ойлгомжтой зөвлөгөө өгөх.

Дараах зургийг шинжилнэ үү:

1.  **Техник шинжилгээ хийх:** Гол патернууд (жишээ нь, head and shoulders, double top/bottom), индикаторууд (RSI, MACD, Moving Averages), мөн дэмжих (support) болон эсэргүүцэх (resistance) түвшнүүдийг тодорхойл.
2.  **Дохио гаргах:** Дээрх шинжилгээндээ үндэслэн **АВАХ (BUY)**, **ЗАРАХ (SELL)**, эсвэл **ХҮЛЭЭХ (HOLD)** гэсэн маш тодорхой дохиог гарга.
3.  **Итгэлцлийн хувь (Confidence Score):** Гаргасан дохиондоо хэр итгэлтэй байгаагаа 0-100 хооронд үнэл.
4.  **Stop-Loss ба Take-Profit:** Алдагдлыг зогсоох (Stop-Loss) болон Ашгийг авах (Take-Profit) цэгүүдийг яг таг тодорхойл.
5.  **Дэлгэрэнгүй тайлбар:** "analysis" талбарт дээрх бүх зүйлээ нэгтгэн, яагаад ийм дохио гаргасан, SL/TP цэгүүдийг яагаад эдгээр түвшинд тавьж байгааг энгийн үгээр, дэлгэрэнгүй тайлбарлаж бич.

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
