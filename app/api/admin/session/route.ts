import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, missingAdminEnv, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Panelin oturum/yapılandırma durumu — admin arayüzü ilk açılışta bunu çağırır. */
export async function GET() {
  const store = await cookies();
  return NextResponse.json({
    configured: adminConfigured(),
    missing: missingAdminEnv(),
    authenticated: verifySessionToken(store.get(ADMIN_COOKIE)?.value),
    repo: process.env.GITHUB_REPO ?? "OrcunSamiTandogan/res-yummy",
    branch: process.env.GITHUB_BRANCH ?? "master",
  });
}
