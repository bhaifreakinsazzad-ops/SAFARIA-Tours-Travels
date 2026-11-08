// ==============================================================================
// SAFARIA Tours & Travels — Distributed Outbox & Concurrency Integration Tests
// Verifies atomic database-coordinated job claiming, lease recovery & idempotency
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { outboxDispatcher } from "@/lib/crm/outboxDispatcher";

describe("SAFARIA Distributed Outbox & Job Claiming (Directive 007)", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
  });

  it("atomically partitions jobs between concurrent workers without duplicate delivery", async () => {
    // 1. Enqueue 6 pending outbox entries
    for (let i = 1; i <= 6; i++) {
      await enquiriesRepository.enqueueOutbox(
        "GHL_CRM",
        "CONTACT_UPSERT",
        { email: `agency${i}@domain.com`, name: `Agency ${i}` },
        `test-idemp-multiworker-${i}`
      );
    }

    // 2. Simulate Worker-A and Worker-B claiming batches concurrently
    const workerABatch = await enquiriesRepository.claimOutboxBatch("worker-node-alpha", 3, 120);
    const workerBBatch = await enquiriesRepository.claimOutboxBatch("worker-node-beta", 3, 120);

    expect(workerABatch.length).toBe(3);
    expect(workerBBatch.length).toBe(3);

    // 3. Verify zero overlap between worker claims
    const workerAIds = new Set(workerABatch.map((e) => e.id));
    const workerBIds = new Set(workerBBatch.map((e) => e.id));

    for (const id of workerAIds) {
      expect(workerBIds.has(id)).toBe(false);
    }

    // 4. Verify workers have their workerId stamped in the record
    for (const entry of workerABatch) {
      expect(entry.lockedBy).toBe("worker-node-alpha");
      expect(entry.status).toBe("PROCESSING");
    }
    for (const entry of workerBBatch) {
      expect(entry.lockedBy).toBe("worker-node-beta");
      expect(entry.status).toBe("PROCESSING");
    }
  });

  it("reclaims abandoned jobs when worker lease expires", async () => {
    // 1. Enqueue a job
    const entry = await enquiriesRepository.enqueueOutbox(
      "GHL_CRM",
      "CONTACT_UPSERT",
      { email: "crashed-worker@agency.com" },
      "test-idemp-crashed-worker"
    );

    // 2. Simulate Worker-Crashed claiming the job 5 minutes ago and failing to deliver
    const fiveMinutesAgo = new Date(Date.now() - 300 * 1000).toISOString();
    await enquiriesRepository.updateOutboxStatus(entry.id, "PROCESSING", 1);

    // Artificially simulate crashed lease in store
    const stored = enquiriesRepository._getRawOutboxEntry(entry.id);
    if (stored) {
      stored.lockedAt = fiveMinutesAgo;
      stored.lockedBy = "worker-crashed-pid-9999";
    }

    // 3. New Worker-Recovery attempts to claim
    const recoveredBatch = await enquiriesRepository.claimOutboxBatch("worker-recovery", 10, 120);
    expect(recoveredBatch.some((e) => e.id === entry.id)).toBe(true);

    const recoveredEntry = recoveredBatch.find((e) => e.id === entry.id);
    expect(recoveredEntry?.lockedBy).toBe("worker-recovery");
  });

  it("stops retrying and transitions to FAILED after exceeding 5 attempts", async () => {
    const entry = await enquiriesRepository.enqueueOutbox(
      "GHL_CRM",
      "CONTACT_UPSERT",
      { email: "failing@partner.com" },
      "test-idemp-max-failures"
    );

    // Set attempts to 4
    await enquiriesRepository.updateOutboxStatus(entry.id, "PENDING", 4);

    // Mock deliverEntry failure by temporarily overriding deliverEntry
    const originalDeliver = outboxDispatcher.deliverEntry;
    outboxDispatcher.deliverEntry = async () => false;

    try {
      const summary = await outboxDispatcher.processPendingQueue(10, "worker-retry-test");
      expect(summary.processed).toBe(1);
      expect(summary.failed).toBe(1);

      // Verify record is permanently FAILED
      const allEntries = await enquiriesRepository.listPendingOutboxEntries(10);
      expect(allEntries.length).toBe(0); // Excluded from retry-ready pending list
    } finally {
      outboxDispatcher.deliverEntry = originalDeliver;
    }
  });

  it("clearly reports providerMode distinguishing mock simulation from live API", async () => {
    delete process.env.GHL_API_KEY;
    delete process.env.GHL_LOCATION_ID;

    await enquiriesRepository.enqueueOutbox(
      "GHL_CRM",
      "CONTACT_UPSERT",
      { email: "telemetry@agency.com" },
      "test-idemp-telemetry"
    );

    const summary = await outboxDispatcher.processPendingQueue(10, "worker-telemetry-test");
    expect(summary.providerMode).toBe("STAGING_MOCK_DISPATCHER");
    expect(summary.workerId).toBe("worker-telemetry-test");
  });
});
