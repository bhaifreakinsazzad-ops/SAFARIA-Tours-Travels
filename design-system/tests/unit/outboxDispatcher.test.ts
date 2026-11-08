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

    // Verify status in repository
    const pendingRemaining = await enquiriesRepository.listPendingOutboxEntries(10);
    expect(pendingRemaining.length).toBe(0);
  });

  it("should prevent double deliveries via database-coordinated job claiming", async () => {
    await enquiriesRepository.enqueueOutbox(
      "GHL_CRM",
      "CONCURRENT_TEST",
      { ref: "SFR-CONC" },
      "idemp_conc_1"
    );

    // Run two concurrent dispatchers
    const p1 = outboxDispatcher.processPendingQueue(10, "worker-1");
    const p2 = outboxDispatcher.processPendingQueue(10, "worker-2");

    const [res1, res2] = await Promise.all([p1, p2]);

    // Exactly one worker claims the single pending job, total delivered = 1, zero double-deliveries
    expect(res1.delivered + res2.delivered).toBe(1);
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
