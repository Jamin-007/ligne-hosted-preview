import { health } from "@/lib/demo-backend";
export async function GET() { return health(); }
