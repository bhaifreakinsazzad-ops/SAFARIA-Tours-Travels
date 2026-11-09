// ==============================================================================
// SAFARIA Tours & Travels — Cron Route for Outbox Dispatching
// Triggered by scheduled background runners or manual ops button
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { outboxDispatcher } from "@server/crm/outboxDispatcher";
import { extractSessionFromRequest } from "@server/auth/authService";
import { getErrorMessage } from "@server/utils/errorMessage";

async function dispatchAndRespond() {
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
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}

/**
 * Vercel Cron Jobs issue a GET request with `Authorization: Bearer <CRON_SECRET>`
 * (see vercel.json's `crons` entry for this route) — this is the entry point
 * that actually gets invoked on a schedule once deployed. Without CRON_SECRET
 * configured, this path is unreachable (no insecure fallback).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const configuredCronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    Boolean(configuredCronSecret) && authHeader === `Bearer ${configuredCronSecret}`;

  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized dispatch request" }, { status: 401 });
  }

  return dispatchAndRespond();
}

/**
 * Manual trigger path for an authenticated staff session (e.g. an "Ops" button
 * in /admin) or a test harness using the shared CRON_SECRET / test key.
 */
export async function POST(req: NextRequest) {
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

  return dispatchAndRespond();
}
