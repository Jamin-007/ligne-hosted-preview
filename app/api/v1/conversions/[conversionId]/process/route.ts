import { processConversion } from "@/lib/demo-backend";
export async function POST(_request: Request, context: { params: Promise<{ conversionId: string }> }) {
  const { conversionId } = await context.params;
  return processConversion(conversionId);
}
