import { proxy as proxyLogic } from "@/lib/middleware-proxy";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await proxyLogic(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
