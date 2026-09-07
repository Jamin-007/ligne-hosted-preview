import { createQuote } from "@/lib/demo-backend";
export async function POST(request: Request) { return createQuote(request); }
