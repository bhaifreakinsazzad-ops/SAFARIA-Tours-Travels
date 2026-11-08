import { describe, it, expect, beforeEach } from "vitest";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { outboxDispatcher } from "@/lib/crm/outboxDispatcher";

describe("GoHighLevel Outbox Dispatcher & Failure Monitor", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
  });

  it("should process and mark pending outbox entries as DELIVERED", async () => {
    await enquiriesRepository.enqueueOutbox(
      "GHL_CRM",
      "FLIGHT_ENQUIRY_CREATED",
      { ref: "SFR-12345", lead: "Arif" },
      "idempotency_key_1"
    );

    const summary = await outboxDispatcher.processPendingQueue(10);
    expect(summary.processed).toBe(1);
    expect(summary.delivered).toBe(1);
    expect(summary.failed).toBe(0);
    expect(summary.providerMode).toBe("STAGING_MOCK_DISPATCHER");
    expect(summary.skippedDueToConcurrency).toBe(false);

    // Verify status in repository
    const pendingRemaining = await enquiriesRepository.listPendingOutboxEntries(10);
    expect(pendingRemaining.length).toBe(0);
  });

  it("should prevent race conditions via concurrency lock", async () => {
    // Simulate concurrent runner
    const p1 = outboxDispatcher.processPendingQueue(10);
    const p2 = outboxDispatcher.processPendingQueue(10);

    const [res1, res2] = await Promise.all([p1, p2]);

    // One of them should succeed normally and the concurrent one should be guarded
    expect(res1.skippedDueToConcurrency || res2.skippedDueToConcurrency).toBe(true);
  });

  it("should mark outbox entry as FAILED when max retry limit (5) is exceeded", async () => {
    const entry = await enquiriesRepository.enqueueOutbox(
      "GHL_CRM",
      "RETRY_TEST",
      { ref: "SFR-FAIL" },
      "idempotency_key_fail"
    );

    // Set attempts to 4 manually
    await enquiriesRepository.updateOutboxStatus(entry.id, "PENDING", 4);

    // Process next attempt -> 5th attempt triggers permanent failure
    const summary = await outboxDispatcher.processPendingQueue(10);
    expect(summary.failed).toBe(1);

    const pendingRemaining = await enquiriesRepository.listPendingOutboxEntries(10);
    expect(pendingRemaining.length).toBe(0);
  });
});
