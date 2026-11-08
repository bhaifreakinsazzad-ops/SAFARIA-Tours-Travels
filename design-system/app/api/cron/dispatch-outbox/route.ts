// ==============================================================================
// SAFARIA Tours & Travels — Cron Route for Outbox Dispatching
// Triggered by scheduled background runners or manual ops button
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { outboxDispatcher } from "@/lib/crm/outboxDispatcher";
import { extractSessionFromRequest } from "@/lib/auth/authService";

export async function POST(req: NextRequest) {
  // Verify authorization: either admin session, valid CRON_SECRET, or test environment key
  const cronSecret = req.headers.get("x-cron-secret");
  const configuredCronSecret = process.env.CRON_SECRET;
  const session = extractSessionFromRequest(req);

  const isAuthorized =
    (Boolean(configuredCronSecret) && cronSecret === configuredCronSecret) ||
    (session && (session.role === "SUPER_ADMIN" || session.role === "OPS_AGENT")) ||
    (process.env.NODE_ENV === "test" && cronSecret === "safaria-cron-secret-2026");

  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized dispatch request" }, { status: 401 });
  }

  try {
    const summary = await outboxDispatcher.processPendingQueue(25);
    const simulated = summary.providerMode === "STAGING_MOCK_DISPATCHER";
    return NextResponse.json({
      success: true,
      summary,
      isSimulatedMode: simulated,
      notice: simulated
        ? "SIMULATION NOTICE: Dispatched using Staging Mock Dispatcher. Third-party live delivery requires production GHL_API_KEY and GHL_LOCATION_ID."
        : "LIVE DELIVERY: Dispatched to GoHighLevel CRM API v2.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
