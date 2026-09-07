import { getConversion } from "@/lib/demo-backend";
export async function GET(_request: Request, context: { params: Promise<{ conversionId: string }> }) {
  const { conversionId } = await context.params;
  return getConversion(conversionId);
}
