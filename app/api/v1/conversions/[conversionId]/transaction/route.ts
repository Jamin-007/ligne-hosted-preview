import { registerTransaction } from "@/lib/demo-backend";
export async function POST(request: Request, context: { params: Promise<{ conversionId: string }> }) {
  const { conversionId } = await context.params;
  return registerTransaction(conversionId, request);
}
