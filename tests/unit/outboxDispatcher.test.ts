import { describe, it, expect, beforeEach } from "vitest";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { outboxDispatcher } from "@server/crm/outboxDispatcher";

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

  it("never represents mock delivery as DELIVERED in production when GHL credentials are missing (Directive 015)", async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalKey = process.env.GHL_API_KEY;
    const originalToken = process.env.GHL_ACCESS_TOKEN;
    const originalLoc = process.env.GHL_LOCATION_ID;

    try {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.GHL_API_KEY;
      delete process.env.GHL_ACCESS_TOKEN;
      delete process.env.GHL_LOCATION_ID;

      const delivered = await outboxDispatcher.deliverEntry({
        id: "mock-outbox-001",
        channel: "GHL_CRM",
        eventType: "FLIGHT_ENQUIRY_CREATED",
        payload: { lead: "Test Customer" },
        status: "PROCESSING",
        attempts: 1,
        idempotencyKey: "test-idemp-001",
        nextRetryAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(delivered).toBe(false);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
      if (originalKey) process.env.GHL_API_KEY = originalKey;
      if (originalToken) process.env.GHL_ACCESS_TOKEN = originalToken;
      if (originalLoc) process.env.GHL_LOCATION_ID = originalLoc;
    }
  });
});
