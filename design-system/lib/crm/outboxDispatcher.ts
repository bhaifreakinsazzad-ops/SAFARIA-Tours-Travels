// ==============================================================================
// SAFARIA Tours & Travels — Outbox Queue Dispatcher & Failure Monitor
// Processes pending CRM and webhook tasks with exponential backoff and idempotency
// ==============================================================================

import { enquiriesRepository, StoredOutboxEntry } from "@/lib/db/enquiriesRepository";

export interface DispatchSummary {
  processed: number;
  delivered: number;
  retried: number;
  failed: number;
  workerId?: string;
  skippedDueToConcurrency?: boolean;
  providerMode: "LIVE_GHL_API" | "STAGING_MOCK_DISPATCHER";
  timestamp: string;
}

export const outboxDispatcher = {
  /**
   * Process pending outbox entries using atomic database-coordinated job claiming
   * Prevents duplicate deliveries across distributed workers and recovers expired leases
   */
  async processPendingQueue(
    batchSize: number = 20,
    workerId: string = `worker-${crypto.randomUUID()}`
  ): Promise<DispatchSummary> {
    const isLive = Boolean(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID);
    const providerMode: "LIVE_GHL_API" | "STAGING_MOCK_DISPATCHER" = isLive
      ? "LIVE_GHL_API"
      : "STAGING_MOCK_DISPATCHER";

    // Atomically claim pending entries with 120-second lease timeout
    const claimedEntries = await enquiriesRepository.claimOutboxBatch(workerId, batchSize, 120);

    let delivered = 0;
    let retried = 0;
    let failed = 0;

    for (const entry of claimedEntries) {
      const attempts = entry.attempts + 1;

      // Check max attempts cutoff (5 attempts)
      if (attempts >= 5) {
        await enquiriesRepository.updateOutboxStatus(
          entry.id,
          "FAILED",
          attempts,
          "Permanent failure: Exceeded 5 retry attempts."
        );
        failed++;
        continue;
      }

      try {
        // Attempt delivery (Live GHL or honest Staging Mock)
        const success = await this.deliverEntry(entry);

        if (success) {
          await enquiriesRepository.updateOutboxStatus(entry.id, "DELIVERED", attempts);
          delivered++;
        } else {
          throw new Error("Target service unacknowledged");
        }
      } catch (err: any) {
        // Exponential backoff: 2^attempts * 2 seconds
        const backoffSeconds = Math.pow(2, attempts) * 2;
        const nextRetry = new Date(Date.now() + backoffSeconds * 1000).toISOString();

        await enquiriesRepository.updateOutboxStatus(
          entry.id,
          "PENDING",
          attempts,
          err.message || "Delivery error",
          nextRetry
        );
        retried++;
      }
    }

    return {
      processed: claimedEntries.length,
      delivered,
      retried,
      failed,
      workerId,
      providerMode,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Internal deliver handler
   */
  async deliverEntry(entry: StoredOutboxEntry): Promise<boolean> {
    const apiKey = process.env.GHL_API_KEY || process.env.GHL_ACCESS_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;

    if (!apiKey || !locationId) {
      // In staging/development test mode, mock dispatch successfully resolves
      return true;
    }

    // Live GHL API call
    const res = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-07-28",
      },
      body: JSON.stringify({
        locationId,
        ...entry.payload,
      }),
    });

    return res.ok;
  },
};
