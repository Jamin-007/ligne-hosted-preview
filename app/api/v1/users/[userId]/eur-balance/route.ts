import { getBalance } from "@/lib/demo-backend";
export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  return getBalance(userId);
}
